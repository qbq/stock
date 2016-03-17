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
            'keyup .search-box': 'showSearchResult',
            'blur .search-box': 'fetchStockInfo',
            'click #resetAll': 'resetAll',
            // 'change #price': ''
            // TODO 2 increase buttons, 2 decrease buttons, 4 split buttons, buy button, change price, validate qty while changing
        },

        el: '#bodyContainer',
        template: _.template(TradingBuyTpl),

        initialize: function (options) {
            this.code = options.code || 'SH601519';
            this.name = options.name || '大智慧';
        	_.bindAll(this, 'render', 'fetchStockInfo', 'parseStockAndCapitalData', 'refreshStockInfo', 'resetAll');
            this.model.bind('change', this.render, this);
        	this.model.fetch();
        },

        render: function () {
        	this.$el.html(this.template({
                "trading": this.model.toJSON(),
                "code": this.code,
                "name": this.name
            }));
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
                $buyButton: this.$('#buy'),
                $resetAllButton: this.$('#resetAll')
            };
        },

        showSearchResult: function(e) {

            // 键盘上下选择
            if (event.which === 38) {
                if (this.searchResultView) {
                    this.searchResultView.selectResult(-1);
                }
            } else if (event.which === 40) {
                if (this.searchResultView) {
                    this.searchResultView.selectResult(1);
                }
            } else if (event.which === 13) {
                if (this.searchResultView) {
                    var selectedResult = this.searchResultView.getSelectedResult();
                    this.redirectToBuy(selectedResult);
                }
            } else {

                var input = this.$('.search-box').val(),
                    container = this.$('.search-result-container'),
                    el = this.$('#search-result-wrapper');

                if (!input) {
                    container.addClass('hidden');
                    return;
                }

                if (this.searchResultView) {
                    this.searchResultView.remove();
                    el = $('<div id="search-result-wrapper"><div class="search-loading">加载中...</div></div>');
                    container.append(el);
                }
                container.removeClass('hidden').show();
                this.searchResultView = new SearchView({
                    el: el,
                    containerView: this,
                    routeTarget: 'tradingBuy',
                    model: new SearchModel({
                        input: input
                    }),
                });
            }
        },

        hideSearchResult: function() {
            this.$('.search-result-container').fadeOut(1000);
        },

        redirectToBuy: function(result) {
            location.hash = '/tradingBuy/' + result.obj + '/' + result.name;
        },

        resetAll: function() {
            this.els.$price.val(0);
            this.els.$buyQty.val(0);
            this.els.$confirmQty.html(0);
        },

        fetchStockInfo: function() {
            this.hideSearchResult();
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
                this.AvailCapital = capitalData[0].RepQueryCapitalRsp[0].AvailCapital;
                this.avaliableQty = Math.floor(this.AvailCapital / this.ZuiXinJia / 100);
                this.els.$buyButton.prop('disabled', false);
            } else {
                this.els.$buyButton.prop('disabled', true);
                this.avaliableQty = 0;
                alert('无可用资金');
            }

            this.refreshStockInfo(this.ZuiXinJia, this.avaliableQty);
        },

        refreshStockInfo: function(price, avaliableQty) {
            this.els.$price.val(price);
            var info = avaliableQty + ' 手 (' + avaliableQty * 100 + '股)';
            this.els.$avaliableQty.html(info);
            this.els.$buyQty.val(avaliableQty);
            this.refreshConfirmQty(info);
        },

        refreshConfirmQty: function(confirmQty) {
            this.els.$confirmQty.html(confirmQty);
        }
    });

    return TradingBuyView;
});