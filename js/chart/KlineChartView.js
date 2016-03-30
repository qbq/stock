'use strict'

define([
    'text!chart/KlineChartTpl.html',
    'Constants', 
    'highstock',
    'DataStore',
    'Chart',
    'ChartDataProvider'
], function(
    KlineChartTpl,
    Constants,
    highstock,
    DataStore,
    Chart,
    ChartDataProvider) {

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

	var KlineChartView = Backbone.View.extend({
        el: '#chart',
        template: _.template(KlineChartTpl),

        initialize: function (params) {
            this.stkCode = params.code;
            _.bindAll(this, 'render', 'renderChart'/*, 'refreshChart'*/);
            this.model.bind('sync', this.render, this);
            // this.listenTo( this.collection, 'reset add change remove', this.render, this );
            // this.model.fetch({
            //     data: {
            //         obj: this.code
            //     }
            // });
            if (this.stkCode) {
                this.$el.html(this.template());
                if (this.chart) {
                    this.chart.destroy();
                    this.$el.find('#klineChartContainer').highcharts().destroy();
                }
                
                this.precision = precisionMap[this.stkCode.substr(0, 2)] || 2;
                dynaDataStore.subscribe({
                    obj: this.stkCode
                }, {}, this.render);
            } else {
                this.$el.html('无效代码');
            }
        },

        render: function (data) {
            // var chartData = this.model.get('data');
            /*if (this.chart) {
                this.refreshChart(chartData);
            } else {
                this.renderChart(chartData);
            }*/
            // this.renderChart(chartData);
            this.dataProvider && this.dataProvider.close();
            this.dataProvider = new ChartDataProvider(this.stkCode);
            this.chart = new Chart(this.$el, {
                dataProvider: this.dataProvider,
                dataPrecision: this.precision,
                chart: {
                    width: null,
                    height: null
                }
            });
            this.renderChart(data);
            return this;
        },

        /*processSeriesData: function(data) {
            // split the data set into ohlc and volume
            var ohlc = [],
                volume = [],
                dataLength = data.length,

                i = 0;

            for (i; i < dataLength; i += 1) {
                ohlc.push([
                    data[i][0], // the date
                    data[i][1], // open
                    data[i][2], // high
                    data[i][3], // low
                    data[i][4] // close
                ]);

                volume.push([
                    data[i][0], // the date
                    data[i][5] // the volume
                ]);
            }

            return {
                ohlc: ohlc,
                volume: volume  
            };
        },

        renderChart: function(data) {
             
                // set the allowed units for data grouping
            var groupingUnits = [[
                    'week',                         // unit name
                    [1]                             // allowed multiples
                ], [
                    'month',
                    [1, 2, 3, 4, 6]
                ]],
                processedData = this.processSeriesData(data);

            // create the chart
            this.chart = this.$el.find('#klineChartContainer').highcharts('StockChart', {

                rangeSelector: {
                    selected: 1
                },

                title: {
                    text: 'AAPL Historical'
                },

                yAxis: [{
                    labels: {
                        align: 'right',
                        x: -3
                    },
                    title: {
                        text: 'OHLC'
                    },
                    height: '60%',
                    lineWidth: 2
                }, {
                    labels: {
                        align: 'right',
                        x: -3
                    },
                    title: {
                        text: 'Volume'
                    },
                    top: '65%',
                    height: '35%',
                    offset: 0,
                    lineWidth: 2
                }],

                series: [{
                    type: 'candlestick',
                    name: 'AAPL',
                    data: processedData.ohlc,
                    dataGrouping: {
                        units: groupingUnits
                    }
                }, {
                    type: 'column',
                    name: 'Volume',
                    data: processedData.volume,
                    yAxis: 1,
                    dataGrouping: {
                        units: groupingUnits
                    }
                }]
            });
        },

        refreshChart: function(data) {
            var processedData = this.processSeriesData(data);
            var klineChart = this.$el.find('#klineChartContainer').highcharts();
            klineChart.series[0].removeData();
            klineChart.series[0].setData(processedData.ohlc);
            klineChart.series[1].removeData();
            klineChart.series[1].setData(processedData.volume);
            
        },

        dispose: function() {
            this.chart
        }*/
        renderChart: function(data) {
            if (data instanceof Error) {
                console.log(data);
            } else {
                var dynaData = data[this.stkCode];
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
        }
    });

    return KlineChartView;
});