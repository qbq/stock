'use strict'

define(['text!search/SearchTpl.html', 'Constants'], function(SearchTpl, Constants) {

	var SearchView = Backbone.View.extend({

        template: _.template(SearchTpl),

        initialize: function (params) {
            this.selectFn = params.selectFn;
            this.code = params.code || '';
            this.name = params.name || '';
        },

        render: function () {
        	this.$el.html(this.template({
                code: this.code,
                name: this.name
            }));
            this.$('.search-box').autocomplete({
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
              select: this.selectFn || function( event, ui ) {
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
            return this;
        },

        dispose: function() {
            this.$('.search-box').autocomplete( "destroy" );
            this.remove();
        }
    });

    return SearchView;
});