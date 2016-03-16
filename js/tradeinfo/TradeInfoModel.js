'use strict'

define(['Constants'], function(Constants) {

	var TradeInfoModel = Backbone.Model.extend({
      initialize: function(params) {
          this.obj = params.obj;
      },
      url: function() {
          return Constants.TRADE_INFO_URL
                  + '?obj='
                  + this.obj
                  + '&field='
                  + Constants.TRADE_INFO_FIELDS.join(',')
                  + '&token='
                  + Constants.ACCESS_TOKEN;
      },
      defaults: {
        "Counter": 1,
        "Data": {
          "Id": 888, //大行情消息ID
          "RepDataStkData": [
            {
              "obj": "SH601519", //交易代码
              "ZhongWenJianCheng": "大智慧", //中文简称
              "ZuiXinJia": 81.14, //最新价(元)
              "ZuoShou": 81.8, //昨收(元)
              "ZhangTing": 89.98, //涨停价(元)
              "DieTing": 73.62, //跌停价(元)
              "WeiTuoMaiRuJia1": 81.14, //委托买入价1(元)
              "WeiTuoMaiRuJia2": 81.13, //委托买入价2(元)
              "WeiTuoMaiRuJia3": 81.12, //委托买入价3(元)
              "WeiTuoMaiRuJia4": 81.1, //委托买入价4(元)
              "WeiTuoMaiRuJia5": 81, //委托买入价5(元)
              "WeiTuoMaiRuLiang1": 1300, //委托买入量1(股)
              "WeiTuoMaiRuLiang2": 100, //委托买入量2(股)
              "WeiTuoMaiRuLiang3": 1000, //委托买入量3(股)
              "WeiTuoMaiRuLiang4": 600, //委托买入量4(股)
              "WeiTuoMaiRuLiang5": 34800, //委托买入量5(股)
              "WeiTuoMaiChuJia1": 81.2, //委托卖出价1(元)
              "WeiTuoMaiChuJia2": 81.29, //委托卖出价2(元)
              "WeiTuoMaiChuJia3": 81.3, //委托卖出价3(元)
              "WeiTuoMaiChuJia4": 81.48, //委托卖出价4(元)
              "WeiTuoMaiChuJia5": 81.49, //委托卖出价5(元)
              "WeiTuoMaiChuLiang1": 500, //委托卖出量1(股)
              "WeiTuoMaiChuLiang2": 800, //委托卖出量2(股)
              "WeiTuoMaiChuLiang3": 600, //委托卖出量3(股)
              "WeiTuoMaiChuLiang4": 500, //委托卖出量4(股)
              "WeiTuoMaiChuLiang5": 100 //委托卖出量5(股)
            }

          ]
        }
      }
    });

    return TradeInfoModel;
});