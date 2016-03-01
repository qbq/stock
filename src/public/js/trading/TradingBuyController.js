'use strict'

define(['trading/TradingBuyView', 'trading/TradingBuyModel'], function (TradingBuyView, TradingBuyModel) {

    var tradingBuyController = function (code, name) {
        var tradingBuyView = new TradingBuyView({
        	model: new TradingBuyModel(),
        	code: code,
        	name: name
        });
        // hsPriceView.render();
        return tradingBuyView;
    };
    return tradingBuyController;
});