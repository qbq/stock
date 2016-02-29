'use strict'

define([], function() {

	var DealModel = Backbone.Model.extend({
        url: 'data/querydeal.json',
        // url: '/counter/querydeal/1000?capitalid=10001&type=1',
        defaults: {
            "Id": 888, 
            "RepQueryOrderRsp": [
                {
                    "RspNo": 0, 
                    "RspDesc": "OK", 
                    "OrderList": [
                        {
                            "DealNo": "500001", 
                            "DealTime": "201602220943", 
                            "ProductCode": "SH600000", 
                            "ProductName": "大智慧", 
                            "BuyOrSell": "B", 
                            "DealAmount": 3000, 
                            "DealPrice": 11.05, 
                            "Fee": 9.945
                        }, 
                        {
                            "DealNo": "500002", 
                            "DealTime": "201602221043", 
                            "ProductCode": "SZ002415", 
                            "ProductName": "海康威视", 
                            "BuyOrSell": "B", 
                            "DealAmount": 2000, 
                            "DealPrice": 23.05, 
                            "Fee": 13.83
                        }
                    ]
                }
            ]
        }
    });

    return DealModel;
});