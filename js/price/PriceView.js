'use strict'

define(['text!stock/PriceTpl.html', 'Constants'], function(PriceTpl, Constants) {

	var PriceView = Backbone.View.extend({
        el: '#bodyContainer tbody',
        template: _.template(PriceTpl),

        initialize: function (params) {
            this.gql = params.gql;
            this.orderby = params.orderby;
            this.collection.bind('sync', this.render, this);
            // this.listenTo( this.collection, 'reset add change remove', this.render, this );
            this.collection.fetch({
                method: 'GET',
                header: {credentials: true},
                data: this.getRequestParam({
                    gql: this.gql,
                    orderby: this.orderby
                })
                // data: 'gql=block=股票\\\\市场分类\\\\中小企业板&orderby=ZhangFu&desc=true&start=0&count=20&field=ZhongWenJianCheng,ZuiXinJia,ZhangDie,ZhangFu,ZuoShou,KaiPanJia,ZuiGaoJia,ZuiDiJia,ChengJiaoLiang,ChengJiaoE,HuanShou&mode=2&token=00000011:1470039600:2db14efc6f396fa002f2d26a41306810fb34c5c1'
            });
        },

        render: function () {
        	this.$el.html(this.template({'stocks': this.collection.toJSON()}));
            return this;
        },

        getRequestParam: function(params) {
            var param = '', params = params || {};
            param += 'gql=' + (Constants.GQL_LIST[params['gql'] || 'hushenagu']);
            param += '&orderby=' + (params['orderby'] || 'ZhangFu');
            param += '&desc=' + (params['desc'] || 'true');
            param += '&start=' + (params['start'] || '0');
            param += '&count=' + (params['count'] || Constants.PAGE_SIZE);
            param += '&field=' + (params['field'] || Constants.HANGQING_FIELDS);
            param += '&mode=' + (params['mode'] || '2');
            param += '&token=' + (params['token'] || Constants.ACCESS_TOKEN);
            return param;
        }
    });

    return PriceView;
});