'use strict'

define(['search/SearchView', 'search/SearchModel'], function (SearchView, SearchModel) {

    var searchController = function () {
        var searchView = new SearchView({
        	model: new SearchModel()
        });
        // searchView.render();
        return searchView;
    };
    return searchController;
});