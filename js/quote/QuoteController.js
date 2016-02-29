'use strict'

define(['quote/QuoteView', 'quote/QuoteModel'], function (QuoteView, QuoteModel) {

    var quoteController = function (code, name) {
        var quoteView = new QuoteView({
        	model: new QuoteModel(),
            code: code,
            name: name
        });
        // quoteView.render();
        return quoteView;
    };
    return quoteController;
});