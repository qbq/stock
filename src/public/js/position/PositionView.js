'use strict'

define(['text!position/PositionTpl.html', 'Constants'], function(PositionTpl, Constants) {

	var PositionView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(PositionTpl),

        initialize: function (params) {
            this.model.bind('change', this.render, this);
            // this.listenTo( this.collection, 'reset add change remove', this.render, this );
            this.model.fetch();
        },

        render: function () {
        	this.$el.html(this.template({'position': this.model.toJSON()}));
            return this;
        }
    });

    return PositionView;
});