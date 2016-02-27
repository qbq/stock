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


if (window.WebSocket) {
	// console.log('Full URL');
	// websocket = new WebSocket(encodeURI('ws://v2.yundzh.com/stkdata?gql=block=股票\\\\市场分类\\\\全部A股&orderby=ZhangFu&desc=true&start=0&count=10&field=ZhongWenJianCheng,ZuiXinJia,ZhangDie,ZhangFu,ZuoShou,KaiPanJia,ZuiGaoJia,ZuiDiJia,ChengJiaoLiang,ChengJiaoE,HuanShou&mode=2&token=00000011:1470039600:2db14efc6f396fa002f2d26a41306810fb34c5c1'));
	
	console.log('Token Only');
	websocket = new WebSocket(encodeURI('ws://v2.yundzh.com/ws?token=00000011:1470039600:2db14efc6f396fa002f2d26a41306810fb34c5c1'));
	
	// console.log('No Param');
	// websocket = new WebSocket(encodeURI('ws://v2.yundzh.com/stkdata'));

	// console.log('Root');
	// websocket = new WebSocket(encodeURI('ws://v2.yundzh.com/'));

	// console.log('Another testing website');
	// websocket = new WebSocket(encodeURI('ws://echo.websocket.org/'));
	
	websocket.onopen = function() {
		console.log('已连接');
		websocket.send('/stkdata?gql=block=股票\\\\市场分类\\\\全部A股&orderby=ZhangFu&desc=true&start=0&count=10&field=ZhongWenJianCheng,ZuiXinJia,ZhangDie,ZhangFu,ZuoShou,KaiPanJia,ZuiGaoJia,ZuiDiJia,ChengJiaoLiang,ChengJiaoE,HuanShou&mode=2&qid=1');
	};
	websocket.onerror = function() {
		//连接失败
		console.log('连接发生错误');
	};
	websocket.onclose = function() {
		//连接断开
		console.log('&nbsp;&nbsp;(已经断开连接)');
	};
	//消息接收
	websocket.onmessage = function(message) {
		console.log(message);
	}
}