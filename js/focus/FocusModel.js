'use strict'

define([], function() {

	var FocusModel = Backbone.Model.extend({
        // url: 'data/queryfocus.json',
        url: 'http://v2.yundzh.com/stkdata?gql=block=股票\\\\市场分类\\\\全部A股&orderby=ZhangFu&desc=true&start=0&count=10&field=ZhongWenJianCheng,ZuiXinJia,ZhangDie,ZhangFu,ZuoShou,KaiPanJia,ZuiGaoJia,ZuiDiJia,ChengJiaoLiang,ChengJiaoE,HuanShou&mode=2&token=00000011:1470039600:2db14efc6f396fa002f2d26a41306810fb34c5c1',
        defaults: {
            "Qid": "888",
            "Err": 0,
            "Counter": 1,
            "Data": {
                "Id": 27,
                "RepDataStkData": [{
                    "Obj": "SZ000698",
                    "ZhongWenJianCheng": "沈阳化工",
                    "ZuiXinJia": 6.45,
                    "KaiPanJia": 6.18,
                    "ZuiGaoJia": 6.45,
                    "ZuiDiJia": 6.16,
                    "ZuoShou": 5.86,
                    "ZhangDie": 0.59,
                    "ZhangFu": 10.07,
                    "ChengJiaoLiang": 20769200,
                    "ChengJiaoE": 1.33218696e+08,
                    "HuanShou": 4.8,
                    "ShiJian": 1456470020
                }]
            }
        }
    });

    return FocusModel;
});