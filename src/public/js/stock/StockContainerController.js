'use strict'

define(['stock/StockContainerView', 'stock/StockCollection'], function (StockContainerView, StockCollection) {

    var stockContainerController = function (gql, orderby) {
        var stockContainerView = new StockContainerView({
        	collection: new StockCollection(),
        	orderby: orderby,
        	gql: gql
        });
        stockContainerView.render();
        return stockContainerView;
    };
    return stockContainerController;
});