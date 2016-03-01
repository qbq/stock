'use strict'

define([
    'text!stock/StockContainerTpl.html',
    'stock/StockCollection',
    'price/PriceView'
], function(
    StockContainerTpl,
    StockCollection,
    PriceView) {

	var stockContainerView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(StockContainerTpl),

        events: {
        	'click .btn-primary.btn-sm': 'filterStocks'
        },

        initialize: function (options) {
            _.bindAll(this, 'filterStocks', 'renderStocks');
            this.options = options || {};
        },

        render: function () {
        	this.$el.html(this.template());
            $('#' + this.options.gql).addClass('active');
            this.filterStocks();
            return this;
        },

        filterStocks: function(e) {
            $('.btn-primary.btn-sm.active').removeClass('active');
            if (e) {
                var btn = $(e.target);
                btn.addClass('active');
                this.options.gql = btn.prop('id');
            } else {
                this.$el.find('#' + this.options.gql).addClass('active');
            }

            if (this.priceView) {
                this.priceView.remove();
                this.$('.panel').append('<div class="table-responsive"/>')
            }
            this.renderStocks();
            this.clearInterval();
            this.interval = setInterval(this.renderStocks, 10000);
        },

        renderStocks: function() {
            this.options.collection = new StockCollection();
            this.priceView = new PriceView(this.options).render();
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
