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
            DataStore: 'libs/datastore',
            Chart: 'libs/chart',
            ChartDataProvider: 'libs/ChartDataProvider'
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
        'ChartDataProvider'
    ], function(Bootstrap, backbone, DataStore, Chart, ChartDataProvider){
        
        jQuery.support.cors = true; // 允许跨域访问
        
        Backbone.history.start();   //开始监控url变化

        

        $(document).ready(function() {

            DataStore.address = 'ws://10.15.144.101:80/ws';
            DataStore.token = '00000014:1489067403:f9558817839d4489f4bbcb154e84b2d2bfc3dda9';

            DataStore.dataType = 'pb';
            window.DataStore = DataStore;

            var precisionMap = {'FX': 4};

            var DEFAULT_VALUE = '--';
            var formatNumber = function(data, precision, unit, useDefault) {

                if (data == null) {
                    data = 0;
                }

                var n = Number(data);
                if ((n == 0 || isNaN(n)) && useDefault !== false) {
                    return useDefault || DEFAULT_VALUE;
                }

                unit = unit || '';
                precision = precision != null ? precision : 2;


                if (unit === 'K/M') {
                    if (n >= 10 * 1000 * 1000) {
                        unit = 'M';
                    } else if (n >= 10 * 1000) {
                        unit = 'K';
                    } else {
                        unit = '';
                    }
                }
                switch(unit) {
                    case '%': n = n * 100; break;
                    case 'K': n = n / 1000; break;
                    case 'M': n = n / (1000 * 1000); break;
                    case 100: n = n / 100; unit = ''; break;
                }
                return n.toFixed(precision) + unit;
            };

            Date.prototype.format = function(format) {
                var d, k, o;
                o = {
                    "M+": this.getMonth() + 1,
                    "d+": this.getDate(),
                    "h+": this.getHours(),
                    "m+": this.getMinutes(),
                    "s+": this.getSeconds(),
                    "q+": Math.floor((this.getMonth() + 3) / 3),
                    "S": this.getMilliseconds()
                };
                if (/(y+)/.test(format)) {
                    format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                for (k in o) {
                    d = o[k];
                    if (new RegExp("(" + k + ")").test(format)) {
                        format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? d : ("00" + d).substr(("" + d).length));
                    }
                }
                return format;
            };

            var dynaDataStore = new DataStore({
                serviceUrl: '/stkdata',
                fields: ['ZhongWenJianCheng', 'ZuoShou', 'ZuiGaoJia', 'KaiPanJia', 'ZuiDiJia', 'ZuiXinJia', 'ChengJiaoLiang', 'ChengJiaoE', 'ShiJian']
            });

            var stkCode = 'SH600000';
            if (stkCode) {
                this.precision = precisionMap[stkCode.substr(0, 2)] || 2;
                dynaDataStore.subscribe({
                    obj: stkCode
                }, {}, function(data) {
                    if (data instanceof Error) {
                        console.log(data);
                    } else {
                        var dynaData = data[stkCode];
                        if (dynaData) {
                            this.name = dynaData.ZhongWenJianCheng;
                            this.baseInfo = {
                                LastClose: formatNumber(dynaData.ZuoShou, this.precision),
                                High: formatNumber(dynaData.ZuiGaoJia, this.precision),
                                Open: formatNumber(dynaData.KaiPanJia, this.precision),
                                Low: formatNumber(dynaData.ZuiDiJia, this.precision),
                                New: formatNumber(dynaData.ZuiXinJia, this.precision),
                                Volume: formatNumber(dynaData.ChengJiaoLiang, 1, 'K/M'),
                                Amount: formatNumber(dynaData.ChengJiaoE, 1, 'K/M'),
                                Time: dynaData.ShiJian ?
                                  new Date(Number(dynaData.ShiJian + '000')).format('yyyy-MM-dd hh:mm:ss') :
                                  DEFAULT_VALUE
                            };
                        }
                    }
                }.bind(this));
                this.dataProvider && this.dataProvider.close();
                this.dataProvider = new ChartDataProvider(stkCode);
                new Chart($('#chart'), {
                    dataProvider: this.dataProvider,
                    dataPrecision: this.precision,
                    chart: {
                        width: null,
                        height: null
                    }
                });
            }
        
        });

    });
})(window);
