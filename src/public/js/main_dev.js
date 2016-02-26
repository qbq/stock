$(document).ready(function() {

	// 点击导航连接后关闭导航栏
	$('.navbar li').on('click', function(e) {

		var navbarToggle = $('.navbar .navbar-toggle');
		if (navbarToggle.is(':visible') && $(this).find('li').length === 0) {
			$('.navbar .navbar-toggle').trigger('click');
		}

		$('.navbar li.active').removeClass('active');
		$(this).addClass('active');

		e.preventDefault();
	});

	$('#stockPriceHS').on('click', function() {
		$.ajax('data/stocks.json', {
			dataType: 'json',
			success: function(data) {
				var panel = $('.panel');
				panel.find('.panel-title').html('沪深行情');

				var stockTableTemplate = _.template($('#stockTableTemplate').html());

				var table = $('<table class="table"></table>');
				table.append('<thead><th>序号</th><th>产品</th><th>价格</th></thead>');
	            $(data.stocks).each(function(index, stock) {
	            	table.append('<tr><td>'+ (index + 1) + '</td><td>'+ stock.shortname + '</td><td>'+ stock.lastprice + '</td></tr>')
	            });

	            panel.append(stockTableTemplate(data));

	            panel.removeClass('hidden');
			}
		});
	})
});