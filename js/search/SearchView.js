'use strict'

define(['text!search/SearchTpl.html', 'Constants'], function(SearchTpl, Constants) {

	var SearchView = Backbone.View.extend({
        events: {
            'click tr': 'showKline'
        },

        el: '#bodyContainer',
        template: _.template(SearchTpl),

        initialize: function (params) {
            this.containerView = params.containerView;
            _.bindAll(this, 'render', 'showKline', 'selectResult', 'highlightSelectedResult', 'redirectToKline');
            this.model.bind('change', this.render, this);
            // this.listenTo( this.collection, 'reset add change remove', this.render, this );
            this.model.fetch();
        },

        render: function () {
        	this.$el.html(this.template({'search': this.model.toJSON()}));
            this.resultRows = this.$('tr');
            if (this.resultRows.length === 0) {
                if (this.containerView) {
                    this.containerView.hideSearchResult();
                }
            } else {
                this.selectedResultIndex = 0;
                this.highlightSelectedResult(this.selectedResultIndex);
            }
            return this;
        },

        showKline: function(e) {
            var hash = $(e.target).parent('tr').data().hash;
            this.redirectToKline(hash);
        },

        selectResult: function(step) {
            this.selectedResultIndex = this.selectedResultIndex + step;
            if (this.selectedResultIndex < 0) {
                this.selectedResultIndex = 0;
            } else if (this.selectedResultIndex > Constants.SEARCH_COUNT - 1) {
                this.selectedResultIndex = Constants.SEARCH_COUNT - 1
            }
            this.highlightSelectedResult(this.selectedResultIndex);
        },

        highlightSelectedResult: function(index) {
            this.resultRows.filter('.selected-search-result').removeClass('selected-search-result');
            this.resultRows.eq(index).addClass('selected-search-result');
        },

        redirectToKline: function(hash) {
            if (this.resultRows.length === 0) {
                return;
            }
            if (!hash) {
                hash = this.resultRows.eq(this.selectedResultIndex).data().hash;
            }
            location.hash = hash;
        }
    });

    return SearchView;
});