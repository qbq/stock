'use strict'

define([
    'text!stock/StockContainerTpl.html',
    'stock/StockCollection',
    'price/PriceView',
    'search/SearchView',
    'search/SearchModel'
], function(
    StockContainerTpl,
    StockCollection,
    PriceView,
    SearchView,
    SearchModel) {

	var stockContainerView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(StockContainerTpl),

        events: {
        	'click .btn-primary.btn-sm.filter': 'filterStocks'
        },

        initialize: function (options) {
            _.bindAll(this, 'render', 'dispose', 'filterStocks', 'renderSearch', 'renderStocks');
            this.options = options || {};
        },

        render: function () {
        	this.$el.html(this.template());
            this.renderSearch();
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
                this.$el.find('#' + (this.options.gql || 'quanbuagu')).addClass('active');
            }

            if (this.priceView) {
                this.priceView.dispose();
                this.$('.panel').append('<div class="table-responsive price-table-container"/>')
            }
            this.renderStocks();
        },

        renderStocks: function() {
            this.options.collection = new StockCollection();
            this.priceView = new PriceView(this.options).render();
        },

        dispose: function() {
            this.searchView.dispose();
            this.priceView.dispose();
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
        }
    });

    return stockContainerView;
});
