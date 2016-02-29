'use strict'

define(['text!focus/FocusTpl.html', 'Constants'], function(FocusTpl, Constants) {

	var FocusView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(FocusTpl),

        initialize: function (params) {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render, this);
            // this.listenTo( this.collection, 'reset add change remove', this.render, this );
            
            this.model.fetch();
        },

        render: function () {
            var tlpData = {'focus': this.model.toJSON()};
        	this.$el.html(this.template(tlpData));
            return this;
        }
    });

    return FocusView;
});