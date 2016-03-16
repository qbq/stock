'use strict'

define(['stock/StockModel', 'Constants'], function(StockModel, Constants) {

	var StockCollection = Backbone.Collection.extend({
        model: StockModel,
        url: Constants.STOCK_URL,
        initialize: function () {
        },

        parse: function(collection) {
        	return this.add(collection.Data.RepDataStkData);
        }
    });

    return StockCollection;
});