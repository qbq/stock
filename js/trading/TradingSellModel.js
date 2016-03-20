'use strict'

define(['Constants'], function(Constants) {

	var TradingSellModel = Backbone.Model.extend({

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
                }]
        }
    });

    return TradingSellModel;
});