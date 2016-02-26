'use strict'

define(['rank/RankView', 'rank/RankModel'], function (RankView, RankModel) {

    var rankController = function () {
        var rankView = new RankView({
        	model: new RankModel()
        });
        // rankView.render();
        return rankView;
    };
    return rankController;
});