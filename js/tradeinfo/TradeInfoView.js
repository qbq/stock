
'use strict'

define(['text!tradeinfo/TradeInfoTpl.html', 'Constants'], function(TradeInfoTpl, Constants) {

	var TradeInfoView = Backbone.View.extend({

        el: '#tradeInfo',
        template: _.template(TradeInfoTpl),

        initialize: function (params) {
            this.containerView = params.containerView;
            _.bindAll(this, 'render');
            this.model.bind('change', this.render, this);
            this.model.fetch().error(function(e){
                console.log(e);
            });
        },

        render: function () {
        	this.$el.html(this.template({'tradeinfo': this.model.toJSON()}));
            return this;
        }
    });

    return TradeInfoView;
});