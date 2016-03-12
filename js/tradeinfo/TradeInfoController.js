'use strict'

define(['tradeinfo/TradeInfoView', 'search/TradeInfoModel'], function (TradeInfoView, TradeInfoModel) {

    var tradeinfoController = function () {
        var tradeinfoView = new TradeInfoView({
        	model: new TradeInfoModel()
        });
        // tradeinfoView.render();
        return tradeinfoView;
    };
    return tradeinfoController;
});