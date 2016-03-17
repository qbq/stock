'use strict'

define(['Constants'], function(Constants) {

	var DealModel = Backbone.Model.extend({
        initialize: function(params) {
            params = params || {};
            this.gameno = params.gameno || '';
            this.capitalid = params.capitalid || '';
            this.type = params.type || 0;
        },
        url: function() {
            return Constants.QUERY_DEAL_URL
                    + this.gameno
                    + '?capitalid='
                    + this.capitalid
                    + '&type='
                    + Constants.DEAL_TYPES[this.type]
                    + '&token='
                    + Constants.ACCESS_TOKEN;
        },
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