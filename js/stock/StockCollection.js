'use strict'

define(['stock/StockModel'/*, 'socket.io', 'iobind', 'iosync'*/], function(StockModel/*, io*/) {

    // window.socket = io.connect('http://v2.yundzh.com');

	var StockCollection = Backbone.Collection.extend({
        model: StockModel,
        // url: 'data/stocks.json',
        url: 'http://v2.yundzh.com/stkdata',
        // url: 'stkdata',
        // socket:window.socket,
        initialize: function () {
            // _.bindAll(this, 'parse');
            // this.ioBind('change', this.parse, this);
        },

        parse: function(collection) {
        	// return this.add(collection);
        	return this.add(collection.Data.RepDataStkData);
        }
    });

    return StockCollection;
});