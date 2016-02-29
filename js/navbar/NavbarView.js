'use strict'

define(['text!navbar/NavbarTpl.html'], function(NavbarTpl) {

	var NavBarView = Backbone.View.extend({
        el: '#navbarContainer',

        events: {
        	'click .navbar li': 'setNavBarActiveStatus'
        },

        initialize: function () {
        	// _.bindAll(this, 'setNavBarActiveStatus');
        },

        render: function (name) {
            this.$el.html(_.template(NavbarTpl));
            return this;
        },

        setNavBarActiveStatus: function(e) {
			var navbarToggle = $('.navbar .navbar-toggle');
			if (navbarToggle.is(':visible') && $(e.target).find('.caret').length === 0) {
				$('.navbar .navbar-toggle').trigger('click');
			}

			$('.navbar li.active').removeClass('active');
			$(e.target).addClass('active');

			// e.preventDefault();
        }
    });

    return NavBarView;
});