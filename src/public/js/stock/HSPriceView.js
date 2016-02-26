'use strict'

define(['text!stock/HSPriceTpl.html', 'Constants'], function(StockContainerTpl, Constants) {

	var HSPriceView = Backbone.View.extend({
        el: '#bodyContainer tbody',
        template: _.template(StockContainerTpl),

        initialize: function (params) {
            this.gql = params.gql;
            this.collection.bind('sync', this.render, this);
            // this.listenTo( this.collection, 'reset add change remove', this.render, this );
            this.collection.fetch({
                method: 'GET',
                data: this.getRequestParam({
                    gql: this.gql
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
            param += '&count=' + (params['count'] || '10');
            param += '&field=' + (params['field'] || Constants.HANGQING_FIELDS);
            param += '&mode=' + (params['mode'] || '2');
            param += '&token=' + (params['token'] || Constants.ACCESS_TOKEN);
            return param;
        }
    });

    return HSPriceView;
});