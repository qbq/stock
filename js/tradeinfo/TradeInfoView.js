
'use strict'

define(['text!tradeinfo/TradeInfoTpl.html', 'Constants'], function(TradeInfoTpl, Constants) {

    var TradeInfoView = Backbone.View.extend({

        el: '#tradeInfo',
        template: _.template(TradeInfoTpl),

        initialize: function (params) {
            this.containerView = params.containerView;
            _.bindAll(this, 'render', 'refreshTradeInfo');
            this.model.bind('change', this.render, this);
            this.model.fetch().error(function(e){
                console.log(e);
            });
        },

        render: function () {
            this.$el.html(this.template({'tradeinfo': this.model.toJSON()}));
            this.initializeEls();
            return this;
        },

        initializeEls: function() {
            this.els = {
                $WeiTuoMaiChuJia5 : this.$('#WeiTuoMaiChuJia5'),
                $WeiTuoMaiChuJia4 : this.$('#WeiTuoMaiChuJia4'),
                $WeiTuoMaiChuJia3 : this.$('#WeiTuoMaiChuJia3'),
                $WeiTuoMaiChuJia2 : this.$('#WeiTuoMaiChuJia2'),
                $WeiTuoMaiChuJia1 : this.$('#WeiTuoMaiChuJia1'),
                $WeiTuoMaiChuLiang5: this.$('#WeiTuoMaiChuLiang5'),
                $WeiTuoMaiChuLiang4: this.$('#WeiTuoMaiChuLiang4'),
                $WeiTuoMaiChuLiang3: this.$('#WeiTuoMaiChuLiang3'),
                $WeiTuoMaiChuLiang2: this.$('#WeiTuoMaiChuLiang2'),
                $WeiTuoMaiChuLiang1: this.$('#WeiTuoMaiChuLiang1'),
                $ZuiXinJia        : this.$('#ZuiXinJia'),
                $WeiTuoMaiRuJia1  : this.$('#WeiTuoMaiRuJia1'),
                $WeiTuoMaiRuJia2  : this.$('#WeiTuoMaiRuJia2'),
                $WeiTuoMaiRuJia3  : this.$('#WeiTuoMaiRuJia3'),
                $WeiTuoMaiRuJia4  : this.$('#WeiTuoMaiRuJia4'),
                $WeiTuoMaiRuJia5  : this.$('#WeiTuoMaiRuJia5'),
                $WeiTuoMaiRuLiang1: this.$('#WeiTuoMaiRuLiang1'),
                $WeiTuoMaiRuLiang2: this.$('#WeiTuoMaiRuLiang2'),
                $WeiTuoMaiRuLiang3: this.$('#WeiTuoMaiRuLiang3'),
                $WeiTuoMaiRuLiang4: this.$('#WeiTuoMaiRuLiang4'),
                $WeiTuoMaiRuLiang5: this.$('#WeiTuoMaiRuLiang5')
            }
        },

        refreshTradeInfo: function(data) {
			this.els.$WeiTuoMaiChuJia5.html(data.WeiTuoMaiChuJia5);
			this.els.$WeiTuoMaiChuJia4.html(data.WeiTuoMaiChuJia4);
			this.els.$WeiTuoMaiChuJia3.html(data.WeiTuoMaiChuJia3);
			this.els.$WeiTuoMaiChuJia2.html(data.WeiTuoMaiChuJia2);
			this.els.$WeiTuoMaiChuJia1.html(data.WeiTuoMaiChuJia1);
			this.els.$WeiTuoMaiChuLiang5.html(data.WeiTuoMaiChuLiang5);
			this.els.$WeiTuoMaiChuLiang4.html(data.WeiTuoMaiChuLiang4);
			this.els.$WeiTuoMaiChuLiang3.html(data.WeiTuoMaiChuLiang3);
			this.els.$WeiTuoMaiChuLiang2.html(data.WeiTuoMaiChuLiang2);
			this.els.$WeiTuoMaiChuLiang1.html(data.WeiTuoMaiChuLiang1);
			this.els.$ZuiXinJia.html(data.ZuiXinJia);
			this.els.$WeiTuoMaiRuJia1.html(data.WeiTuoMaiRuJia1);
			this.els.$WeiTuoMaiRuJia2.html(data.WeiTuoMaiRuJia2);
			this.els.$WeiTuoMaiRuJia3.html(data.WeiTuoMaiRuJia3);
			this.els.$WeiTuoMaiRuJia4.html(data.WeiTuoMaiRuJia4);
			this.els.$WeiTuoMaiRuJia5.html(data.WeiTuoMaiRuJia5);
			this.els.$WeiTuoMaiRuLiang1.html(data.WeiTuoMaiRuLiang1);
			this.els.$WeiTuoMaiRuLiang2.html(data.WeiTuoMaiRuLiang2);
			this.els.$WeiTuoMaiRuLiang3.html(data.WeiTuoMaiRuLiang3);
			this.els.$WeiTuoMaiRuLiang4.html(data.WeiTuoMaiRuLiang4);
			this.els.$WeiTuoMaiRuLiang5.html(data.WeiTuoMaiRuLiang5);
        }
    });

    return TradeInfoView;
});