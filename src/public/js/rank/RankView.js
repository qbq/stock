'use strict'

define(['text!rank/RankTpl.html', 'Constants'], function(RankTpl, Constants) {

	var PositionView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(RankTpl),

        initialize: function (params) {
            this.model.bind('change', this.render, this);
            // this.listenTo( this.collection, 'reset add change remove', this.render, this );
            this.model.fetch();
        },

        render: function () {
        	this.$el.html(this.template({'rank': this.model.toJSON()}));
            return this;
        }
    });

    return PositionView;
});