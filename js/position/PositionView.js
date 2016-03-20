'use strict'

define(['text!position/PositionTpl.html', 'Constants'], function(PositionTpl, Constants) {

	var PositionView = Backbone.View.extend({
        events: {
            'dblclick tr': 'tradingSell'
        },

        el: '#bodyContainer',
        template: _.template(PositionTpl),

        initialize: function (params) {
            this.model.bind('change', this.render, this);
            // this.listenTo( this.collection, 'reset add change remove', this.render, this );
            this.model.fetch();
        },

        render: function () {
            var resp = this.model.get('RepQueryHoldRsp')[0];
            if (resp.RspNo === 0) {
                this.$el.html(this.template({'position': this.model.toJSON()}));
            } else {
                alert('查询持仓失败: ' + resp.RspDesc);
            }
            return this;
        },

        tradingSell: function(e) {
            location.hash = $(e.target).parent('tr').data().hash;
        }
    });

    return PositionView;
});