'use strict'

define(['stock/StockModel'], function(StockModel) {

	var StockCollection = Backbone.Collection.extend({
        model: StockModel,
        // url: 'data/stocks.json',
        url: 'http://v2.yundzh.com/stkdata',
        parse: function(collection) {
        	// return this.add(collection);
        	return this.add(collection.Data.RepDataStkData);
        }
    });

    return StockCollection;
});