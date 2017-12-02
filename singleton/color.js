/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

/**
 * @func color
 * @memberOf ar
 * @desc Returns 'rgba(r,g,b,a)' string.
 * @param {integer} color - Integer color value
 * @return {string} Returns 'rgba(r,g,b,a)' string
 */

ar.color = function(v) {
	if (typeof v == 'number') {
		v = Math.round(v);
		var a = (v >> 24);
		var r = (v >> 16) & 0xff;
		var g = (v >> 8) & 0xff;
		var b = (v >> 0) & 0xff;
		
		if (a < 0)
			a += 256;
		
		a /= 255.0;
		
		v = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
	}
	
	return v;
};
