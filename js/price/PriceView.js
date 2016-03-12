'use strict'

define(['text!price/PriceTpl.html', 'Constants'], function(PriceTpl, Constants) {

	var PriceView = Backbone.View.extend({
        events: {
            'click tr': 'showKline'
        },

        el: '#bodyContainer .price-table-container',
        template: _.template(PriceTpl),

        initialize: function (params) {
            _.bindAll(this, 'showKline');
            this.params = params;
            this.gql = params.gql || 'quanbuagu';
            this.orderby = (params.orderby || '_').split('_');
            this.desc = !this.orderby[1] || this.orderby[1] === 'desc'; // 如果为指定, desc=true
            this.orderby = this.orderby[0];
            this.page = parseInt(params.page, 0) || 1;
            this.collection.bind('sync', this.render, this);
            // this.listenTo( this.collection, 'reset add change remove', this.render, this );
            this.collection.fetch({
                method: 'GET',
                crossDomain: true,
                dataType: 'json',
                // dataType: 'jsonp',
                // jsonp: 'render',
                header: {credentials: true},
                data: this.getRequestParam({
                    gql: this.gql,
                    // obj: 'SH600000',
                    orderby: this.orderby,
                    desc: this.desc,
                    page: this.page
                })
                // data: 'gql=block=股票\\\\市场分类\\\\中小企业板&orderby=ZhangFu&desc=true&start=0&count=20&field=ZhongWenJianCheng,ZuiXinJia,ZhangDie,ZhangFu,ZuoShou,KaiPanJia,ZuiGaoJia,ZuiDiJia,ChengJiaoLiang,ChengJiaoE,HuanShou&mode=2&token=00000011:1470039600:2db14efc6f396fa002f2d26a41306810fb34c5c1'
            }).error(function(e) {
                console.log(e.statusText);
            });
        },

        render: function () {
        	this.$el.html(this.template({
                'stocks': this.collection.toJSON(),
                'gql': this.gql,
                'orderby': this.orderby,
                'desc': this.desc,
                'prepage': this.page - 1,
                'nextpage': this.page + 1,
                'lastpage': 10
            }));
            return this;
        },

        getRequestParam: function(params) {
            var param = '', params = params || {};
            param += 'gql=' + (encodeURI(Constants.GQL_LIST[params['gql'] || 'quanbuagu']));
            // param += 'obj=' + (params['obj'] || 'SH600000');
            param += '&orderby=' + (params['orderby'] || 'ZhangFu');
            param += '&desc=' + (params['desc']);
            param += '&start=' + (((params['page'] - 1) * Constants.PAGE_SIZE + 1) || '0');
            param += '&count=' + Constants.PAGE_SIZE;
            param += '&field=' + (params['field'] || Constants.HANGQING_FIELDS);
            param += '&mode=' + (params['mode'] || '2');
            param += '&token=' + (params['token'] || Constants.ACCESS_TOKEN);
            return param;
        },

        showKline: function(e) {
            location.hash = $(e.target).parent('tr').data().hash;
        }
    });

    return PriceView;
});