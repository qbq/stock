'use strict'

define(['stock/HSPriceView'], function (HSPriceView) {

    var hsPriceController = function () {
        var hsPriceView = new HSPriceView();
        // hsPriceView.render();
        return hsPriceView;
    };
    return hsPriceController;
});