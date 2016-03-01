'use strict'

define(['text!trading/TradingBuyTpl.html'], function(TradingBuyTpl) {

	var TradingBuyView = Backbone.View.extend({
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
                "code": this.options.code,
                "name": this.options.name
            }));
            return this;
        }
    });

    return TradingBuyView;
});