'use strict'

define([], function() {

	var QuoteModel = Backbone.Model.extend({
        // url: 'data/quote.json',
        url: 'http://v2.yundzh.com/quote/dyna',
        defaults: {
            "Id": 888, 
            "RepDataQuoteDynaSingle": [
                {
                    "Obj": "SH600000", 
                    "Data": {
                        "Id": "888888", 
                        "ShiJian": "1234567890", 
                        "ZhongWenJianCheng": "浦发银行",
                        "ZuiXinJia": 16, 
                        "ZhangDie": 1,
                        "ZhangFu": -0.10,
                        "ZuiGaoJia": 18, 
                        "ZuiDiJia": 15, 
                        "HuanShou": 0.05, 
                        "ChengJiaoLiang": 123
                    }
                }
            ]
        }
    });

    return QuoteModel;
});