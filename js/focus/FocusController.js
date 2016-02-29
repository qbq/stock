'use strict'

define(['focus/FocusView', 'focus/FocusModel'], function (FocusView, FocusModel) {

    var focusController = function () {
        var focusView = new FocusView({
            model: new FocusModel()
        });
        // focusView.render();
        return focusView;
    };
    return focusController;
});