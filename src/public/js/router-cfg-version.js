define([], function () {

    var routesMap = {
        'stockPriceHS': 'js/stock/StockContainerController.js',
        'tradingBuy': 'js/trading/TradingBuyController.js',
        'tradingSell': 'js/trading/TradingSellController.js',
        'positions': 'js/position/PositionController.js',
        'deal/:type': 'js/deal/DealController.js',
        'order/:type': 'js/order/OrderController.js',
        'rank': 'js/rank/RankController.js'
        // 'module2(/:name)': 'module2/controller2.js',
        // '*actions': 'defaultAction'
    };

    var Router = Backbone.Router.extend({

        routes: routesMap,

        defaultAction: function () {
            // console.log('404');
            // location.hash = 'module2';
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
            router.currentController = controller;
            if (controller) {
                currentView = controller.apply(null, params);     //每个模块约定都返回controller
            }
        });
    });

    return router;
});