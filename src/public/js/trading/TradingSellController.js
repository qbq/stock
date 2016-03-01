'use strict'

define(['trading/TradingSellView', 'trading/TradingSellModel'], function (TradingSellView, TradingSellModel) {

    var tradingSellController = function (code, name) {
        var tradingSellView = new TradingSellView({
        	model: new TradingSellModel(),
        	code: code,
        	name: name
        });
        // hsPriceView.render();
        return tradingSellView;
    };
    return tradingSellController;
});