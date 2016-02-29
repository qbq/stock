'use strict'

define(['price/PriceView'], function (PriceView) {

    var priceController = function () {
        var priceView = new PriceView();
        // priceView.render();
        return priceView;
    };
    return priceController;
});