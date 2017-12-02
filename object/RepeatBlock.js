/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

/**
 * @class ArquesRepeatBlock 
 * @description Do not use ArquesRepeatBlock directly. Instead, use Scope.repeat() function to get ArquesRepeatBlock object.<br>
 * ArquesRepeatBlock is a class to manage DOM elements to be repeated.
 */

ArquesRepeatBlock = function() {
	var This = this;

	This.scope = null;
	This.repeatId = null;
	This.bindTo = null;
	This.srcHtml = null;
	This._container = null;
	This._list = [];
}

/**
 * @member {ArquesElement} container
 * @memberOf ArquesRepeatBlock.prototype
 * @desc Returns container object.
 * @readonly
 */

Object.defineProperty(ArquesRepeatBlock.prototype, 'container', {
	get : function() {
		var This = this;
		return This._container;
	},
});

/**
 * @member {integer} count
 * @memberOf ArquesRepeatBlock.prototype
 * @desc Number of rows.
 * @readonly
 */

Object.defineProperty(ArquesRepeatBlock.prototype, 'count', {
	get : function() {
		var This = this;
		return This._container.children.length;
	},
});

/**
 * @method ArquesRepeatBlock.prototype.add
 * @desc Adds a new row with data.
 * @param {json} data - User defined json data
 * @return {Row} a new row structure. { data: ..., items: ... }
 */

ArquesRepeatBlock.prototype.add = function(data) {
	//
	// container.html must be preserved!
	// so try to use 'newEle' temporarily
	//

	var This = this;
	var html = This.makeHtml(data);
	var newEle = E(document.createElement(This.tag));

	newEle.html = html;
	var newItems = [];

	for (var i = 0; i < newEle.count; i++) {
		newItems.push(newEle.children[i]);
		This._container.add(newEle.children[i]);
		This.scope.processDirective(newEle.children[i]);
	}

	var newItem = {
		data : data,
		items : newItems,
	};

	This._list.push(newItem);

	return newItem;
}

/**
 * @method ArquesRepeatBlock.prototype.insert
 * @desc Inserts a new row with data.
 * @param {integer} index - Index to be inserted.
 * @param {json} data - User defined json data
 * @return {Row} a new row structure. { data: ..., items: ... }
 */

ArquesRepeatBlock.prototype.insert = function(index, data) {
	var This = this;
	var html = This.makeHtml(data);
	var newEle = E(document.createElement(This.tag));

	newEle.html = html;
	var newItems = [];
	var startIndex = newEle.count * index;

	for (var i = 0; i < newEle.count; i++) {
		newItems.push(newEle.children[i]);
		This._container.insert(startIndex + i, newEle.children[i]);
		This.scope.processDirective(newEle.children[i]);
	}

	var newItem = {
		data : data,
		items : newItems,
	};

	This._list.splice(index, 0, newItem);

	return newItem;
}

/**
 * @method ArquesRepeatBlock.prototype.update
 * @desc Updates the spcified row with data.
 * @param {integer} index - Index to be updated.
 * @param {json} data - User defined json data
 * @return {Row} updated row structure. { data: ..., items: ... }
 */

ArquesRepeatBlock.prototype.update = function(index, data) {
	var This = this;
	var html = This.makeHtml(data);
	var newEle = E(document.createElement(This.tag));
	var item = This._list[index];

	newEle.html = html;
	item.data = data;

	for (var i = 0; i < newEle.count; i++) {
		item.items[i].html = newEle.children[i].html;
		This.scope.processDirective(newEle.children[i]);
	}

	return item;
}

/**
 * @method ArquesRepeatBlock.prototype.del
 * @desc Deletes a row.
 * @param {integer} index - Index to be deleted.
 */

ArquesRepeatBlock.prototype.del = function(index) {
	var This = this;
	var item = This._list[index];

	for (var i = 0; i < item.items.length; i++)
		item.items[i].free();

	This._list.splice(index, 1);
}

/**
 * @method ArquesRepeatBlock.prototype.clear
 * @desc Clears all rows.
 */

ArquesRepeatBlock.prototype.clear = function() {
	var This = this;
	This._container.html = '';
}

ArquesRepeatBlock.prototype.makeHtml = function(data) {
	var This = this;
	var html = This.srcHtml;

	try {
		html = This.scope.processReplacement(html, This, data);
		html = This.scope.processBinding(html, This, data);
		return html;
	}
	catch (e) {
		ar.log('ArquesRepeatBlock.makeHtml: err: ' + e);
	}

	return '';
}
