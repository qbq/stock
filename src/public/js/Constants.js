'use strict'

define([], function() {

    return {
    	ACCESS_TOKEN: '00000011:1470039600:2db14efc6f396fa002f2d26a41306810fb34c5c1',
    	HANGQING_FIELDS: 'ZhongWenJianCheng,ZuiXinJia,ZhangDie,ZhangFu,ZuoShou,KaiPanJia,ZuiGaoJia,ZuiDiJia,ChengJiaoLiang,ChengJiaoE,HuanShou',
        QUOTE_FIELDS: 'ZhongWenJianCheng,ZuiXinJia,ZhangDie,ZhangFu,ZuiGaoJia,ZuiDiJia,ChengJiaoLiang,HuanShou',
    	GQL_LIST: {
    		'hushenagu': 'block=股票\\\\市场分类\\\\全部A股',
    		'zhongxiaoban': 'block=股票\\\\市场分类\\\\中小企业板',
    		'changyeban': 'block=股票\\\\市场分类\\\\创业板',
    		'hushenbgu': 'block=股票\\\\市场分类\\\\全部B股',
    		'wodezixuan': 'block=股票\\\\市场分类\\\\我的自选'
    	},
        PAGE_SIZE: 10
    };
});