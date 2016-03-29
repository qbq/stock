'use strict';

define(['text!price/PriceTpl.html', 'Constants'], function(PriceTpl, Constants) {

	var PriceView = Backbone.View.extend({
        events: {
            'click tbody tr': 'showKline'
        },

        el: '#bodyContainer .price-table-container',
        template: _.template(PriceTpl),

        initialize: function (params) {
            _.bindAll(this, 'render', 'refresh', 'refreshRow', 'showKline', 'dispose');
            this.params = params;
            this.obj = params.obj || '';
            this.gql = params.gql || 'quanbuagu';
            this.orderby = (params.orderby || '_').split('_');
            this.desc = !this.orderby[1] || this.orderby[1] === 'desc'; // 如果为指定, desc=true
            this.orderby = this.orderby[0] || 'ZhangFu';
            this.page = parseInt(params.page, 0) || 1;

            window.dynaDataStore.reset({
                serviceUrl: '/stkdata',
                fields: Constants.HANGQING_FIELDS
            });

            var wsParams = {
                desc: this.desc,
                start: (((this.page - 1) * Constants.PAGE_SIZE + 1) || '0'),
                count: Constants.PAGE_SIZE,
                mode: 2
            };
            if (this.obj) {
                wsParams.obj = this.obj;
            } else {
                wsParams.gql = Constants.GQL_LIST[this.gql];
            }
            if (this.orderby !== 'obj') {
                wsParams.orderby = this.orderby;
            }
            window.dynaDataStore.subscribe(wsParams, {
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
                'lastpage': 10,
                'isSelected': this.obj ? true : false
            };
            this.$el.html(this.template(result));
            return this;
        },

        refresh: function(data) {
            // console.log(data);
            if(this.rows && this.rows.length > 0) {
                this.updatingRowIndex = 0;
                $.each(data, this.refreshRow);
            } else {
                this.render(data);
                this.rows = this.$('tbody tr');
            }
        },

        refreshRow: function(obj, rowData) {
            var updatingRow = this.rows.eq(this.updatingRowIndex),
                updatingCells = updatingRow.find('td'),
                objLink = updatingCells.eq(1).find('a'),
                nameLink = updatingCells.eq(2).find('a'),
                oldObj = objLink.html();

            this.updatingRowIndex++;

            if ($.trim(oldObj) !== obj) {
                var hash = '/kline/' + obj + '/' + rowData.ZhongWenJianCheng;

                updatingRow.data('hash', hash);
                this._highlight(updatingRow);

                objLink.data('hash', hash);
                objLink.html(obj);

                nameLink.data('hash', hash);
                nameLink.html(rowData.ZhongWenJianCheng);
            }         
            this._updateCell(updatingCells.eq(3), rowData.ZuiXinJia);
            this._updateCell(updatingCells.eq(4), rowData.ZhangDie);
            this._updateCell(updatingCells.eq(5), rowData.ZhangFu + '%');
            this._updateCell(updatingCells.eq(6), rowData.ZuoShou);
            this._updateCell(updatingCells.eq(7), rowData.KaiPanJia);
            this._updateCell(updatingCells.eq(8), rowData.ZuiGaoJia);
            this._updateCell(updatingCells.eq(9), rowData.ZuiDiJia);
            this._updateCell(updatingCells.eq(10), rowData.ChengJiaoLiang/100);
            this._updateCell(updatingCells.eq(11), rowData.ChengJiaoE/10000);
            this._updateCell(updatingCells.eq(12), rowData.HuanShou + '%');
        },

        _updateCell: function(cell, newVal) {
            var oldVal = cell.html();
            newVal += '';
            if($.trim(oldVal) !== newVal) {
                cell.html(newVal);
                this._highlight(cell);
                return true;
            }
        },

        _highlight: function(el) {
            var originColor = el.css('background-color');
            el.css('background-color', 'yellow');
            setTimeout(function() {
                el.css('background-color', originColor);
            }, 1000);
        },

        showKline: function(e) {
            location.hash = $(e.target).parent('tr').data().hash;
        },

        dispose: function() {
            this.remove();
            window.dynaDataStore && window.dynaDataStore.reset();
        }
    });

    return PriceView;
});