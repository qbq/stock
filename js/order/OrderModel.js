'use strict'

define([], function() {

	var OrderModel = Backbone.Model.extend({
        url: 'data/queryorder.json',
        // url: '/counter/queryorder/1000?capitalid=10001&type=1',
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