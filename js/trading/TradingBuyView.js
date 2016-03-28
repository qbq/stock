'use strict'

define([
    'jquery',
    'text!trading/TradingBuyTpl.html',
    'search/SearchView',
    'search/SearchModel',
    'Constants'
], function(
    $,
    TradingBuyTpl,
    SearchView,
    SearchModel,
    Constants
) {

	var TradingBuyView = Backbone.View.extend({

        events: {
            'blur .search-box': 'fetchStockInfo',
            'change #price': 'recaculateStockInfo',
            'change #buyQty': 'validateStockInfo',
            'click #decreasePrice': 'decreasePrice',
            'click #increasePrice': 'increasePrice',
            'click #decreaseQty': 'decreaseQty',
            'click #increaseQty': 'increaseQty',
            'click .buy-qty-selector': 'changeQty',
            'click #buy': 'buy',
            'click #resetAll': 'resetAll'
        },

        el: '#bodyContainer',
        template: _.template(TradingBuyTpl),

        initialize: function (options) {
            this.code = options.code || 'SH601519';
            this.name = options.name || '大智慧';
        	_.bindAll(this,
                'render',
                'fetchStockInfo',
                'parseStockAndCapitalData',
                'refreshStockInfo',
                'resetAll',
                'recaculateStockInfo',
                'validateStockInfo',
                'decreasePrice',
                'increasePrice',
                'decreaseQty',
                'increaseQty',
                'changeQty',
                'buy');
            this.model.bind('change', this.render, this);
        	this.model.fetch();
        },

        render: function () {
        	this.$el.html(this.template({
                "trading": this.model.toJSON(),
                "code": this.code,
                "name": this.name
            }));
            this.renderSearch();
            this.initializeEls();
            this.fetchStockInfo();
            return this;
        },

        initializeEls: function() {
            this.els = {
                $tradingAccount: this.$('#tradingAccount'),
                $price: this.$('#price'),
                $avaliableQty: this.$('#avaliableQty'),
                $buyQty: this.$('#buyQty'),
                $confirmQty: this.$('#confirmQty'),
                $searchBox: this.$('.search-box'),
                $quoteName: this.$('#quoteName'),
                $buyButton: this.$('#buy'),
                $resetAllButton: this.$('#resetAll')
            };
        },

        buy: function() {
            var capitalid  = this.els.$tradingAccount.val(),
                productcode = this.els.$searchBox.val(),
                ordertype = 'R',
                buysell = 'B',
                orderprice = this.els.$price.val(),
                orderamount = this.els.$buyQty.val();
            $.getJSON({
                url: Constants.MAKE_ORDER_URL,
                data: {
                    capitalid: capitalid,
                    productcode: productcode,
                    ordertype: ordertype,
                    buysell: buysell,
                    orderprice: orderprice,
                    orderamount: orderamount * 100
                }
            }).success(this.buyResult)
            .error(this.buyError);
        },

        buyResult: function(data) {
            if (data && data.RepCounterRsp[0].RspNo === 0) {
                alert('交易成功');
                location.hash = 'order/today';
            } else {
                alert('交易失败: ' + data.RepCounterRsp[0].RspDesc);
            }
        },

        buyError: function(err) {
            alert('交易失败: ' + err.responseText || '服务器异常.');
        },

        renderSearch: function() {
            this.searchView = new SearchView({
                el: $('.search-group'),
                code: this.code,
                name: this.name,
                selectFn: this.selectFn
            }).render();
        },

        selectFn: function( event, ui ) {
            location.hash = '/tradingBuy/' + ui.item.DaiMa + '/' + ( ui.item.MingCheng || ui.item.ShuXing || '' );
        },

        resetAll: function() {
            this.els.$price.val(this.ZuiXinJia);
            this.refreshStockInfo(this.ZuiXinJia, this.availCapital);
        },

        fetchStockInfo: function() {
            var stockInfoDefer = $.getJSON(Constants.TRADE_INFO_URL, {
                    obj: this.els.$searchBox.val(),
                    field: 'ZuiXinJia',
                    token: Constants.ACCESS_TOKEN
                }),
                capitalDefer = $.getJSON(Constants.QUERY_CAPITAL_URL, {capitalid: this.els.$tradingAccount.val()});
            $.when(stockInfoDefer, capitalDefer).then(this.parseStockAndCapitalData);
        },

        parseStockAndCapitalData: function(stockData, capitalData) {
            if (stockData
                && stockData[0].Data
                && stockData[0].Data.RepDataStkData
                && stockData[0].Data.RepDataStkData[0]
                && stockData[0].Data.RepDataStkData[0].ZuiXinJia) {
                this.ZuiXinJia = stockData[0].Data.RepDataStkData[0].ZuiXinJia;
            } else {
                this.els.$searchBox.focus();
                this.els.$searchBox.val(this.code);
                alert('无效代码');
                return true;
            }

            if (this.ZuiXinJia 
                && capitalData 
                && capitalData[0] 
                && capitalData[0].RepQueryCapitalRsp
                && capitalData[0].RepQueryCapitalRsp[0]
                && capitalData[0].RepQueryCapitalRsp[0].AvailCapital) {
                this.availCapital = capitalData[0].RepQueryCapitalRsp[0].AvailCapital;
            } else {
                this.els.$buyButton.prop('disabled', true);
                this.avaliableQty = 0;
                alert('无可用资金');
            }

            this.refreshStockInfo(this.ZuiXinJia, this.availCapital);
        },

        refreshStockInfo: function(price, availCapital) {
            this.els.$price.val(price);
            this.avaliableQty = Math.floor(availCapital / price / 100);
            if (this.avaliableQty > 0) {
                this.els.$buyButton.prop('disabled', false);
            } else {
                alert('资金不足');
            }
            var info = this.avaliableQty + '手 (' + this.avaliableQty * 100 + '股)';
            this.els.$avaliableQty.html(info);
            this.els.$buyQty.val(this.avaliableQty);
            this.refreshConfirmQty(info);
        },

        refreshConfirmQty: function(confirmQty) {
            this.els.$confirmQty.html(confirmQty);
        },

        recaculateStockInfo: function() {
            var buyPrice = this.els.$price.val();
            this.refreshStockInfo(buyPrice, this.availCapital);
        },

        validateStockInfo: function() {
            var qty = this.els.$buyQty.val();
            if (qty > this.avaliableQty) {
                alert('最多可买' + this.avaliableQty + '手(' + (this.avaliableQty * 100) + '股)');
                this.els.$buyQty.val(this.avaliableQty);
                this.refreshConfirmQty(this.avaliableQty + '手 (' + (this.avaliableQty * 100) + '股)');
            }
        },

        decreasePrice: function() {
            var buyPrice = this.els.$price.val();
            var newPrice = parseFloat(buyPrice, 2) * 10000000 - 10000000;
            newPrice = newPrice <= 0 ? 10000000 : newPrice;
            newPrice = newPrice / 10000000;
            newPrice = Math.round(newPrice*100, 2)/100;
            this.els.$price.val(newPrice);
            this.recaculateStockInfo();
        },

        increasePrice: function() {
            var buyPrice = this.els.$price.val();
            var newPrice = parseFloat(buyPrice, 2) * 10000000 + 10000000;
            newPrice = newPrice / 10000000;
            newPrice = Math.round(newPrice*100, 2)/100;
            this.els.$price.val(newPrice);
            this.recaculateStockInfo();
        },

        decreaseQty: function() {
            var qty = this.els.$buyQty.val();
            var newQty = parseInt(qty, 0) * 10000000 - 10000000;
            newQty = newQty < 10000000 ? 10000000 : newQty;
            newQty = newQty / 10000000;
            this.els.$buyQty.val(newQty);
            this.validateStockInfo();
            this.refreshConfirmQty(newQty + '手 (' + (newQty * 100) + '股)');
        },
        
        increaseQty: function() {
            var qty = this.els.$buyQty.val();
            var newQty = parseInt(qty, 0) * 10000000 + 10000000;
            newQty = newQty / 10000000;
            this.els.$buyQty.val(newQty);
            this.refreshConfirmQty(newQty + '手 (' + (newQty * 100) + '股)');
            this.validateStockInfo();
        },

        changeQty: function(e) {
            var option = $(e.target).find('input').val();
            var newQty = Math.floor(this.avaliableQty / option);
            this.els.$buyQty.val(newQty);
            this.refreshConfirmQty(newQty + '手 (' + (newQty * 100) + '股)');
        }
        
    });

    return TradingBuyView;
});