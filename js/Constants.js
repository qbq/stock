'use strict'

define([], function() {

    return {
    	ACCESS_TOKEN: '00000014:1489067403:f9558817839d4489f4bbcb154e84b2d2bfc3dda9',
    	HANGQING_FIELDS: 'ZhongWenJianCheng,ZuiXinJia,ZhangDie,ZhangFu,ZuoShou,KaiPanJia,ZuiGaoJia,ZuiDiJia,ChengJiaoLiang,ChengJiaoE,HuanShou',
        QUOTE_FIELDS: 'ZhongWenJianCheng,ZuiXinJia,ZhangDie,ZhangFu,ZuiGaoJia,ZuiDiJia,ChengJiaoLiang,HuanShou',
    	GQL_LIST: {
            'quanbuagu': 'block=股票\\\\市场分类\\\\全部A股',
            'shangzhengagu': 'block=股票\\\\市场分类\\\\上证A股',
            'shenzhengagu': 'block=股票\\\\市场分类\\\\深证A股',
            'zhongxiaoban': 'block=股票\\\\市场分类\\\\中小企业板',
            'changyeban': 'block=股票\\\\市场分类\\\\创业板',
            'wodezixuan': 'block=股票\\\\市场分类\\\\我的自选'
    	},
        PAGE_SIZE: 10
    };
});