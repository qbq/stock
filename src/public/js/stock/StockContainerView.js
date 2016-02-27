'use strict'

define(['text!stock/StockContainerTpl.html', 'stock/StockCollection', 'stock/HSPriceView'], function(StockContainerTpl, StockCollection, HSPriceView) {

	var stockContainerView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(StockContainerTpl),

        events: {
        	'click .btn-primary.btn-sm': 'filterStocks'
        },

        initialize: function (options) {
            _.bindAll(this, 'filterStocks', 'renderStocks');
        },

        render: function () {
        	this.$el.html(this.template({}));
            this.filterStocks();
            return this;
        },

        filterStocks: function(e) {
            $('.btn-primary.btn-sm.active').removeClass('active');
            this.gql = 'hushenagu';
            if (e) {
                var btn = $(e.target);
                btn.addClass('active');
                this.gql = btn.prop('id');
            } else {
                this.$el.find('#' + this.gql).addClass('active');
            }

            if (this.priceView) {
                this.priceView.remove();
                this.$('table').append('<tbody/>')
            }
            this.renderStocks();
            this.clearInterval();
            this.interval = setInterval(this.renderStocks, 5000);
        },

        renderStocks: function() {
            this.priceView = new HSPriceView({
                gql: this.gql,
                collection: new StockCollection()
            }).render();
        },

        clearInterval: function() {
            if (this.interval) {
                clearInterval(this.interval);
            }
        },

        dispose: function() {
            this.clearInterval();
            this.remove();
        }
    });

    return stockContainerView;
});