'use strict';

(function (window) {
    //配置baseUrl
    var baseUrl = document.getElementById('main').getAttribute('data-baseurl');

    /*
     * 文件依赖
     */
    var config = {
        baseUrl: baseUrl,           //依赖相对路径
        paths: {                    //如果某个前缀的依赖不是按照baseUrl拼接这么简单，就需要在这里指出
            jquery: 'libs/jquery-1.12.1.min',
            bootstrap: 'libs/bootstrap.min',
            underscore: 'libs/underscore',
            backbone: 'libs/backbone',
            // iobind: 'libs/backbone.iobind.min',
            // iosync: 'libs/backbone.iosync.min',
            highstock: 'libs/highstock',
            text: 'libs/text',             //用于requirejs导入html类型的依赖
            xdomainrequest: 'libs/jquery.xdomainrequest.min'
        },
        shim: {                     //引入没有使用requirejs模块写法的类库。backbone依赖underscore
            'underscore': {
                exports: '_'
            },
            'jquery': {
                exports: '$'
            },
            'backbone': {
                deps: ['underscore', 'jquery', 'xdomainrequest'],
                exports: 'Backbone'
            },
            'bootstrap': {
                deps: ['jquery'],
                exports: 'Bootstrap'
            },
            'highstock': {
                exports: 'highstock'
            },
            /*'iobind': {
                exports: 'iobind'
            },
            'iosync': {
                exports: 'iosync'
            },*/
            'router-cfg-version': {
                deps: ['backbone']
            },
            'app': {
                deps: ['backbone']
            }
        }
    };

    require.config(config);

    //Backbone会把自己加到全局变量中
    require(['bootstrap', 'router-cfg-version', 'app'], function(Bootstrap, Router, App){
    	
    	jQuery.support.cors = true; // 允许跨域访问
        
        Backbone.history.start();   //开始监控url变化

        var app = new App();
    });

})(window);