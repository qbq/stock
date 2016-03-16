'use strict'

define(['env'], function(env) {

    var WEBSOCKET_ADDRESSES = {
        'dev': 'ws://10.15.144.101:80/ws', // 内网
        'prod': 'ws://v2.yundzh.com/ws' // 外网
    },
    WEBSOCKET_ADDRESS = WEBSOCKET_ADDRESSES[env],
    HTTP_ADDRESSES = {
        'dev': 'http://localhost:8888/', // 内网
        'prod': 'http://v2.yundzh.com/' // 外网
    },
    HTTP_ADDRESS = HTTP_ADDRESSES[env],
    QUOTE_URIS = {
        'dev': 'data/quote.json', // 内网
        'prod': 'quote/dyna' // 外网
    },
    SEARCH_URIS = {
        'dev': 'data/search.json',
        'prod': 'kbspirit'
    },
    STOCK_URIS = {
        'dev': 'data/stocks.json',
        'prod': 'stkdata',
    },
    TRADE_INFO_URIS = {
        'dev': 'data/tradeinfo.json',
        'prod': 'stkdata'
    }

    return {
        WEBSOCKET_ADDRESS: WEBSOCKET_ADDRESS,
        HTTP_ADDRESS: HTTP_ADDRESS,

        QUOTE_URL: HTTP_ADDRESS + QUOTE_URIS[env],
        SEARCH_URL: HTTP_ADDRESS + SEARCH_URIS[env],
        STOCK_URL: HTTP_ADDRESS + STOCK_URIS[env],
        TRADE_INFO_URL: HTTP_ADDRESS + TRADE_INFO_URIS[env],

    	ACCESS_TOKEN: '00000014:1489067403:f9558817839d4489f4bbcb154e84b2d2bfc3dda9',

    	HANGQING_FIELDS: [
            'ZhongWenJianCheng',
            'ZuiXinJia',
            'ZhangDie',
            'ZhangFu',
            'ZuoShou',
            'KaiPanJia',
            'ZuiGaoJia',
            'ZuiDiJia',
            'ChengJiaoLiang',
            'ChengJiaoE',
            'HuanShou'
        ],

        TRADE_INFO_FIELDS: [
            'ZhongWenJianCheng',
            'ZuiXinJia',
            'ZuoShou',
            'ZhangTing',
            'DieTing',
            'WeiTuoMaiRuJia1',
            'WeiTuoMaiRuJia2',
            'WeiTuoMaiRuJia3',
            'WeiTuoMaiRuJia4',
            'WeiTuoMaiRuJia5',
            'WeiTuoMaiRuLiang1',
            'WeiTuoMaiRuLiang2',
            'WeiTuoMaiRuLiang3',
            'WeiTuoMaiRuLiang4',
            'WeiTuoMaiRuLiang5',
            'WeiTuoMaiChuJia1',
            'WeiTuoMaiChuJia2',
            'WeiTuoMaiChuJia3',
            'WeiTuoMaiChuJia4',
            'WeiTuoMaiChuJia5',
            'WeiTuoMaiChuLiang1',
            'WeiTuoMaiChuLiang2',
            'WeiTuoMaiChuLiang3',
            'WeiTuoMaiChuLiang4',
            'WeiTuoMaiChuLiang5',
        ],

        KLINE_DATASTORE_FIELDS: [
            'ZhongWenJianCheng',
            'ZuoShou',
            'ZuiGaoJia',
            'KaiPanJia',
            'ZuiDiJia',
            'ZuiXinJia',
            'ChengJiaoLiang',
            'ChengJiaoE',
            'ShiJian',
            'ZhangDie',
            'ZhangFu',
            'HuanShou'
        ],

        GQL_LIST: {
            'quanbuagu': 'block=股票\\\\市场分类\\\\全部A股',
            'shangzhengagu': 'block=股票\\\\市场分类\\\\上证A股',
            'shenzhengagu': 'block=股票\\\\市场分类\\\\深证A股',
            'zhongxiaoban': 'block=股票\\\\市场分类\\\\中小企业板',
            'changyeban': 'block=股票\\\\市场分类\\\\创业板',
            'wodezixuan': 'block=股票\\\\市场分类\\\\我的自选'
    	},

        PAGE_SIZE: 50,

        SEARCH_COUNT: 10,

        DEFAULT_VALUE: '--'
    };
});