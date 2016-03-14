'use strict'

define(['text!quote/QuoteTpl.html', 'Constants'], function(QuoteTpl, Constants) {

	var QuoteView = Backbone.View.extend({
        el: '#quote',
        template: _.template(QuoteTpl),

        initialize: function (params) {
            // _.bindAll(this, 'render');
            this.model.bind('change', this.render, this);
            // this.listenTo( this.collection, 'reset add change remove', this.render, this );
            this.code = params.code;
            this.model.fetch({
                crossDomain: true,
                dataType: 'json',
                header: {credentials: true},
                data: {
                    obj: this.code,
                    token: Constants.ACCESS_TOKEN
                }
            });

            this.parentView = params.parentView;
        },

        render: function () {
            var tlpData = {'quote': this.model.toJSON()};
        	this.$el.html(this.template(tlpData));
            this.initElements();
            return this;
        },

        refreshQuote: function(quoteInfo) {
            var labelType = 'label-default';
            if (!isNaN(quoteInfo.ZhangDie)) {
                labelType = quoteInfo.ZhangDie < 0 ? 'label-success' : 'label-danger';
            }
            this.els.$ZuiXinJia.removeClass('label-success label-danger').addClass(labelType).html(quoteInfo.ZuiXinJia);
            this.els.$ZhangDie.removeClass('label-success label-danger').addClass(labelType).html(quoteInfo.ZhangDie);
            this.els.$ZhangFu.removeClass('label-success label-danger').addClass(labelType).html(quoteInfo.ZhangFu);
            this.els.$ChengJiaoLiang.html(quoteInfo.ChengJiaoLiang);
            this.els.$HuanShou.html(quoteInfo.HuanShou);
            this.els.$ZuiGaoJia.html(quoteInfo.ZuiGaoJia);
            this.els.$ZuiDiJia.html(quoteInfo.ZuiDiJia);
        },

        initElements: function() {
            this.els = {
                $ZuiXinJia: this.$('#ZuiXinJia'),
                $ZhangDie: this.$('#ZhangDie'),
                $ZhangFu: this.$('#ZhangFu'),
                $ChengJiaoLiang: this.$('#ChengJiaoLiang'),
                $HuanShou: this.$('#HuanShou'),
                $ZuiGaoJia: this.$('#ZuiGaoJia'),
                $ZuiDiJia: this.$('#ZuiDiJia'),
            };
        }
    });

    return QuoteView;
});