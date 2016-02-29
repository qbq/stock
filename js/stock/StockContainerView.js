'use strict'

define(['text!stock/StockContainerTpl.html', 'price/PriceView'], function(StockContainerTpl, PriceView) {

	var stockContainerView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(StockContainerTpl),

        events: {
        	'click .btn-primary.btn-sm': 'filterStocks'
        },

        initialize: function (options) {
            _.bindAll(this, 'filterStocks', 'renderStocks');
            this.gql = options.gql || 'hushenagu';
            this.orderby = options.orderby;
        },

        render: function () {
        	this.$el.html(this.template({}));
            this.filterStocks();
            return this;
        },

        filterStocks: function(e) {
            $('.btn-primary.btn-sm.active').removeClass('active');
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
            this.priceView = new PriceView({
                gql: this.gql,
                orderby: this.orderby,
                collection: this.collection
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