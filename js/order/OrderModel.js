'use strict'

define(['Constants'], function(Constants) {

	var OrderModel = Backbone.Model.extend({
        initialize: function(params) {
            params = params || {};
            this.gameno = params.gameno || '';
            this.capitalid = params.capitalid || '';
            this.type = params.type || 0;
        },
        url: function() {
            return Constants.QUERY_ORDER_URL
                    + this.gameno
                    + '?capitalid='
                    + this.capitalid
                    + '&type='
                    + Constants.ORDER_TYPES[this.type]
                    + '&token='
                    + Constants.ACCESS_TOKEN;
        },
        defaults: {
            "Id": 888,
            "RepQueryOrderRsp": [{
                "RspNo": 0,
                "RspDesc": "OK",
                "OrderList": [{
                    "OrderNo": "500001",
                    "OrderTime": "201602220943",
                    "ProductCode": "SH600000",
                    "ProductName": "大智慧",
                    "BuyOrSell": "B",
                    "OrderType": "R",
                    "OrderAmount": 3000,
                    "OrderPrice": 11.05,
                    "Status": "已成交"
                },
                {
                    "OrderNo": "500002",
                    "OrderTime": "201602221043",
                    "ProductCode": "SZ002415",
                    "ProductName": "海康威视",
                    "BuyOrSell": "B",
                    "OrderType": "R",
                    "OrderAmount": 2000,
                    "OrderPrice": 23.05,
                    "Status": "已成交"
                }]
            }]
        }
    });

    return OrderModel;
});