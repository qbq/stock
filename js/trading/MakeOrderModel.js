'use strict'

define(['Constants'], function(Constants) {

	var TradingBuyModel = Backbone.Model.extend({

        initialize: function(params) {
            this.gameno = params.gameno || '',
            this.capitalid = params.capitalid || '',
            this.productcode = params.productcode || '',
            this.ordertype = params.ordertype || 'R',
            this.buysell = params.buysell || 'B',
            this.orderprice = params.orderprice || 0,
            this.orderamount = params.orderamount || 0
        },

        url: function() {
            return Constants.MAKE_ORDER_URL
                    + this.gameno
                    + '?'
                    + 'capitalid='
                    + this.capitalid
                    + '&productcode='
                    + this.productcode
                    + '&ordertype='
                    + this.ordertype
                    + '&buysell='
                    + buysell
                    + '&orderprice='
                    + orderprice
                    + '&orderamount='
                    + orderamount;
        },
        defaults: {
            "Id": 101, // 响应数据结构 ID 标准头部
            "RepCounterRsp": [ // 响应数据部分
                {
                    "RspNo": 0, // 响应码 0:代表成功 其它值代码失败
                    "RspDesc": "OK" // 响应描述
                }
            ]
        }
    });

    return TradingBuyModel;
});