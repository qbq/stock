'use strict'

define(['navbar/NavbarView'], function(Navbar) {

	var App = Backbone.View.extend({
        el: 'body',

        initialize: function () {

			var navbar = new Navbar();
			navbar.render();
        },

        render: function () {
        }
    });

    return App;
});