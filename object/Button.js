/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// ArquesButton
//
Button = function(id) {
	var a = new ArquesButton(id);
	return a;
}

ArquesButton = function(id) {
	var This = this;

	ArquesElement.call(This, id);
	This.computeStyle();

	This.scope = Scope(This[0]);
	This.scanAll();
	This._id = id;
	This._theme = This.attr('theme');
	This._text = This.attr('text');
	This._textTx = This.attr('text-tx') ? parseInt(This.attr('text-tx')) : 0;
	This._textTy = This.attr('text-ty') ? parseInt(This.attr('text-ty')) : 0;
	This._textColor = This.attr('text-color');
	This._textSize = This.attr('text-size');
	This._textFont = This.attr('text-font');
	This._textWeight = This.attr('text-weight');
	This._textFilter = This.attr('text-filter');
	This._icon = This.attr('icon') ? ar.icon(This.attr('icon'), This.attr('icon-size'), This.attr('icon-style')) : '';
	This._iconFilter = This.attr('icon-filter');
	This._iconTx = This.attr('icon-tx') ? parseInt(This.attr('icon-tx')) : 0;
	This._iconTy = This.attr('icon-ty') ? parseInt(This.attr('icon-ty')) : 0;
	This._img = This.attr('img');
	This._imgFilter = This.attr('img-filter');
	This._imgW = This.attr('img-w') ? parseInt(This.attr('img-w')) : This.w;
	This._imgH = This.attr('img-h') ? parseInt(This.attr('img-h')) : This.h;
	This._imgTx = This.attr('img-tx') ? parseInt(This.attr('img-tx')) : 0;
	This._imgTy = This.attr('img-ty') ? parseInt(This.attr('img-ty')) : 0;
	This._isUnder = This.attr('under') != null;
	This.onClick = null;
	This.cursor = 'pointer';
	This.overflow = 'hidden';
	This.canGrab = false;

	if (This.attr('disabled') != null)
		This.disable();

	var textTx = This._textTx - (This._isUnder ? -2 : (This._text ? 3 : 0));
	var textTy = This._textTy;
	var iconTx = This._iconTx - (This._isUnder ? -2 : (This._text ? 3 : 0));
	var iconTy = This._iconTy;
	var imgTx = This._imgTx;
	var imgTy = This._imgTy;
	var html = '';

	html += '<center>';
	html += '<table id="' + id + '__table" style="user-select:none;">';

	if (This._isUnder)
		html += '<tr>';

	if (This._img)
		html += '  <td id="' + id + '__img"></td>';
	else
		html += '  <td id="' + id + '__icon"></td>';

	if (This._isUnder)
		html += '</tr><tr>';

	if (This._text)
		html += '  <td id="' + id + '__text"></td>';

	if (This._isUnder)
		html += '</tr>';

	html += '</table>';
	html += '</center>';

	This.html = '';
	This.con = E(html);
	This.con.scanAll();
	ArquesElement.prototype.add.call(This, This.con);

	This.table = This.con.E(id + '__table');
	This.table.alignX = ar.CENTER;
	This.table.fc = This.fc;
	This.table.fs = This.fs;
	This.table.fw = This.fw;
	This.table.ff = This.ff;
	This.table.w = 'auto';
	This.table.h = This.h;

	if (This._img) {
		var pic = E('<img src="' + This._img + '">');
		pic.w = This._imgW;
		pic.h = This._imgH;

		This.picTd = This.con.E(id + '__img');
		This.picTd.tx = imgTx;
		This.picTd.ty = imgTy;
		This.picTd.add(pic);
	}
	else {
		This.picTd = This.con.E(id + '__icon');
		This.picTd.tx = iconTx;
		This.picTd.ty = iconTy;
		This.picTd.html = This._icon;
	}

	This.pic = This.picTd.children[0];
	This.textTd = This.con.E(id + '__text');
	This.textTd.html = This._text;
	This.textTd.tx = textTx;
	This.textTd.ty = textTy;
	
	if (This._img && This._imgFilter) 
		This.pic.filter = This._imgFilter;

	else if (This._icon && This._iconFilter) 
		This.pic.filter = This._iconFilter;

	if (This._textColor)
		This.textTd.fc = This._textColor;

	if (This._textSize)
		This.textTd.fs = This._textSize;

	if (This._textFont)
		This.textTd.ff = This._textFont;

	if (This._textWeight)
		This.textTd.fw = This._textWeight;

	if (This._textFilter)
		This.textTd.filter = This._textFilter;
	
	This.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.scope.on('size', function() {
		This.refresh();
	});

	This._onSetW = function() {
		This.refresh();
	};

	This._onSetH = This._onSetW;
	This.refresh();

	This.scope.__onBtnClick = function() {
		//ar.log('btn clicked');

		if (This.onClick && This._isEnabled)
			This.onClick(This);
	};

	var attr = {};
	attr['click'] = '__onBtnClick()';

	ar.click(This.scope, This, attr);
}

ArquesButton.prototype = Object.create(ArquesElement.prototype, {
	refresh : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(id) {
			var This = this;
			This.table.h = This.h;
		}
	},

	enable : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(id) {
			var This = this;
			This._isEnabled = true;
			This.cursor = 'pointer';
			This.filter = '';
		}
	},

	disable : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(id) {
			var This = this;
			This._isEnabled = false;
			This.cursor = 'inherit';
			This.filter = 'brightness(.78)';
		}
	},
});

Object.defineProperty(ArquesButton.prototype, 'index', {
	get : function() {
		var This = this;
		return This._index;
	},

	set : function(v) {
		var This = this;
		This._index = v;
		This.refresh();
	},
});
