'use strict'

define(['stock/StockContainerView'], function (StockContainerView) {

    var stockContainerController = function () {
        var stockContainerView = new StockContainerView();
        stockContainerView.render();
        return stockContainerView;
    };
    return stockContainerController;
});