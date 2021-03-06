'use strict'

define([], function() {

	var KlineChartModel = Backbone.Model.extend({
        url: 'data/chart.json',
        // url: 'https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-ohlcv.json&callback=render',
        // url: '/counter/querydeal/1000?capitalid=10001&type=1',
        defaults: {
            "Id": 888, 
            "data": [
                [1235952000000,12.59,13.03,12.52,12.56,192742970],
                [1236038400000,12.70,12.96,12.55,12.62,181084918],
                [1236124800000,12.88,13.25,12.78,13.02,185381623],
                [1236211200000,12.92,13.12,12.64,12.69,176723638],
                [1236297600000,12.62,12.63,11.76,12.19,252786562],
                [1236556800000,12.03,12.51,11.80,11.87,174619354],
                [1236643200000,12.12,12.74,12.05,12.66,211126251],
                [1236729600000,12.83,13.44,12.80,13.24,211696254],
                [1236816000000,13.27,13.80,13.14,13.76,192203340],
                [1236902400000,13.76,13.89,13.57,13.70,150320072],
                [1237161600000,13.79,13.91,13.45,13.63,199386740],
                [1237248000000,13.61,14.24,13.58,14.24,197005102],
                [1237334400000,14.27,14.78,14.25,14.50,199050355],
                [1237420800000,14.55,14.74,14.32,14.52,125079465],
                [1237507200000,14.58,14.73,14.37,14.51,173926123],
                [1237766400000,14.67,15.45,14.54,15.38,166641097],
                [1237852800000,15.19,15.63,15.06,15.21,160856745],
                [1237939200000,15.37,15.48,14.84,15.21,161662886],
                [1238025600000,15.40,15.71,15.37,15.70,154062776],
                [1238112000000,15.46,15.50,15.20,15.26,123260683],
                [1238371200000,14.93,15.00,14.66,14.93,125715345],
                [1238457600000,15.06,15.35,15.00,15.02,142519909]
            ]
        }
    });

    return KlineChartModel;
});