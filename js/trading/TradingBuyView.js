'use strict'

define([
    'text!trading/TradingBuyTpl.html',
    'search/SearchView',
    'search/SearchModel'
], function(
    TradingBuyTpl,
    SearchView,
    SearchModel
) {

	var TradingBuyView = Backbone.View.extend({

        events: {
            'keyup .search-box': 'showSearchResult',
            'blur .search-box': 'hideSearchResult'
        },

        el: '#bodyContainer',
        template: _.template(TradingBuyTpl),

        initialize: function (options) {
            this.options = options;
        	_.bindAll(this, 'render');
            // this.listenTo( this.model, 'reset add change remove', this.render, this );
            this.model.bind('change', this.render, this);
        	this.model.fetch();
        },

        render: function () {
        	this.$el.html(this.template({
                "trading": this.model.toJSON(),
                "code": this.options.code || 'SH601519',
                "name": this.options.name || '大智慧'
            }));
            return this;
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
                    var selectedResult = this.searchResultView.getSelectedResult();
                    this.redirectToSell(selectedResult);
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
                    routeTarget: 'tradingBuy',
                    model: new SearchModel({
                        input: input
                    }),
                });
            }
        },

        hideSearchResult: function() {
            this.$('.search-result-container').fadeOut(1000);//.addClass('hidden');
        },

        redirectToSell: function(result) {
            location.hash = '/tradingSell/' + result.obj + '/' + result.name;
        }
    });

    return TradingBuyView;
});