'use strict'

define(['text!deal/DealTpl.html', 'Constants'], function(DealTpl, Constants) {

	var DealView = Backbone.View.extend({
        el: '#bodyContainer',
        template: _.template(DealTpl),

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
            var tlpData = {'deal': this.model.toJSON()};
            if (this.type) {
                tlpData.title = '今日成交';
            } else {
                tlpData.title = '历史成交';
            }
        	this.$el.html(this.template(tlpData));
            return this;
        }
    });

    return DealView;
});