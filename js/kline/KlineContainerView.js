'use strict'

define([
    'text!kline/KlineContainerTpl.html',
    'quote/QuoteView',
    'quote/QuoteModel',
    'chart/KlineChartView',
    'chart/KlineChartModel',
    'search/SearchView',
    'search/SearchModel',
    'tradeinfo/TradeInfoView',
    'tradeinfo/TradeInfoModel'
], function(
    KlineContainerTpl,
    QuoteView,
    QuoteModel,
    KlineChartView,
    KlineChartModel,
    SearchView,
    SearchModel,
    TradeInfoView,
    TradeInfoModel) {

	var klineContainerView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(KlineContainerTpl),

        events: {
            'click #buyStock': 'buyStock',
        	'click #sellStock': 'sellStock',
            'keyup .search-box': 'showSearchResult',
            'focus .search-box': 'emptyInput',
            'blur .search-box': 'hideSearchResult',
            'click .search-button': 'showSearchResult'
        },

        initialize: function (options) {
            this.code = options.code;
            this.name = options.name;
            _.bindAll(this, 'render', 'renderQuoteView', 'renderQuote', 'renderKlineChartView', 'showSearchResult', 'hideSearchResult', 'emptyInput', 'renderTradeInfoView');
        },

        render: function () {
        	this.$el.html(this.template({
                "code": this.code,
                "name": this.name
            }));
            this.$('.search-box').focus();
            this.renderQuoteView();
            this.renderKlineChartView();
            this.renderTradeInfoView();
            return this;
        },

        renderQuoteView: function(e) {
            this.renderQuote();
            this.clearQuoteInterval();
            this.quoteInterval = setInterval(this.renderQuote, 5000);
        },

        renderQuote: function() {
            if (this.quoteView) {
                this.quoteView.remove();
                this.$el.find('#quoteContainer').append('<div id="quote"/>')
            }
            this.quoteView = new QuoteView({
                model: new QuoteModel(),
                code: this.code,
                name: this.name,
                parentView: this
            });
        },

        clearQuoteInterval: function() {
            if (this.quoteInterval) {
                clearInterval(this.quoteInterval);
            }
        },

        renderKlineChartView: function(e) {
            this.renderKlineChart();
//            this.clearKlineChartInterval();
//            this.klineChartInterval = setInterval(this.renderKlineChart, 5000);
        },

        renderKlineChart: function() {
            if (this.klineChartView) {
                this.klineChartView.dispose();
            }
            var klineChartModel = new KlineChartModel({
                code: this.code
            });
            this.klineChartView = new KlineChartView({
                code: this.code,
                model: klineChartModel
            });
        },

//        clearKlineChartInterval: function() {
//            if (this.klineChartInterval) {
//                clearInterval(this.klineChartInterval);
//            }
//        },

        buyStock: function() {
            window.location.hash = 'tradingBuy/' + this.code + '/' + this.name;
        },

        sellStock: function() {
            window.location.hash = 'tradingSell/' + this.code + '/' + this.name;
        },

        dispose: function() {
            this.clearQuoteInterval();
//            this.clearKlineChartInterval();
            this.quoteView.remove();
            this.klineChartView.remove();
            this.remove();
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
                    this.searchResultView.redirectToKline();
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
                    model: new SearchModel({
                        input: input
                    }),
                });
            }
        },

        hideSearchResult: function() {
            this.$('.search-result-container').fadeOut(500);//.addClass('hidden');
        },

        emptyInput: function() {
            this.$('.search-box').val('');
        },

        renderTradeInfoView: function() {
            if (this.tradeInfoView) {
                this.tradeInfoView.dispose();
            }
            var tradeInfoModel = new TradeInfoModel({
                obj: this.code,
            });
            this.tradeInfoView = new TradeInfoView({
                model: tradeInfoModel
            });
        }
    });

    return klineContainerView;
});