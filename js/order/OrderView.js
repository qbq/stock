'use strict'

define(['text!order/OrderTpl.html', 'Constants'], function(OrderTpl, Constants) {

	var OrderView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(OrderTpl),

        initialize: function (params) {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render, this);
            this.model.fetch();
        },

        render: function () {
            var tlpData = {'order': this.model.toJSON()};
            if (this.model.type === 'today') {
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