'use strict'

define([], function() {

	var StockModel = Backbone.Model.extend({
        defaults: {
            "code": "000868",
            "shortname": "安凯客车",
            "lastprice": 11.17,
            "change": 1.02,
            "percentage": 10.05,
            "lastclose": 10.15,
            "todayopen": 11.17,
            "highest": 11.17,
            "lowest": 11.01,
            "tradingqty": 545235,
            "tradingamount": 60889.52,
            "exchangerate": 7.84
        }
    });

    return StockModel;
});