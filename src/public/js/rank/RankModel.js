'use strict'

define([], function() {

	var RankModel = Backbone.Model.extend({
        url: 'data/queryrank.json',
        // url: 'missing',
        defaults: {
            "Id": 888,
            "RepQueryRankRsp": [
                {
                    "MyRank": 6,
                    "RankList": [
                        {
                            "RankNo": 1,
                            "StudentName": "张三",
                            "StudentNo": "201111111",
                            "CompName": "A股教学赛",
                            "TotalProfit": 20.33,
                            "AvgMonthProfit": 10.00,
                            "AvgWeekProfit": 10.00,
                            "AvgDayProfit": 10.00,
                            "TotalCapital": 50000.00
                        },
                        {
                            "RankNo": 2,
                            "StudentName": "李四",
                            "StudentNo": "201111112",
                            "CompName": "A股教学赛",
                            "TotalProfit": 20.33,
                            "AvgMonthProfit": 10.00,
                            "AvgWeekProfit": 10.00,
                            "AvgDayProfit": 10.00,
                            "TotalCapital": 50000.00
                        }
                    ]
                }
            ]
        }
    });

    return RankModel;
});