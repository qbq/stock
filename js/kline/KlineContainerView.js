'use strict'

define([
    'text!kline/KlineContainerTpl.html',
    'Constants',
    'util/util',
    'quote/QuoteView',
    'quote/QuoteModel',
    'search/SearchView',
    'search/SearchModel',
    'tradeinfo/TradeInfoView',
    'tradeinfo/TradeInfoModel',
    'DataStore',
    'Chart',
    'ChartDataProvider'
], function(
    KlineContainerTpl,
    Constants,
    Util,
    QuoteView,
    QuoteModel,
    SearchView,
    SearchModel,
    TradeInfoView,
    TradeInfoModel,
    DataStore,
    Chart,
    ChartDataProvider) {

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
            // hash参数
            this.code = options.code;
            this.name = options.name;

            if (!this.code) {
                this.$el.html('无效代码');
                return this;
            }

            // 默认属性
            this.precisionMap = {'FX': 4};
            this.precision = this.precisionMap[this.code.substr(0, 2)] || 2;

            // 初始化DataStore
            this.dynaDataStore = new DataStore({
                serviceUrl: '/stkdata',
                fields: Constants.DYNA_DATASTORE_FIELDS
            });

            // 绑定方法
            _.bindAll(this, 'render', 'renderQuoteView', 'refreshQuote', 'renderKlineChart', 'showSearchResult', 'hideSearchResult', 'emptyInput', 'renderTradeInfoView');
        },

        render: function () {
        	this.$el.html(this.template({
                "code": this.code,
                "name": this.name
            }));
            this.$('.search-box').focus();
            this.renderQuoteView();
            this.renderKlineChart();
            this.renderTradeInfoView();
            return this;
        },

        renderQuoteView: function() {
            this.quoteView = new QuoteView({
                code: this.code,
                model: new QuoteModel()
            });
        },

        renderKlineChart: function(data) {
            this.dynaDataStore.subscribe({
                obj: this.code
            }, {}, this.refreshQuote);
            this.dataProvider = new ChartDataProvider(this.code);
            this.chart = new Chart(this.$('#chart'), {
                dataProvider: this.dataProvider,
                dataPrecision: this.precision,
                chart: {
                    width: null,
                    height: null
                }
            });
        },

        refreshQuote: function(data) {
            if (data instanceof Error) {
                console.log(data);
            } else {
                var dynaData = data[this.code];
                if (dynaData) {
                    this.name = dynaData.ZhongWenJianCheng;
                    this.quoteInfo = {
                        ZuiXinJia: Util.formatNumber(dynaData.ZuiXinJia, this.precision),
                        ZhangDie: Util.formatNumber(dynaData.ZhangDie, this.precision),
                        ZhangFu: Util.formatNumber(dynaData.ZhangFu, this.precision),
                        ChengJiaoLiang: Util.formatNumber(dynaData.ChengJiaoLiang, 1, 'K/M'),
                        ChengJiaoE: Util.formatNumber(dynaData.ChengJiaoE, 1, 'K/M'),
                        HuanShou: Util.formatNumber(dynaData.HuanShou, this.precision),
                        ZuoShou: Util.formatNumber(dynaData.ZuoShou, this.precision),
                        ZuiGaoJia: Util.formatNumber(dynaData.ZuiGaoJia, this.precision),
                        ZuiDiJia: Util.formatNumber(dynaData.ZuiDiJia, this.precision),
                        KaiPanJia: Util.formatNumber(dynaData.KaiPanJia, this.precision)
                    };
                    this.quoteView && this.quoteView.refreshQuote(this.quoteInfo);
                    var lastUpdateTime = dynaData.ShiJian ?
                          new Date(Number(dynaData.ShiJian + '000')).format('yyyy-MM-dd hh:mm:ss') :
                          Constants.DEFAULT_VALUE
                    this.$('#lastUpdateTime').html(lastUpdateTime);
                }
            }
        },

        buyStock: function() {
            window.location.hash = 'tradingBuy/' + this.code + '/' + this.name;
        },

        sellStock: function() {
            window.location.hash = 'tradingSell/' + this.code + '/' + this.name;
        },

        dispose: function() {
            this.quoteView && this.quoteView.remove();
            this.dataProvider && this.dataProvider.close();
            // TODO 未提供destroy方法， 多次切换有内存泄露
            // this.chart && this.chart.destroy();
            this.tradeInfoView && this.tradeInfoView.remove();
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