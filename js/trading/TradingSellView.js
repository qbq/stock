'use strict'

define([
    'Constants',
    'text!trading/TradingSellTpl.html',
    'search/SearchView',
    'search/SearchModel'
], function(
    Constants,
    TradingSellTpl,
    SearchView,
    SearchModel
) {

	var TradingSellView = Backbone.View.extend({

        events: {
            'blur .search-box': 'fetchStockInfo',
            'change #sellQty': 'validateStockInfo',
            'click #decreasePrice': 'decreasePrice',
            'click #increasePrice': 'increasePrice',
            'click #decreaseQty': 'decreaseQty',
            'click #increaseQty': 'increaseQty',
            'click .sell-qty-selector': 'changeQty',
            'click #sell': 'sell',
            'click #resetAll': 'resetAll'
        },

        el: '#bodyContainer',
        template: _.template(TradingSellTpl),

        initialize: function (options) {
            this.code = options.code || 'SH601519';
            this.name = options.name || '大智慧';
            this.gameno = options.gameno;
        	_.bindAll(this,
                'render',
                'fetchStockInfo',
                'parseStockAndPositionData',
                'refreshQty',
                'decreasePrice',
                'increasePrice',
                'decreaseQty',
                'increaseQty',
                'changeQty');
            // this.listenTo( this.model, 'reset add change remove', this.render, this );
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
                $sellQty: this.$('#sellQty'),
                $confirmQty: this.$('#confirmQty'),
                $searchBox: this.$('.search-box'),
                $quoteName: this.$('#quoteName'),
                $buyButton: this.$('#buy'),
                $resetAllButton: this.$('#resetAll')
            };
        },

        sell: function() {
            var capitalid  = this.els.$tradingAccount.val(),
                productcode = this.els.$searchBox.val(),
                ordertype = 'R',
                buysell = 'S',
                orderprice = this.els.$price.val(),
                orderamount = this.els.$sellQty.val();
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
            }).success(this.sellResult)
            .error(this.sellError);
        },

        sellResult: function(data) {
            if (data && data.RepCounterRsp[0].RspNo === 0) {
                alert('交易成功');
                location.hash = 'positions';
            } else {
                alert('交易失败: ' + data.RepCounterRsp[0].RspDesc);
            }
        },

        sellError: function(err) {
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
            location.hash = '/tradingSell/' + ui.item.DaiMa + '/' + ( ui.item.MingCheng || ui.item.ShuXing || '' );
        },

        fetchStockInfo: function() {
            var stockInfoDefer = $.getJSON(Constants.TRADE_INFO_URL, {
                    obj: this.els.$searchBox.val(),
                    field: 'ZuiXinJia',
                    token: Constants.ACCESS_TOKEN
                }),
                positionDefer = $.getJSON(Constants.QUERY_HOLD_URL + (this.gameno || ''));
            $.when(stockInfoDefer, positionDefer).then(this.parseStockAndPositionData);
        },

        parseStockAndPositionData: function(stockData, postionData) {
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

            if (postionData
                && postionData[0]
                && postionData[0].RepQueryHoldRsp
                && postionData[0].RepQueryHoldRsp[0]) {
                var currentPostion = {};
                var postions = postionData[0].RepQueryHoldRsp[0].StkHoldList;
                $.each(postions, function(index, postion) {
                    if (postion.ProductCode === this.code) {
                        currentPostion = postion;
                        return false;
                    }
                }.bind(this));
                this.avaliableQty = (currentPostion.AvailAmount || 0) / 100;
            }
            this.refreshStock(this.ZuiXinJia);
            this.refreshQty(this.avaliableQty);
        },

        refreshStock: function(price) {
            this.els.$price.val(price);
        },

        refreshQty: function(avaliableQty) {
            var info = avaliableQty + '手(' + (avaliableQty * 100) + '股)';
            this.els.$avaliableQty.html(info);
            this.els.$sellQty.val(avaliableQty);
            this.refreshConfirmQty(avaliableQty);
        },

        refreshConfirmQty: function(avaliableQty) {
            this.els.$confirmQty.html(avaliableQty + '手(' + (avaliableQty * 100) + '股)');
        },

        decreasePrice: function() {
            var buyPrice = this.els.$price.val();
            var newPrice = parseFloat(buyPrice, 2) * 10000000 - 10000000;
            newPrice = newPrice <= 0 ? 1 : (newPrice / 10000000);
            newPrice = Math.round(newPrice*100, 2)/100;
            this.els.$price.val(newPrice);
        },

        increasePrice: function() {
            var buyPrice = this.els.$price.val();
            var newPrice = (parseFloat(buyPrice, 2) *10000000 + 10000000) / 10000000;
            newPrice = Math.round(newPrice*100, 2)/100;
            this.els.$price.val(newPrice);
        },

        decreaseQty: function() {
            var qty = this.els.$sellQty.val();
            var newQty = parseInt(qty, 0) * 10000000 - 10000000;
            newQty = newQty < 10000000 ? 10000000 : newQty;
            newQty = newQty / 10000000;
            this.els.$sellQty.val(newQty);
            this.refreshConfirmQty(newQty);
        },
        
        increaseQty: function() {
            var qty = this.els.$sellQty.val();
            var newQty = parseInt(qty, 0) * 10000000 + 10000000;
            newQty = newQty / 10000000;
            if (this.validateQty(newQty)) {
                this.els.$sellQty.val(newQty);
                this.refreshConfirmQty(newQty);
            } else {
                alert('最多可买'+ this.avaliableQty + '手 (' + (this.avaliableQty * 100) + '股)');
                this.els.$sellQty.val(this.avaliableQty);
                this.refreshConfirmQty(this.avaliableQty);
            }
        },

        validateQty: function(qty) {
            if (qty > this.avaliableQty) {
                return false;
            } else {
                return true;
            }
        },

        resetAll: function() {
            this.els.$price.val(this.ZuiXinJia);
            this.els.$sellQty.val(this.avaliableQty);
            this.refreshConfirmQty(this.avaliableQty);
        },

        changeQty: function(e) {
            var option = $(e.target).find('input').val();
            var newQty = Math.floor(this.avaliableQty / option);
            this.els.$sellQty.val(newQty);
            this.refreshConfirmQty(newQty);
        }
    });

    return TradingSellView;
});