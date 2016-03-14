define(['Constants'], function(Constants) {
	
	var Util = {
		formatNumber: function(data, precision, unit, useDefault) {

	        if (data == null) {
	            data = 0;
	        }

	        var n = Number(data);
	        if ((n == 0 || isNaN(n)) && useDefault !== false) {
	            return useDefault || Constants.DEFAULT_VALUE;
	        }

	        unit = unit || '';
	        precision = precision != null ? precision : 2;


	        if (unit === 'K/M') {
	            if (n >= 10 * 1000 * 1000) {
	                unit = 'M';
	            } else if (n >= 10 * 1000) {
	                unit = 'K';
	            } else {
	                unit = '';
	            }
	        }
	        switch(unit) {
	            case '%': n = n * 100; break;
	            case 'K': n = n / 1000; break;
	            case 'M': n = n / (1000 * 1000); break;
	            case 100: n = n / 100; unit = ''; break;
	        }
	        return n.toFixed(precision) + unit;
	    }
	};

	return Util;
});