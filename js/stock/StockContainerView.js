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
        	'click .btn-primary.btn-sm': 'filterStocks',
            'keyup .search-box': 'showSearchResult',
            'blur .search-box': 'hideSearchResult',
            'click .search-button': 'showSearchResult'
        },

        initialize: function (options) {
            _.bindAll(this, 'filterStocks', 'renderStocks', 'showSearchResult', 'hideSearchResult', 'emptyInput');
            this.options = options || {};
        },

        render: function () {
        	this.$el.html(this.template());
            this.$('.search-box').focus();
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
                this.priceView.remove();
                this.$('.panel').append('<div class="table-responsive price-table-container"/>')
            }
            this.renderStocks();
            // this.clearInterval();
            // this.interval = setInterval(this.renderStocks, 10000);
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
            this.$('.search-result-container').fadeOut(1000);//.addClass('hidden');
        },

        emptyInput: function() {
            this.$('.search-box').val('');
        }
    });

    return stockContainerView;
});
