'use strict'

define(['stock/StockContainerView'], function (StockContainerView) {

    var stockContainerController = function (key1, value1, key2, value2, key3, value3) {
        var params = {};
        if (key1) {
            params[key1] = value1;
        }
        if (key2) {
            params[key2] = value2;
        }
        if (key3) {
            params[key3] = value3;
        }
        
        var stockContainerView = new StockContainerView(params);
        stockContainerView.render();
        return stockContainerView;
    };
    return stockContainerController;
});