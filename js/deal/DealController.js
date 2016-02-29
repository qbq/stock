'use strict'

define(['deal/DealView', 'deal/DealModel'], function (DealView, DealModel) {

    var dealController = function (type) {
        var dealView = new DealView({
        	model: new DealModel({
        		type: type
        	})
        });
        // dealView.render();
        return dealView;
    };
    return dealController;
});