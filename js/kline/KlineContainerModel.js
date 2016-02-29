'use strict'

define([], function() {

	var KlineModel = Backbone.Model.extend({
        defaults: {
            "code": "000868",
            "name": "安凯客车"
        }
    });

    return KlineModel;
});