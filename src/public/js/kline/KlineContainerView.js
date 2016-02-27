'use strict'

define([
    'text!kline/KlineContainerTpl.html',
    'quote/QuoteView',
    'quote/QuoteModel'/*,
    'chart/KlineChartView',
    'chart/KlineChartModel'*/
], function(
    KlineContainerTpl,
    QuoteView,
    QuoteModel/*,
    KlineChartView,
    KlineChartModel*/) {

	var klineContainerView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(KlineContainerTpl),

        events: {
        	// 'click .btn-primary.btn-sm': 'filterStocks'
        },

        initialize: function (options) {
            this.code = options.code;
            this.name = options.name;
            _.bindAll(this, 'render', 'renderQuoteView', 'renderQuote'/*, 'renderKlineChartView'*/);
        },

        render: function () {
        	this.$el.html(this.template({
                "code": this.code,
                "name": this.name
            }));
            this.renderQuoteView();
            // this.renderKlineChartView();
            return this;
        },

        renderQuoteView: function(e) {
            if (this.quoteView) {
                this.quoteView.remove();
                this.$('#quoteContainer').append('<div id="quote"/>')
            }
            this.renderQuote();
            this.clearQuoteInterval();
            this.quoteInterval = setInterval(this.renderQuote, 5000);
        },

        renderQuote: function() {
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
        },/*

        renderKlineChartView: function(e) {
            this.renderKlineChart();
            this.clearKlineChartInterval();
            this.klineChartInterval = setInterval(this.renderKlineChart, 5000);
        },

        renderKlineChart: function() {
            this.klineChartView = new KlineChartView({
                model: new KlineChartModel({
                    code: this.code,
                })
            }).render();
        },

        clearKlineChartInterval: function() {
            if (this.klineChartInterval) {
                clearInterval(this.klineChartInterval);
            }
        },*/

        dispose: function() {
            this.clearQuoteInterval();
            // this.clearKlineChartInterval();
            this.quoteView.remove();
            // this.klineChartView.remove();
            this.remove();
        }
    });

    return klineContainerView;
});