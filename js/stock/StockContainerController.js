'use strict'

define(['stock/StockContainerView', 'stock/StockCollection'], function (StockContainerView, StockCollection) {

    var stockContainerController = function (key1, value1, key2, value2, key3, value3) {
        var params = {};
        params[key1] = value1;
        params[key2] = value2;
        params[key3] = value3;
        params.collection = new StockCollection();
        var stockContainerView = new StockContainerView(params);
        stockContainerView.render();
        return stockContainerView;
    };
    return stockContainerController;
});