'use strict'

define([
    'Constants',
    'text!stock/StockContainerTpl.html',
    'stock/StockCollection',
    'price/PriceView',
    'search/SearchView',
    'search/SearchModel'
], function(
    Constants,
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
            _.bindAll(this, 'render', 'dispose', 'filterStocks', 'renderSearch', 'renderStocks', 'processSelected');
            this.options = options || {};
            this.options.gql = this.options.gql || 'quanbuagu';
        },

        render: function () {
        	this.$el.html(this.template());
            this.renderSearch();
            $('#' + this.options.gql).addClass('active');

            if (this.options.gql === 'wodezixuan') {
                this.fetchSelected();
            } else {
                this.options.obj = '';
                this.renderStocks(this.options);
            }

            return this;
        },

        filterStocks: function(e) {
            var gql = 'quanbuagu';
            if (e) {
                var btn = $(e.target);
                btn.addClass('active');
                gql = btn.prop('id');
            }
            location.hash = '/stockPrice/gql/' + gql;
            // $('.btn-primary.btn-sm.active').removeClass('active');
            // if (e) {
            //     var btn = $(e.target);
            //     btn.addClass('active');
            //     this.options.gql = btn.prop('id');
            // } else {
            //     this.$el.find('#' + (this.options.gql || 'quanbuagu')).addClass('active');
            // }

            // if (this.priceView) {
            //     this.priceView.dispose();
            //     this.$('.panel').append('<div class="table-responsive price-table-container"/>')
            // }
        },

        fetchSelected: function() {
            $.getJSON({
                url: Constants.QUERY_SELECTED_URL,
                success: this.processSelected,
                error: function() {
                    alert('Failed to fetch selected stocks.');
                }
            });
        },

        processSelected: function(data) {
            this.options.obj = data.RepQuerySelRsp[0].StkSelectedList.join(',');
            this.renderStocks(this.options);
        },

        renderStocks: function(options) {
            this.options.collection = new StockCollection();
            this.priceView = new PriceView(options);
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
