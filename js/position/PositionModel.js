'use strict'

define(['Constants'], function(Constants) {

	var PositionModel = Backbone.Model.extend({
        initialize: function(params) {
            params = params || {};
            this.gameno = params.gameno || '';
            this.capitalid = params.capitalid;
        },
        url: function() {
            return Constants.QUERY_HOLD_URL
                    + this.gameno
                    + '?capitalid='
                    + this.capitalid
                    + '&token='
                    + Constants.ACCESS_TOKEN;
        },
        defaults: {
            "Id": 888,
            "RepQueryHoldRsp": [{
                "RspNo": 0,
                "RspDesc": "OK",
                "AvailCapital": 200000,
                // 可用资金
                "FreezeCapital": 500000,
                // 冻结资金
                "TotalValue": 7000000,
                // 总市值
                "TotalCapital": 1300000, // 总资产=总市值+冻结资金+可用资金
                "TotalProfit": 33120,
                // 总盈亏
                "StkHoldList": [{
                    "HoldNo": "500001",
                    //持仓编号
                    "ProductCode": "SH600000",
                    //合约代码
                    "ProductName": "大智慧",
                    //合约名称
                    "PosAmount": 3000,
                    //持仓量
                    "AvailAmount": 3000,
                    //可用量
                    "AvgPosPrice": 10.05,
                    //平均持仓成本
                    "NewPrice": 15.05,
                    //现价
                    "Value": 45150,
                    //市值
                    "Profit": 15000 //盈亏
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
                }]
            }]
        }
    });

    return PositionModel;
});