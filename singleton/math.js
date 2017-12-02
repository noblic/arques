/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

ar.math = {};

//
//
//

ar.matrix = {};

ar.matrix.isInited = false;

ar.matrix.init = function() { // https://github.com/iranreyes/2d-css-matrix-parse
	if (ar.matrix.isInited)
		return;

	var floating = '(\\-?[\\d\\.e]+)';
	var commaSpace = '\\,?\\s*';

	ar.matrix.regex = new RegExp('^matrix\\(' + floating + commaSpace + floating + commaSpace + floating + commaSpace + floating + commaSpace + floating + commaSpace + floating + '\\)$');
	ar.matrix.isInited = true;
}

ar.matrix.parse = function(transform) { // https://github.com/iranreyes/2d-css-matrix-parse
	ar.matrix.init();
	var matrix = ar.matrix.regex.exec(transform);
	var r = [];

	if (matrix) {
		matrix.shift();

		for (var i = 0; i < matrix.length; i++)
			r.push(matrix[i]);

		matrix = r;
	}

	return matrix || [
			1, 0, 0, 1, 0, 0
	];
};

ar.matrix.toCss = function(matrix, is3d) {
	var r = is3d ? 'matrix3d(' : 'matrix(';

	for (var i = 0; i < matrix.length; i++)
		r += (i == 0 ? '' : ',') + matrix[i];

	r += ')';

	return r;
}

ar.matrix.multi = function(a, b) {
	var r = [
			0, 0, 0, 0, 0, 0
	];

	r[0] = a[0] * b[0] + a[2] * b[1];
	r[1] = a[1] * b[0] + a[3] * b[1];
	r[2] = a[0] * b[2] + a[2] * b[3];
	r[3] = a[1] * b[2] + a[3] * b[3];
	r[4] = a[0] * b[4] + a[2] * b[5] + a[4];
	r[5] = a[1] * b[4] + a[3] * b[5] + a[5];

	return r;
}

ar.matrix.multi3d = function(a, b) {
	var r = [
			0, 0, 0, 0, //
			0, 0, 0, 0, //
			0, 0, 0, 0, //
			0, 0, 0, 0, //
	];

	r[0x00] = a[0x00] * b[0x00] + a[0x01] * b[0x04] + a[0x02] * b[0x08] + a[0x03] * b[0x0c];
	r[0x01] = a[0x00] * b[0x01] + a[0x01] * b[0x05] + a[0x02] * b[0x09] + a[0x03] * b[0x0d];
	r[0x02] = a[0x00] * b[0x02] + a[0x01] * b[0x06] + a[0x02] * b[0x0a] + a[0x03] * b[0x0e];
	r[0x03] = a[0x00] * b[0x03] + a[0x01] * b[0x07] + a[0x02] * b[0x0b] + a[0x03] * b[0x0f];

	r[0x04] = a[0x04] * b[0x00] + a[0x05] * b[0x04] + a[0x06] * b[0x08] + a[0x07] * b[0x0c];
	r[0x05] = a[0x04] * b[0x01] + a[0x05] * b[0x05] + a[0x06] * b[0x09] + a[0x07] * b[0x0d];
	r[0x06] = a[0x04] * b[0x02] + a[0x05] * b[0x06] + a[0x06] * b[0x0a] + a[0x07] * b[0x0e];
	r[0x07] = a[0x04] * b[0x03] + a[0x05] * b[0x07] + a[0x06] * b[0x0b] + a[0x07] * b[0x0f];

	r[0x08] = a[0x08] * b[0x00] + a[0x09] * b[0x04] + a[0x0a] * b[0x08] + a[0x0b] * b[0x0c];
	r[0x09] = a[0x08] * b[0x01] + a[0x09] * b[0x05] + a[0x0a] * b[0x09] + a[0x0b] * b[0x0d];
	r[0x0a] = a[0x08] * b[0x02] + a[0x09] * b[0x06] + a[0x0a] * b[0x0a] + a[0x0b] * b[0x0e];
	r[0x0b] = a[0x08] * b[0x03] + a[0x09] * b[0x07] + a[0x0a] * b[0x0b] + a[0x0b] * b[0x0f];

	r[0x0c] = a[0x0c] * b[0x00] + a[0x0d] * b[0x04] + a[0x0e] * b[0x08] + a[0x0f] * b[0x0c];
	r[0x0d] = a[0x0c] * b[0x01] + a[0x0d] * b[0x05] + a[0x0e] * b[0x09] + a[0x0f] * b[0x0d];
	r[0x0e] = a[0x0c] * b[0x02] + a[0x0d] * b[0x06] + a[0x0e] * b[0x0a] + a[0x0f] * b[0x0e];
	r[0x0f] = a[0x0c] * b[0x03] + a[0x0d] * b[0x07] + a[0x0e] * b[0x0b] + a[0x0f] * b[0x0f];

	return r;
}
