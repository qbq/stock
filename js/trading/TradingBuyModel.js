'use strict'

define(['Constants'], function(Constants) {

	var TradingBuyModel = Backbone.Model.extend({

        url: function() {
            return Constants.TRADE_INIT_URL;
        },
        defaults: {
            "JiaoYiZhangHu": [{
                    "ZhangHuMing": "A股教学赛1",
                    "ZhangHuHao": "JXA000001"
                }, {
                    "ZhangHuMing": "A股教学赛2",
                    "ZhangHuHao": "JXA000002"
                }],
            "Obj": "SH601519",
            "MingZi": "大智慧",
            "WeiTuoJia": 14.54,
            "KeMaiShu": 0
        }
    });

    return TradingBuyModel;
});