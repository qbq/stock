'use strict'

define(['trading/TradingBuyView', 'trading/TradingBuyModel'], function (TradingBuyView, TradingBuyModel) {

    var tradingBuyController = function () {
        var tradingBuyView = new TradingBuyView({
        	model: new TradingBuyModel()
        });
        // hsPriceView.render();
        return tradingBuyView;
    };
    return tradingBuyController;
});