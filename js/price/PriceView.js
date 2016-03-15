'use strict'

define(['text!price/PriceTpl.html', 'Constants'], function(PriceTpl, Constants) {

	var PriceView = Backbone.View.extend({
        events: {
            'click tbody tr': 'showKline'
        },

        el: '#bodyContainer .price-table-container',
        template: _.template(PriceTpl),

        initialize: function (params) {
            _.bindAll(this, 'render', 'refresh', 'refreshRow', 'showKline');
            this.params = params;
            this.gql = params.gql || 'quanbuagu';
            this.orderby = (params.orderby || '_').split('_');
            this.desc = !this.orderby[1] || this.orderby[1] === 'desc'; // 如果为指定, desc=true
            this.orderby = this.orderby[0] || 'ZhangFu';
            this.page = parseInt(params.page, 0) || 1;

            // 默认属性
            this.precisionMap = {'FX': 4};
            this.precision = this.precisionMap[this.gql.substr(0, 2)] || 2;

            // 初始化DataStore
            this.dynaDataStore = new DataStore({
                serviceUrl: '/stkdata',
                fields: Constants.HANGQING_FIELDS
            });
            var wsParams = {
                gql: Constants.GQL_LIST[this.gql],
                desc: this.desc,
                start: (((this.page - 1) * Constants.PAGE_SIZE + 1) || '0'),
                count: Constants.PAGE_SIZE,
                mode: 2
            };
            if (this.orderby !== 'obj') {
                wsParams.orderby = this.orderby;
            }
            this.dynaDataStore.subscribe(wsParams, {
                partial: false
            }, this.refresh);
        },

        render: function (data) {
            var result = {
                'stocks': data,
                'gql': this.gql,
                'orderby': this.orderby,
                'desc': this.desc,
                'prepage': this.page - 1,
                'nextpage': this.page + 1,
                'lastpage': 10
            };
            this.$el.html(this.template(result));
            return this;
        },

        refresh: function(data) {
            console.log(data);
            if(this.rows && this.rows.length > 0) {
                this.updatingRowIndex = 0;
                $.each(data, this.refreshRow);
            } else {
                this.render(data);
                this.rows = this.$('tbody tr');
            }
        },

        refreshRow: function(rowData) {
            var updatingRow = this.rows.eq(this.updatingRowIndex),
                updatingCells = updatingRow.find('td');
            this.updatingRowIndex++;
            updatingRow.data('hash', '/kline/' + rowData.Obj + '/' + rowData.ZhongWenJianCheng);
            updatingCells.eq(1).html(rowData.Obj);
            updatingCells.eq(2).html(rowData.ZuiXinJia);
            updatingCells.eq(3).html(rowData.ZhangDie);
            updatingCells.eq(4).html(rowData.ZhangFu);
            updatingCells.eq(5).html(rowData.ZuoShou);
            updatingCells.eq(6).html(rowData.KaiPanJia);
            updatingCells.eq(7).html(rowData.ZuiGaoJia);
            updatingCells.eq(8).html(rowData.ZuiDiJia);
            updatingCells.eq(9).html(rowData.ChengJiaoLiang);
            updatingCells.eq(10).html(rowData.ChengJiaoE);
            updatingCells.eq(11).html(rowData.HuanShou);
        },

        showKline: function(e) {
            location.hash = $(e.target).parent('tr').data().hash;
        },

        dispose: function() {
            this.dynaDataStore && this.dynaDataStore.cancel();
        }
    });

    return PriceView;
});