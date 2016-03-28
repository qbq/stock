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
        	'click #sellStock': 'sellStock'
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
                fields: Constants.KLINE_DATASTORE_FIELDS.concat(Constants.TRADE_INFO_FIELDS)
            });

            // 绑定方法
            _.bindAll(this, 'render', 'dispose', 'renderQuoteView', 'refreshQuote', 'renderKlineChart', 'renderSearch', 'renderTradeInfoView');
        },

        render: function () {
        	this.$el.html(this.template({
                "code": this.code,
                "name": this.name
            }));
            this.renderSearch();
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
            // 订阅行情
            this.dynaDataStore.subscribe({
                obj: this.code
            }, {}, this.refreshQuote);

            // 初始化图表
            this.dataProvider = new ChartDataProvider(this.code);
            new Chart(this.$('#chart'), {
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
                        ZhangFu: Util.formatNumber(dynaData.ZhangFu, this.precision) + '%',
                        ChengJiaoLiang: Util.formatNumber(dynaData.ChengJiaoLiang, 1, 'K/M'),
                        ChengJiaoE: Util.formatNumber(dynaData.ChengJiaoE, 1, 'K/M'),
                        HuanShou: Util.formatNumber(dynaData.HuanShou, this.precision) + '%',
                        ZuoShou: Util.formatNumber(dynaData.ZuoShou, this.precision),
                        ZuiGaoJia: Util.formatNumber(dynaData.ZuiGaoJia, this.precision),
                        ZuiDiJia: Util.formatNumber(dynaData.ZuiDiJia, this.precision),
                        KaiPanJia: Util.formatNumber(dynaData.KaiPanJia, this.precision)
                    };
                    this.quoteView && this.quoteView.refreshQuote(this.quoteInfo);

                    this.tradeInfo = {
						WeiTuoMaiChuJia5 : dynaData.WeiTuoMaiChuJia5 ,
					    WeiTuoMaiChuJia4 : dynaData.WeiTuoMaiChuJia4 ,
					    WeiTuoMaiChuJia3 : dynaData.WeiTuoMaiChuJia3 ,
					    WeiTuoMaiChuJia2 : dynaData.WeiTuoMaiChuJia2 ,
					    WeiTuoMaiChuJia1 : dynaData.WeiTuoMaiChuJia1 ,
					    WeiTuoMaiChuLiang5: dynaData.WeiTuoMaiChuLiang5,
					    WeiTuoMaiChuLiang4: dynaData.WeiTuoMaiChuLiang4,
					    WeiTuoMaiChuLiang3: dynaData.WeiTuoMaiChuLiang3,
					    WeiTuoMaiChuLiang2: dynaData.WeiTuoMaiChuLiang2,
					    WeiTuoMaiChuLiang1: dynaData.WeiTuoMaiChuLiang1,
					    ZuiXinJia        : dynaData.ZuiXinJia        ,
					    WeiTuoMaiRuJia1  : dynaData.WeiTuoMaiRuJia1  ,
					    WeiTuoMaiRuJia2  : dynaData.WeiTuoMaiRuJia2  ,
					    WeiTuoMaiRuJia3  : dynaData.WeiTuoMaiRuJia3  ,
					    WeiTuoMaiRuJia4  : dynaData.WeiTuoMaiRuJia4  ,
					    WeiTuoMaiRuJia5  : dynaData.WeiTuoMaiRuJia5  ,
					    WeiTuoMaiRuLiang1: dynaData.WeiTuoMaiRuLiang1,
					    WeiTuoMaiRuLiang2: dynaData.WeiTuoMaiRuLiang2,
					    WeiTuoMaiRuLiang3: dynaData.WeiTuoMaiRuLiang3,
					    WeiTuoMaiRuLiang4: dynaData.WeiTuoMaiRuLiang4,
					    WeiTuoMaiRuLiang5: dynaData.WeiTuoMaiRuLiang5
                    };
                    this.tradeInfoView && this.tradeInfoView.refreshTradeInfo(this.tradeInfo);

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
            this.dynaDataStore && this.dynaDataStore._close();
            this.dataProvider && this.dataProvider.close();
            // TODO 未提供destroy方法， 多次切换有内存泄露
            // this.chart && this.chart.destroy();
            this.tradeInfoView && this.tradeInfoView.remove();
            this.searchView.dispose();
            this.remove();
        },

        renderSearch: function() {
            this.searchView = new SearchView({
                el: $('.search-group'),
                selectFn: this.selectFn
            }).render();
        },

        selectFn: function( event, ui ) {
            location.hash = '/kline/' + ui.item.DaiMa + '/' + ( ui.item.MingCheng || ui.item.ShuXing || '' );
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