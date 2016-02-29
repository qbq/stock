'use strict'

define(['chart/KlineChartView', 'chart/KlineChartModel'], function (KlineChartView, KlineChartModel) {

    var klineChartController = function (code) {
        var klineChartView = new KlineChartView({
        	model: new KlineChartModel(),
            code: code
        });
        // klineChartView.render();
        return klineChartView;
    };
    return klineChartController;
});