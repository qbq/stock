'use strict'

define([
    'text!kline/KlineContainerTpl.html',
    'quote/QuoteView',
    'quote/QuoteModel',
    'chart/KlineChartView',
    'chart/KlineChartModel'
], function(
    KlineContainerTpl,
    QuoteView,
    QuoteModel,
    KlineChartView,
    KlineChartModel) {

	var klineContainerView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(KlineContainerTpl),

        events: {
            'click #buyStock': 'buyStock',
        	'click #sellStock': 'sellStock'
        },

        initialize: function (options) {
            this.code = options.code;
            this.name = options.name;
            _.bindAll(this, 'render', 'renderQuoteView', 'renderQuote', 'renderKlineChartView');
        },

        render: function () {
        	this.$el.html(this.template({
                "code": this.code,
                "name": this.name
            }));
            this.renderQuoteView();
            this.renderKlineChartView();
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
                code: this.code,
            });
            this.klineChartView = new KlineChartView({
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
        }
    });

    return klineContainerView;
});