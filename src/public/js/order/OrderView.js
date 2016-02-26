'use strict'

define(['text!order/OrderTpl.html', 'Constants'], function(OrderTpl, Constants) {

	var OrderView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(OrderTpl),

        initialize: function (params) {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render, this);
            // this.listenTo( this.collection, 'reset add change remove', this.render, this );
            this.type = this.model.get('type') === 'today' ? 1 : 0;
            this.model.fetch({
                data: {
                    type: this.type
                }
            });
        },

        render: function () {
            var tlpData = {'order': this.model.toJSON()};
            if (this.type) {
                tlpData.title = '今日委托';
            } else {
                tlpData.title = '历史委托';
            }
        	this.$el.html(this.template(tlpData));
            return this;
        }
    });

    return OrderView;
});