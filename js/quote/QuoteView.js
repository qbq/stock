'use strict'

define(['text!quote/QuoteTpl.html', 'Constants'], function(QuoteTpl, Constants) {

	var QuoteView = Backbone.View.extend({
        el: '#quote',
        template: _.template(QuoteTpl),

        initialize: function (params) {
            // _.bindAll(this, 'render');
            this.model.bind('change', this.render, this);
            // this.listenTo( this.collection, 'reset add change remove', this.render, this );
            this.code = params.code;var view = this;
            this.model.fetch({
                crossDomain: true,
                dataType: 'json',
                header: {credentials: true},
                data: {
                    obj: this.code,
                    field: Constants.QUOTE_FIELDS,
                    token: Constants.ACCESS_TOKEN
                }
            });

            this.parentView = params.parentView;
        },

        render: function () {
            var tlpData = {'quote': this.model.toJSON()};
        	this.$el.html(this.template(tlpData));
            // 更新股票名称
            // this.parentView.$el.find('#stockName').html(this.model.get("RepDataQuoteDynaSingle")[0]["ZhongWenJianCheng"]);
            return this;
        }
    });

    return QuoteView;
});