'use strict'

define(['text!trading/TradingSellTpl.html'], function(TradingSellTpl) {

	var TradingSellView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(TradingSellTpl),

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
                "code": this.options.code,
                "name": this.options.name
            }));
            return this;
        }
    });

    return TradingSellView;
});