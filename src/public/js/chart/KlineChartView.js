'use strict'

define(['text!chart/KlineChartTpl.html', 'Constants', 'highstock'], function(KlineChartTpl, Constants, highstock) {

	var KlineChartView = Backbone.View.extend({
        el: '#chartContainer',
        template: _.template(KlineChartTpl),

        initialize: function (params) {
            _.bindAll(this, 'render', 'renderChart', 'refreshChart');
            this.model.bind('sync', this.render, this);
            // this.listenTo( this.collection, 'reset add change remove', this.render, this );
            this.model.fetch({
                data: {
                    obj: this.code
                }
            });
        },

        render: function () {
            var chartData = this.model.get('data');
        	this.$el.html(this.template());
            /*if (this.chart) {
                this.refreshChart(chartData);
            } else {
                this.renderChart(chartData);
            }*/
            if (this.chart) {
                this.chart.destroy();
                this.$el.find('#klineChartContainer').highcharts().destroy();
            }
            this.renderChart(chartData);
            return this;
        },

        processSeriesData: function(data) {
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
        }
    });

    return KlineChartView;
});