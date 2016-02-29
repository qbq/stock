'use strict'

define(['position/PositionView', 'position/PositionModel'], function (PositionView, PositionModel) {

    var positionController = function () {
        var positionView = new PositionView({
        	model: new PositionModel()
        });
        // positionView.render();
        return positionView;
    };
    return positionController;
});