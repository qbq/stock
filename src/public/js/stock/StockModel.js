'use strict'

define([], function() {

	var StockModel = Backbone.Model.extend({
        defaults: {
            "Qid": "888", 
            "Err": 0, 
            "Counter": 1, 
            "Data": {
                "Id": 888, 
                "RepDataStkData": [
                    {
                        "Obj": "SH603027", 
                        "ZhongWenJianCheng": "N千禾", 
                        "ZuiXinJia": 13.23, 
                        "KaiPanJia": 11.03, 
                        "ZuiGaoJia": 13.23, 
                        "ZuiDiJia": 11.03, 
                        "ZuoShou": 9.19, 
                        "ZhangDie": 4.04, 
                        "ZhangFu": 43.96, 
                        "ChengJiaoLiang": 38600, 
                        "ChengJiaoE": 505991, 
                        "HuanShou": 0.1, 
                        "ShiJian": 1457333999
                    }, 
                    {
                        "Obj": "SZ000521", 
                        "ZhongWenJianCheng": "美菱电器", 
                        "ZuiXinJia": 5.68, 
                        "KaiPanJia": 5.22, 
                        "ZuiGaoJia": 5.68, 
                        "ZuiDiJia": 5.16, 
                        "ZuoShou": 5.16, 
                        "ZhangDie": 0.52, 
                        "ZhangFu": 10.08, 
                        "ChengJiaoLiang": 19515100, 
                        "ChengJiaoE": 109004296, 
                        "HuanShou": 3.29, 
                        "ShiJian": 1457334018
                    }, 
                    {
                        "Obj": "SH600891", 
                        "ZhongWenJianCheng": "秋林集团", 
                        "ZuiXinJia": 7.98, 
                        "KaiPanJia": 7.18, 
                        "ZuiGaoJia": 7.98, 
                        "ZuiDiJia": 7.15, 
                        "ZuoShou": 7.25, 
                        "ZhangDie": 0.73, 
                        "ZhangFu": 10.07, 
                        "ChengJiaoLiang": 15332000, 
                        "ChengJiaoE": 116270864, 
                        "HuanShou": 4.73, 
                        "ShiJian": 1457333999
                    }, 
                    {
                        "Obj": "SH600336", 
                        "ZhongWenJianCheng": "澳柯玛", 
                        "ZuiXinJia": 6.34, 
                        "KaiPanJia": 5.76, 
                        "ZuiGaoJia": 6.34, 
                        "ZuiDiJia": 5.75, 
                        "ZuoShou": 5.76, 
                        "ZhangDie": 0.58, 
                        "ZhangFu": 10.07, 
                        "ChengJiaoLiang": 37882700, 
                        "ChengJiaoE": 229611104, 
                        "HuanShou": 5.57, 
                        "ShiJian": 1457333999
                    }, 
                    {
                        "Obj": "SZ000088", 
                        "ZhongWenJianCheng": "盐 田 港", 
                        "ZuiXinJia": 7.66, 
                        "KaiPanJia": 7.66, 
                        "ZuiGaoJia": 7.66, 
                        "ZuiDiJia": 7.51, 
                        "ZuoShou": 6.96, 
                        "ZhangDie": 0.7, 
                        "ZhangFu": 10.06, 
                        "ChengJiaoLiang": 27685500, 
                        "ChengJiaoE": 212040784, 
                        "HuanShou": 1.43, 
                        "ShiJian": 1457334018
                    }, 
                    {
                        "Obj": "SZ002377", 
                        "ZhongWenJianCheng": "国创高新", 
                        "ZuiXinJia": 7.44, 
                        "KaiPanJia": 7, 
                        "ZuiGaoJia": 7.44, 
                        "ZuiDiJia": 7, 
                        "ZuoShou": 6.76, 
                        "ZhangDie": 0.68, 
                        "ZhangFu": 10.06, 
                        "ChengJiaoLiang": 13983500, 
                        "ChengJiaoE": 101989632, 
                        "HuanShou": 3.24, 
                        "ShiJian": 1457334018
                    }, 
                    {
                        "Obj": "SH600193", 
                        "ZhongWenJianCheng": "创兴资源", 
                        "ZuiXinJia": 10.29, 
                        "KaiPanJia": 9.8, 
                        "ZuiGaoJia": 10.29, 
                        "ZuiDiJia": 9.8, 
                        "ZuoShou": 9.35, 
                        "ZhangDie": 0.94, 
                        "ZhangFu": 10.05, 
                        "ChengJiaoLiang": 19176700, 
                        "ChengJiaoE": 196944928, 
                        "HuanShou": 4.51, 
                        "ShiJian": 1457333998
                    }, 
                    {
                        "Obj": "SH600248", 
                        "ZhongWenJianCheng": "延长化建", 
                        "ZuiXinJia": 8.87, 
                        "KaiPanJia": 8.15, 
                        "ZuiGaoJia": 8.87, 
                        "ZuiDiJia": 8.1, 
                        "ZuoShou": 8.06, 
                        "ZhangDie": 0.81, 
                        "ZhangFu": 10.05, 
                        "ChengJiaoLiang": 30588400, 
                        "ChengJiaoE": 265239248, 
                        "HuanShou": 6.54, 
                        "ShiJian": 1457333999
                    }, 
                    {
                        "Obj": "SH601969", 
                        "ZhongWenJianCheng": "海南矿业", 
                        "ZuiXinJia": 12.16, 
                        "KaiPanJia": 12.16, 
                        "ZuiGaoJia": 12.16, 
                        "ZuiDiJia": 12.02, 
                        "ZuoShou": 11.05, 
                        "ZhangDie": 1.11, 
                        "ZhangFu": 10.05, 
                        "ChengJiaoLiang": 13136400, 
                        "ChengJiaoE": 159725776, 
                        "HuanShou": 1.53, 
                        "ShiJian": 1457333999
                    }, 
                    {
                        "Obj": "SZ000820", 
                        "ZhongWenJianCheng": "金城股份", 
                        "ZuiXinJia": 11.83, 
                        "KaiPanJia": 11.08, 
                        "ZuiGaoJia": 11.83, 
                        "ZuiDiJia": 11.05, 
                        "ZuoShou": 10.75, 
                        "ZhangDie": 1.08, 
                        "ZhangFu": 10.05, 
                        "ChengJiaoLiang": 10624200, 
                        "ChengJiaoE": 125079456, 
                        "HuanShou": 4.81, 
                        "ShiJian": 1457334018
                    }
                ]
            }
        }
    });

    return StockModel;
});