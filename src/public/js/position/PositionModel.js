'use strict'

define([], function() {

	var PositionModel = Backbone.Model.extend({
        url: 'data/queryhold.json',
        // url: '/counter/queryhold/1000?capitalid=10001',
        defaults: {
            "Id": 888,
            "RepQueryHoldRsp": [
                {
                    "RspNo": 0,
                    "RspDesc": "OK",
                    "AvailCapital": 200000,
                    "FreezeCapital": 500000,
                    "TotalValue": 7000000,
                    "TotalCapital": 1300000,
                    "TotalProfit": 33120,
                    "StkHoldList": [
                        {
                            "HoldNo": "500001",
                            "ProductCode": "SH600000",
                            "ProductName": "大智慧",
                            "PosAmount": 3000,
                            "AvailAmount": 3000,
                            "AvgPosPrice": 10.05,
                            "NewPrice": 15.05,
                            "Value": 45150,
                            "Profit": 15000
                        },
                        {
                            "HoldNo": "500002",
                            "ProductCode": "SZ002415",
                            "ProductName": "海康威视",
                            "PosAmount": 3000,
                            "AvailAmount": 3000,
                            "AvgPosPrice": 20.51,
                            "NewPrice": 26.55,
                            "Value": 79650,
                            "Profit": 18120
                        }
                    ]
                }
            ]
        }
    });

    return PositionModel;
});