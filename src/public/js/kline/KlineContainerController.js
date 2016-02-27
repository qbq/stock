'use strict'

define(['kline/KlineContainerView', 'kline/KlineContainerModel'], function (KlineContainerView, KlineContainerModel) {

    var klineContainerController = function (code, name) {
        var klineContainerView = new KlineContainerView({
        	model: new KlineContainerModel(),
    		code: code,
    		name: name || ''
        }).render();
        return klineContainerView;
    };
    return klineContainerController;
});