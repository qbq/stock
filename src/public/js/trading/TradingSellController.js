'use strict'

define(['trading/TradingSellView', 'trading/TradingSellModel'], function (TradingSellView, TradingSellModel) {

    var tradingSellController = function () {
        var tradingSellView = new TradingSellView({
        	model: new TradingSellModel()
        });
        // hsPriceView.render();
        return tradingSellView;
    };
    return tradingSellController;
});