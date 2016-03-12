'use strict'

define([], function() {

    return {
    	ACCESS_TOKEN: '00000014:1489067403:f9558817839d4489f4bbcb154e84b2d2bfc3dda9',
    	HANGQING_FIELDS: 'ZhongWenJianCheng,ZuiXinJia,ZhangDie,ZhangFu,ZuoShou,KaiPanJia,ZuiGaoJia,ZuiDiJia,ChengJiaoLiang,ChengJiaoE,HuanShou',
        QUOTE_FIELDS: 'ZhongWenJianCheng,ZuiXinJia,ZhangDie,ZhangFu,ZuiGaoJia,ZuiDiJia,ChengJiaoLiang,HuanShou',
    	TRADE_INFO_FIELDS: 'ZhongWenJianCheng,ZuiXinJia,ZuoShou,ZhangTing,DieTing,WeiTuoMaiRuJia1,WeiTuoMaiRuJia2,WeiTuoMaiRuJia3,WeiTuoMaiRuJia4,WeiTuoMaiRuJia5,WeiTuoMaiRuLiang1, WeiTuoMaiRuLiang2,WeiTuoMaiRuLiang3,WeiTuoMaiRuLiang4,WeiTuoMaiRuLiang5,WeiTuoMaiChuJia1,WeiTuoMaiChuJia2,WeiTuoMaiChuJia3,WeiTuoMaiChuJia4,WeiTuoMaiChuJia5,WeiTuoMaiChuLiang1,WeiTuoMaiChuLiang2,WeiTuoMaiChuLiang3,WeiTuoMaiChuLiang4,WeiTuoMaiChuLiang5',
        GQL_LIST: {
            'quanbuagu': 'block=股票\\\\市场分类\\\\全部A股',
            'shangzhengagu': 'block=股票\\\\市场分类\\\\上证A股',
            'shenzhengagu': 'block=股票\\\\市场分类\\\\深证A股',
            'zhongxiaoban': 'block=股票\\\\市场分类\\\\中小企业板',
            'changyeban': 'block=股票\\\\市场分类\\\\创业板',
            'wodezixuan': 'block=股票\\\\市场分类\\\\我的自选'
    	},
        PAGE_SIZE: 10,

        SEARCH_COUNT: 10,

    };
});