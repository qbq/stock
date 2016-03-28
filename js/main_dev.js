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
            xdomainrequest: 'libs/jquery.xdomainrequest.min',
            Long: 'libs/Long',
            ByteBuffer: 'libs/ByteBufferAB',
            protobufjs: 'libs/ProtoBuf-light',
            connection: 'libs/connection',
            yfloat: 'libs/yfloat',
            DataStore: 'libs/datastore.all.min',
            Chart: 'libs/chart',
            ChartDataProvider: 'libs/chartDataProvider_b',
            jqueryui: 'libs/jquery-ui.min'
        },
        shim: {                     //引入没有使用requirejs模块写法的类库。backbone依赖underscore
            'underscore': {
                exports: '_'
            },
            'jquery': {
                exports: '$'
            },
            'jqueryui': {
                exports: 'jqueryui',
                deps: ['jquery']
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
            },
            'router-cfg-version': {
                deps: ['backbone']
            },
            'app': {
                deps: ['backbone']
            },*/
            'Chart': {
                deps: ['highstock'],
                exports: 'Chart'
            },
            'ChartDataProvider': {
                deps: [],
                exports: 'ChartDataProvider'
            }
        }
    };

    require.config(config);

    //Backbone会把自己加到全局变量中
    require([
        'bootstrap',
        'backbone',
        'DataStore',
        'Chart',
        'ChartDataProvider',
        'jqueryui',
        'Constants'
    ], function(Bootstrap, backbone, DataStore, Chart, ChartDataProvider, jqueryui, Constants){
        
        jQuery.support.cors = true; // 允许跨域访问
        
        Backbone.history.start();   //开始监控url变化

        $('.search-box').autocomplete({
          minLength: 1,
          source: function(request, response) {
            $.getJSON( Constants.SEARCH_URL, {
                input: request.term,
                count: Constants.SEARCH_COUNT,
                type: 0,
                token: Constants.ACCESS_TOKEN
              }, function(data){
                response( data.Data.RepDataJianPanBaoShuChu[0].JieGuo[0].ShuJu );
              } );
          },
          focus: function( event, ui ) {
            $( ".search-box" ).val( ui.item.DaiMa );
            return false;
          },
          select: function( event, ui ) {
            $( ".search-button" ).html( ui.item.MingCheng || ui.item.ShuXing || '' );
            $( ".search-box" ).val( ui.item.DaiMa );
     
            return false;
          }
        })
        .data( "ui-autocomplete" )._renderItem = function( ul, item ) {
          return $( "<li>" )
            .append( '<span class="col-lg-6">' + item.DaiMa + '</span><span class="col-lg-6">' + (item.MingCheng || item.ShuXing || '') + "<span>" )
            .appendTo( ul );
        };
    });
})(window);
