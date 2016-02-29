define([], function () {

    var routesMap = {
        'stockPrice(/:key1/:value1/:key2/:value2/:key3/:value3)': 'js/stock/StockContainerController.js',
        'tradingBuy/:code(/:name)': 'js/trading/TradingBuyController.js',
        'tradingSell/:code(/:name)': 'js/trading/TradingSellController.js',
        'positions': 'js/position/PositionController.js',
        'deal/:type': 'js/deal/DealController.js',
        'order/:type': 'js/order/OrderController.js',
        'rank': 'js/rank/RankController.js',
        'focus': 'js/focus/FocusController.js',
        'kline/:code(/:name)': 'js/kline/KlineContainerController.js',
        // 'module2(/:name)': 'module2/controller2.js',
        '*actions': 'defaultAction'
    };

    var Router = Backbone.Router.extend({

        routes: routesMap,

        defaultAction: function () {
            // 未定义hash，跳转到首页
            location.hash = 'stockPriceHS';
        }

    });

    var router = new Router();
    var currentView = null;
    //彻底用on route接管路由的逻辑，这里route是路由对应的value
    router.on('route', function (route, params) {
        require([route], function (controller) {
            if(router.currentController && router.currentController !== controller){
                router.currentController.onRouteChange && router.currentController.onRouteChange();
            }
            if (currentView) {
                if (currentView['dispose']) {
                   currentView.dispose();
                } else {
                    currentView.remove();
                }
                $('#navbarContainer').after('<div id="bodyContainer" />');
            }
            router.currentController = controller;
            if (controller) {
                currentView = controller.apply(null, params);     //每个模块约定都返回controller
            }
        });
    });

    return router;
});