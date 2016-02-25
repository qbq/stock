'use strict'

define(['text!stock/StockContainerTpl.html', 'stock/StockCollection', 'stock/HSPriceView'], function(StockContainerTpl, StockCollection, HSPriceView) {

	var stockContainerView = Backbone.View.extend({
        el: '#hsPriceContainer',
        template: _.template(StockContainerTpl),

        events: {
        	'click .btn-primary.btn-sm': 'filterStocks'
        },

        initialize: function (options) {
            _.bindAll(this, 'filterStocks');
        },

        render: function () {
        	this.$el.html(this.template({}));
            this.filterStocks();
            return this;
        },

        filterStocks: function(e) {
            $('.btn-primary.btn-sm.active').removeClass('active');
            var gql = 'hushenagu';
            if (e) {
                var btn = $(e.target);
                btn.addClass('active');
                gql = btn.prop('id');
            } else {
                this.$el.find('#' + gql).addClass('active');
            }
            this.priceView = new HSPriceView({
                gql: gql,
                collection: new StockCollection()
            }).render();
        }
    });

    return stockContainerView;
});