'use strict'

define([], function() {

	var TradingSellModel = Backbone.Model.extend({

        // https://elsejj.gitbooks.io/dzhyun/content/src/2-%E8%A1%8C%E6%83%85%E6%9C%8D%E5%8A%A1/4-%E5%A4%A7%E8%A1%8C%E6%83%85.html
        url: 'data/trading.json',
        defaults: {
            "JiaoYiZhangHu": [{
                    "ZhangHuMing": "A股教学赛1",
                    "ZhangHuHao": "JXA000001"
                }, {
                    "ZhangHuMing": "B股教学赛1",
                    "ZhangHuHao": "JXB000001"
                }],
            "Obj": "SH601519",
            "MingZi": "大智慧",
            "WeiTuoJia": 14.54,
            "KeMaiShu": 0,

            "stock": {
                "Id": 27, //大行情消息ID
                "RepDataStkData": [
                    {
                        "obj": "SH601519",  //交易代码
                        "ZhongWenJianCheng": "大智慧", //中文简称
                        "ZuiXinJia": 81.14, //最新价(元)
                        "KaiPanJia": 83.75, //开盘价(元)
                        "ZuiGaoJia": 83.79, //最高价(元)
                        "ZuiDiJia": 78.8, //最低价(元)
                        "ZuoShou": 81.8,  //昨收(元)
                        "JunJia": 81.79,  //均价(元)
                        "ZhangDie": -0.66,  //涨跌(元)
                        "ZhangFu": -0.81, //涨幅-0.81%
                        "ZhenFu": 6.1,  //振幅6.1%
                        "ChengJiaoLiang": 15216100, //成交量(股)
                        "XianShou": 1700, //现手(股)
                        "ChengJiaoE": 1.244542464e+09,  //成交额(元)
                        "ZongChengJiaoBiShu": 33042,  //总成交笔数
                        "HuanShou": 6.04, //换手6.04%
                        "LiangBi": 0.61,  //量比
                        "NeiPan": 7540900,  //内盘(股)
                        "WaiPan": 7675200,  //外盘(股)
                        "WeiTuoMaiRuJia1": 81.14, //委托买入价1(元)
                        "WeiTuoMaiRuJia2": 81.13, //委托买入价2(元)
                        "WeiTuoMaiRuJia3": 81.12, //委托买入价3(元)
                        "WeiTuoMaiRuJia4": 81.1,  //委托买入价4(元)
                        "WeiTuoMaiRuJia5": 81,  //委托买入价5(元)
                        "WeiTuoMaiRuLiang1": 1300,  //委托买入量1(股)
                        "WeiTuoMaiRuLiang2": 100, //委托买入量2(股)
                        "WeiTuoMaiRuLiang3": 1000,  //委托买入量3(股)
                        "WeiTuoMaiRuLiang4": 600, //委托买入量4(股)
                        "WeiTuoMaiRuLiang5": 34800, //委托买入量5(股)
                        "WeiTuoMaiChuJia1": 81.2, //委托卖出价1(元)
                        "WeiTuoMaiChuJia2": 81.29,  //委托卖出价2(元)
                        "WeiTuoMaiChuJia3": 81.3, //委托卖出价3(元)
                        "WeiTuoMaiChuJia4": 81.48,  //委托卖出价4(元)
                        "WeiTuoMaiChuJia5": 81.49,  //委托卖出价5(元)
                        "WeiTuoMaiChuLiang1": 500,  //委托卖出量1(股)
                        "WeiTuoMaiChuLiang2": 800,  //委托卖出量2(股)
                        "WeiTuoMaiChuLiang3": 600,  //委托卖出量3(股)
                        "WeiTuoMaiChuLiang4": 500,  //委托卖出量4(股)
                        "WeiTuoMaiChuLiang5": 100,  //委托卖出量5(股)
                        "WeiBi": 87.59, //委比87.59%
                        "WeiCha": 353,  //委差(手)
                        "FenZhongZhangFu1": 0.01, //1分钟涨幅(元)
                        "FenZhongZhangFu2": -0.18,  //2分钟涨幅(元)
                        "FenZhongZhangFu3": -0.67,  //3分钟涨幅(元)
                        "FenZhongZhangFu4": -0.32,  //4分钟涨幅(元)
                        "FenZhongZhangFu5": -0.28,  //5分钟涨幅(元)
                        "ZhangTing": 89.98, //涨停价(元)
                        "DieTing": 73.62, //跌停价(元)
                        "ShiJian": 1446532698,  //Unix时间
                        "LeiXing": 1, //类型: (0，指数;1，股票;2，基金;3，债券)
                        "ZiLeiXing": 65,  //子类型(65, A股;66, B股;71, 国债;79, 企业债;70, 金融债)
                        "LeiXingMingCheng": "创业板",  //类型名称
                        "ChengJiaoLiangDanWei": 100,  //每手股数
                        "PinZhongObj": "SH601519",  //交易代码
                        "BaoGaoQi": "20150930000000", //报告期
                        "ShangShiRiQi": "20091225", //上市日期
                        "MeiGuShouYi": 0.9102,  //每股收益(元)
                        "MeiGuJingZiChan": 3.0864,  //每股净资产(元)
                        "JingZiChanShouYiLv": 29.4899,  //净资产收益率
                        "MeiGuJingYingXianJin": 1.7779, //每股经营现金(元)
                        "MeiGuGongJiJin": 0.6636, //每股公积金(元)
                        "MeiGuWeiFenPei": 1.3733, //每股未分配(元)
                        "GuDongQuanYiBi": 59.0188,  //股东权益比
                        "JingLiRunTongBi": 2179.6632, //净利润同比
                        "ZhuYingShouRuTongBi": 378.8595,  //主营收入同比
                        "XiaoShouMaoLiLv": 84.2389, //销售毛利率
                        "TiaoZhengMeiGuJingZi": 3.0291, //调整每股净资(元)
                        "ZongZiChan": 281137.4462,  //总资产(万元)
                        "LiuDongZiChan": 243946.7482, //流动资产(万元)
                        "GuDingZiChan": 14928.2858, //固定资产(万元)
                        "WuXingZiChan": 2688.5318,  //无形资产(万元)
                        "LiuDongFuZhai": 114239.7458, //流动负债(万元)
                        "ChangQiFuZhai": 973.8254,  //长期负债(万元)
                        "ZongFuZhai": 115213.5712,  //总负债(万元)
                        "GuDongQuanYi": 165923.875, //股东权益(万元)
                        "ZiBenGongJiJin": 35677.5876, //资本公积金(万元)
                        "JingYingXianJinLiuLiang": 95581.4774,  //经营现金流量(万元)
                        "TouZiXianJinLiuLiang": -18257.3101,  //投资现金流量(万元)
                        "ChouZiXianJinLiuLiang": -2150.4, //筹资现金流量(万元)
                        "XianJinZengJiaE": 75176.046, //现金增加额(万元)
                        "ZhuYingShouRu": 76795.1913,  //主营收入(万元)
                        "ZhuYingLiRun": 63036.5085, //主营利润(万元)
                        "YingYeLiRun": 56806.2889,  //营业利润(万元)
                        "TouZiShouYi": 17663.857, //投资收益(万元)
                        "YingYeWaiShouZhi": 1643.1879,  //营业外收支(万元)
                        "LiRunZongE": 58449.4768, //利润总额(万元)
                        "JingLiRun": 48930.8767,  //净利润(万元)
                        "WeiFenPeiLiRun": 73828.984,  //未分配利润(万元)
                        "ZongGuBen": 53760, //总股本(万股)
                        "WuXianShouGuHeJi": 26199.8076, //无限售股合计(万股)
                        "LiuTongAGu": 26199.8076, //流通A股(万股)
                        "LiuTongBGu": 0,  //流通B股(万股)
                        "JingWaiShangShiGu": 0, //境外上市股(万股)
                        "QiTaLiuTongGu": 0, //其他流通股(万股)
                        "XianShouGuHeJi": 27560.1924, //限售股合计(万股)
                        "GuoJiaChiGu": 0, //国家持股(万股)
                        "GuoYouFaRenGu": 0, //国有法人股(万股)
                        "JingNeiFaRenGu": 4268.1924,  //境内法人股(万股)
                        "JingNeiZiRanRenGu": 0, //境内自然人股(万股)
                        "QiTaFaQiRenGu": null,  //其他法人股(万股)
                        "MuJiFaRenGu": 0, //募集法人股(万股)
                        "JingWaiFaRenGu": 0,  //境外自然人股(万股)
                        "JingWaiZiRanRenGu": 0, //优先股或其他(万股)
                        "YouXianGuHuoQiTa": 0, //优先股或其他(万股)
                        "ShangZhangJiaShu": 813,  //上涨家数
                        "XiaDieJiaShu": 1028, //下跌家数
                        "PingPanJiaShu": 284, //平盘家数
                        "AGuShangZhangJiaShu": 605, //A股上涨家数
                        "AGuXiaDieJiaShu": 643, //A股下跌家数
                        "AGuPingPanJiaShu": 251,  //A股平盘家数
                        "AGuChengJiaoE": 328513250740,  //A股成交额(元)
                        "BGuShangZhangJiaShu": 0, //B股上涨家数
                        "BGuXiaDieJiaShu": 0, //B股下跌家数
                        "BGuPingPanJiaShu": 0,  //B股平盘家数
                        "BGuChengJiaoE": 0, //B股成交额(元)
                        "JiJinShangZhangJiaShu": 0, //基金上涨家数
                        "JiJinXiaDieJiaShu": 0, //基金下跌家数
                        "JiJinPingPanJiaShu": 0,  //基金平盘家数
                        "JiJinChengJiaoE": 0, //基金成交额(元)
                        "QiTaShangZhangJiaShu": 208,  //其它上涨家数
                        "QiTaXiaDieJiaShu": 385,  //其它下跌家数
                        "QiTaPingPanJiaShu": 33,  //其它平盘家数
                        "QiTaChengJiaoE": 16723708576830,  //其它成交额(元)
                        "ShiYingLv":79.9028,  //市盈率（动）
                        "ShiJingLv":31.4185,  //市净率
                        "ZongShiZhi":5213107, //总市值(万元)
                        "LiuTongShiZhi":2540595 //流通市值(万元)
                    }
                ]
            }
        }
    });

    return TradingSellModel;
});