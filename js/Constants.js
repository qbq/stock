'use strict'

define(['env'], function(env) {

    var WEBSOCKET_ADDRESSES = {
        'dev': 'ws://10.15.144.101:80/ws', // 内网
        'prod': 'ws://v2.yundzh.com/ws' // 外网
    },
    WEBSOCKET_ADDRESS = WEBSOCKET_ADDRESSES[env.stock],
    HTTP_ADDRESSES = {
        'dev': 'http://localhost:8888/', // 内网
        'prod': 'http://v2.yundzh.com/' // 外网
    },
    STOCK_HTTP_ADDRESS = HTTP_ADDRESSES[env.stock],
    TRADE_HTTP_ADDRESS = HTTP_ADDRESSES[env.trade],
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
    },
    QUERY_CAPITAL_URIS = {
        'dev': 'data/querycapital.json',
        'prod': 'counter/querycapital/'
    },
    TRADE_INIT_URIS = {
        'dev': 'data/tradeinit.json',
        'prod': 'counter/tradeinit/' // TODO missing now
    },
    MAKE_ORDER_URIS = {
        'dev': 'data/makeorder_s.json',
        // 'dev': 'data/makeorder_f.json', // 测试用，交易失败
        'prod': 'counter/makeorder/'
    },
    QUERY_HOLD_URIS = {
        'dev': 'data/queryhold.json',
        'prod': 'counter/queryhold/'
    },
    QUERY_ORDER_URIS = {
        'dev': 'data/queryorder.json',
        'prod': 'counter/queryorder/'
    },
    QUERY_DEAL_URIS = {
        'dev': 'data/querydeal.json',
        'prod': 'counter/querydeal/'
    };

    return {
        WEBSOCKET_ADDRESS: WEBSOCKET_ADDRESS,
        HTTP_ADDRESS: STOCK_HTTP_ADDRESS,

        QUOTE_URL: STOCK_HTTP_ADDRESS + QUOTE_URIS[env.stock],
        SEARCH_URL: STOCK_HTTP_ADDRESS + SEARCH_URIS[env.stock],
        STOCK_URL: STOCK_HTTP_ADDRESS + STOCK_URIS[env.stock],
        TRADE_INFO_URL: STOCK_HTTP_ADDRESS + TRADE_INFO_URIS[env.stock],

        QUERY_CAPITAL_URL: TRADE_HTTP_ADDRESS + QUERY_CAPITAL_URIS[env.trade],
        TRADE_INIT_URL: TRADE_HTTP_ADDRESS + TRADE_INIT_URIS[env.trade],
        MAKE_ORDER_URL: TRADE_HTTP_ADDRESS + MAKE_ORDER_URIS[env.trade],
        QUERY_HOLD_URL: TRADE_HTTP_ADDRESS + QUERY_HOLD_URIS[env.trade],
        QUERY_ORDER_URL: TRADE_HTTP_ADDRESS + QUERY_ORDER_URIS[env.trade],
        QUERY_DEAL_URL: TRADE_HTTP_ADDRESS + QUERY_DEAL_URIS[env.trade],

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

        DEFAULT_VALUE: '--',

        DEAL_TYPES: {
            'today': 0,
            'history': 1
        },

        ORDER_TYPES: {
            'today': 0,
            'history': 1
        }
    };
});