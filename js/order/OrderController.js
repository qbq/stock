'use strict'

define(['order/OrderView', 'order/OrderModel'], function (OrderView, OrderModel) {

    var orderController = function (type) {
        var orderView = new OrderView({
        	model: new OrderModel({
        		type: type
        	})
        });
        // orderView.render();
        return orderView;
    };
    return orderController;
});