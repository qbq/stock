'use strict'

define(['Constants'], function(Constants) {

	var SearchModel = Backbone.Model.extend({
        initialize: function(params) {
            this.input = params.input;
        },
        // url: 'data/search.json',
        url: function() {
            return 'http://v2.yundzh.com/kbspirit?input='
                    + this.input
                    + '&count='
                    + Constants.SEARCH_COUNT
                    + '&token='
                    + Constants.ACCESS_TOKEN;
        },
        defaults: {
            "Counter": 888,
            "Data": {
              "Id": 888, ////键盘宝消息ID
              "RepDataJianPanBaoShuChu": [{
                "GuanJianZi": "d", //搜索关键字,同input                                              
                "JieGuo": [{
                  "LeiXing": 0, //类型:证券
                  "ShuJu": [{
                    "DaiMa": "SH600000", //股票代码
                    "ShuXing": "上证A股" //股票属性
                  }]
                }, {
                  "LeiXing": 1, //类型:指标
                  "ShuJu": [{
                    "DaiMa": "UPDOWN_R", //指标代码
                    "MingCheng": "  阴阳相关" //指标名称
                  }]
                }, {
                  "LeiXing": 2, //类型:主题
                  "ShuJu": [{
                    "DaiMa": "1319", //主题Id
                    "MingCheng": "体感3D", //主题名称
                    "KuoZhan": "SZ002410\nSH600363\nSZ000050\nSZ000973"
                  }]
                }]
              }]
            }
        }
    });

    return SearchModel;
});