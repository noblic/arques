/*
  	Arques Engine
  	Author: Andy Remi (andy@noblic.com) 
  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

ar = {};

//
// Arques Element 
//

/**
 * @func E 
 * @desc E is easiest way to get DOM element.
 * 
 * @param {(string|DOM|ArquesElement)} id_or_object - Element id / DOM object / ArquesElement object
 * @return {ArquesElement} ArquesElement object
 * @example
 * <script src="arques.js"></script>
 * 
 * <div id="my_id" style="position:absolute;width:100px;height:100px;background-color:red;"></div>
 * 
 * <script>
 * var a = E('my_id'); 
 * // you don't need to specify '#' or '$'.
 * // Arques will distinguish element id and class name automatically.
 * 
 * a.x = 100; 
 * // This will move "my_id"'s x-coordinate to 100 pixel!
 * </script>
 */

E = function(id) {
	var a = new ArquesElement(id);
	return a;
}

/**
 * @class ArquesElement 
 * @description Do not use ArquesElement directly. Instead, use global {@link E}() function to create ArquesElement object. Arques manages ArquesElement object automatically.<br>
 * ArquesElement is the core class of Arques having convenient methods for improving productivity. 
 */

ArquesElement = function(id) {
	var This = this;

	This.prototype = [];
	This._children = [];
	This._isEnabled = true;
	This._angleUnit = null;
	This._onSetW = null;
	This._onSetH = null;
	This._isWindow = false;
	This.events = {};

	function initTransform() {
		This._degree = 0;
		This._degreeX = 0;
		This._degreeY = 0;
		This._degreeZ = 0;
		This._scaleX = 1;
		This._scaleY = 1;
		This._scaleZ = 1;
		This._skewX = 0;
		This._skewY = 0;
		This._skewZ = 0;
		This._flipX = 1;
		This._flipY = 1;
		This._flipZ = 1;
		This._tx = 0;
		This._ty = 0;
		This._tz = 0;
	}

	This.matrix = function() {
		var scaleX = This._scaleX * This._flipX;
		var scaleY = This._scaleY * This._flipY;
		var scaleZ = This._scaleZ * This._flipZ;

		var tx = isNaN(This._tx) ? This._tx : This._tx + 'px';
		var ty = isNaN(This._ty) ? This._ty : This._ty + 'px';
		var tz = isNaN(This._tz) ? This._tz : This._tz + 'px';

		m = '';
		m += ' rotateX(' + This._degreeX + 'deg) rotateY(' + This._degreeY + 'deg) rotateZ(' + This._degreeZ + 'deg) ';
		m += ' scaleX(' + scaleX + ') scaleY(' + scaleY + ') scaleZ(' + scaleZ + ') ';
		m += ' translateX(' + tx + ') translateY(' + ty + ') translateZ(' + tz + ') ';
		m += ' skewX(' + This._skewX + 'deg) skewY(' + This._skewY + 'deg) ';

		//m = 'skewX(' + This._skewX + 'deg)';
		//ar.log(m);

		return m;
	};

	This.matrix.reset = function() {
		initTransform();
		This.matrix.apply();
	}

	This.matrix.apply = function() {
		var m = This.matrix();

		for (var i = 0; i < This.length; i++)
			This[i].style.transform = m;
	}

	initTransform();

	function loop(e) {
		This.length = e.length;
		for (var i = 0; i < e.length; i++)
			This[i] = e[i];
	}

	if (typeof id == 'string') {
		id = id.trim();

		if (id == '') {
			// do nothing			
		}
		else if (ar.isPrefix(id, '.')) {
			var e = document.getElementsByClassName(id.substr(1));
			loop(e);
		}
		else if (ar.isPrefix(id, '<')) {
			var parent;

			if (id.startsWith('<tr')) {
				parent = document.createElement('table');
				parent.innerHTML = id;
				loop(parent.children[0].children);
			}
			else if (id.startsWith('<td')) {
				parent = document.createElement('table');
				parent.innerHTML = id;
				loop(parent.children[0].children[0].children);
			}
			else {
				parent = document.createElement('div');
				parent.innerHTML = id;
				loop(parent.children);
			}
		}
		else if (ar.isPrefix(id, '#')) {
			var e = document.querySelectorAll(id);
			loop(e);
		}
		else {
			var ele = document.getElementById(id);

			if (ele == null) {
				ele = document.getElementsByName(id);

				if (ele.length == 0) {
					ele = document.getElementsByClassName(id);

					if (ele.length == 0)
						ele = document.querySelectorAll(id);
				}

				loop(ele);
			}
			else {
				This[0] = ele;
				This.length = 1;
			}
		}
	}
	else if (Array.isArray(id)) {
		var i = 0;
		for ( var k in id) {
			This[i] = id[k];
			i++;
		}

		This.length = i;
	}
	else if (typeof id == 'object') {
		if (id == window) {
			This[0] = window.document.body;
			This._isWindow = true;
		}
		else
			This[0] = id;

		This.length = 1;
	}
	else {
		This.length = 0;
	}

	return This;
}

ArquesElement.prototype.style = function(param) {
	if (this.length == 0)
		return null;

	function returnBy(r) {
		switch (param.returnType) {
			case 'int':
				r = parseInt(r);
				r = isNaN(r) ? 0 : r;
				break;
			case 'float':
				r = parseFloat(r);
				r = isNaN(r) ? 0 : r;
				break;
			default:
				break;
		}

		return r;
	}

	if (param.value != undefined && isNaN(param.value) == false && param.isUsePxUnit) // use px?
		param.value += 'px';

	if (param.value != undefined) {
		for (var i = 0; i < this.length; i++)
			if (this[i].style[param.field] != param.value)
				this[i].style[param.field] = param.value;

		return returnBy(param.value);
	}
	else if (param.field == 'display') {
		var r = window.getComputedStyle(this[0]);
		return r.display;
	}
	else {
		var r = this[0].style[param.field];

		if (ar.isStr(r) && ar.isSuffix(r, 'px')) {
			r = parseFloat(r);
		}
		else if (ar.isNum(r) == false && param.isToUseClientRect) {
			var rect = this[0].getBoundingClientRect();
			r = rect[param.field];
		}

		return returnBy(r);
	}
}

ArquesElement.prototype.computeStyle = function() {
	var This = this;
	var isMatrixSet = false;

	for (var i = 0; i < This.length; i++) {
		var e = This[i];
		var style = window.getComputedStyle(e);

		//			for ( var k in style) {
		//				ar.log(k);
		//				e.style[k] = style[k]; // don't do this. many error will be occurred. for example, style['color'] = 'red' doesn't work.
		//			}

		if (style['marginLeft'])
			e.style.marginLeft = style['marginLeft'];

		if (style['marginTop'])
			e.style.marginTop = style['marginTop'];

		if (style['marginBottom'])
			e.style.marginBottom = style['marginBottom'];

		if (style['marginRight'])
			e.style.marginRight = style['marginRight'];

		if (style['paddingLeft'])
			e.style.paddingLeft = style['paddingLeft'];

		if (style['paddingTop'])
			e.style.paddingTop = style['paddingTop'];

		if (style['paddingBottom'])
			e.style.paddingBottom = style['paddingBottom'];

		if (style['paddingRight'])
			e.style.paddingRight = style['paddingRight'];

		if (style['left'])
			e.style.left = style['left'];

		if (style['top'])
			e.style.top = style['top'];

		if (style['right'])
			e.style.right = style['right'];

		if (style['bottom'])
			e.style.bottom = style['bottom'];

		if (style['width'])
			e.style.width = style['width'];

		if (style['height'])
			e.style.height = style['height'];

		if (style['zIndex'])
			e.style.zIndex = style['zIndex'];

		if (style['visibility'])
			e.style.visibility = style['visibility'];

		if (style['background-color'])
			e.style.backgroundColor = style['background-color'];

		if (style['background-image'])
			e.style.backgroundImage = style['background-image'];

		if (style['background-size'])
			e.style.backgroundSize = style['background-size'];

		if (style['background-repeat'])
			e.style.backgroundRepeat = style['background-repeat'];

		if (style['color'])
			e.style.color = style['color'];

		if (style['font-size'])
			e.style.fontSize = style['font-size'];

		if (style['font-weight'])
			e.style.fontWeight = style['font-weight'];

		if (style['font-family'])
			e.style.fontFamily = style['font-family'];

		if (style['filter'])
			e.style.filter = style['filter'];

		if (style['display'])
			e.style.visibility = style['display'];

		if (style['transform'] && isMatrixSet == false) {
			try {
				var m = ar.matrix.parse(style['transform']);
				//ar.log(m);
				This._scaleX = Math.sqrt(m[0] * m[0] + m[2] * m[2]);
				This._scaleY = Math.sqrt(m[1] * m[0] + m[3] * m[3]);
				This._tx = parseFloat(m[4]);
				This._ty = parseFloat(m[5]);
				This._degree = Math.atan(m[2] / m[3]) * 180;
				This._degree /= Math.PI;
				isMatrixSet = true;
			}
			catch (e) {
			}
		}
	}
}

/**
 * @method ArquesElement.prototype.free 
 * @desc Removes DOM object from its parent and unset all event handlers. Use this method for memory management and improving performance.
 * @return N/A
 * @example
 * <script src="arques.js"></script>
 * 
 * <div>
 * <div id="my_id" style="position:absolute;">Free?! No way!</div>
 * </div>
 * 
 * <script>
 * var a = E('my_id'); 
 * a.free(); // this will remove "my_id" div from its parent.
 * </script>
 */

ArquesElement.prototype.free = function() {
	var This = this;
	var parent = This.parent;
	var chil = This._children;

	for (var i = 0; i < This.length; i++) {
		var a = This[i]._seenTag;

		if (a)
			delete ar._onSeenList[a];
	}

	for (var i = 0; i < chil.length; i++)
		chil[i].free();

	if (parent)
		parent.del(This);

	for ( var n in This.events)
		This.off(n);

	This.events = {};
	delete this;
}

/**
 * @member ___Count
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {integer} length
 * @memberOf ArquesElement.prototype
 * @desc [Get] number of DOM element. One ArquesElement object can contain multiple DOM elements. Use <b>count</b> property to get number of children elements.
 */

/**
 * @member {integer} count
 * @memberOf ArquesElement.prototype
 * @desc [Get] number of children.
 * @readonly
 */

Object.defineProperty(ArquesElement.prototype, 'count', {
	get : function() {
		var This = this;
		return This._children.length;
	},

	set : function(v) {
		ar.log('"count" is readonly property.');
	}
});

//
//Hierarchy
//

/**
 * @member ___Hierarchy
 * @memberOf ArquesElement.prototype
 */

/**
* @method ArquesElement.prototype.add
* @desc Add child element.
* @param {E_or_DOM} obj - object
*/

ArquesElement.prototype.add = function(v) {
	var This = this;

	if (v == undefined || v == null)
		return;

	if (ar.isE(v)) {
		This[0].appendChild(v[0]);
		This._children.push(v);
	}
	else {
		This[0].appendChild(v);
		This._children.push(E(v));
	}
}

/**
* @method ArquesElement.prototype.insert
* @desc Insert child element.
* @param {integer} index - index to be inserted
* @param {E_or_DOM} obj - object
*/

ArquesElement.prototype.insert = function(i, obj) {
	var This = this;

	if (obj == undefined || obj == null)
		return;

	if (ar.isE(obj)) {
		This[0].insertBefore(obj[0], 0 <= i && i < This[0].children.length ? This[0].children[i] : null);
		This._children.splice(i, 0, obj);
	}
	else {
		This[0].insertBefore(obj, 0 <= i && i < This[0].children.length ? This[0].children[i] : null);
		This._children.splice(i, 0, E(obj));
	}
}

/**
* @method ArquesElement.prototype.del
* @desc Delete child element.
* @param {E_or_DOM} obj - object
*/

ArquesElement.prototype.del = function(v) {
	var This = this;

	if (v == undefined)
		return;

	if (ar.isE(v)) {
		for (var i = This._children.length - 1; i >= 0; i--)
			if (This._children[i] == v) {
				This._children.splice(i, 1);
				break;
			}

		for (var i = 0; i < This.length; i++)
			for (var j = 0; j < v.length; j++)
				if (This[i].contains(v[j]))
					This[i].removeChild(v[j]);
	}
	else if (isNaN(v) == false) {
		v = parseInt(v);
		if (This[0] && v < This[0].children.length) {
			v = This._children.splice(v, 1);

			for (var k = 0; k < v.length; k++) {
				var e = v[k];

				for (var i = 0; i < This.length; i++)
					for (var j = 0; j < e.length; j++)
						if (This[i].contains(e[j]))
							This[i].removeChild(e[j]);
			}
		}
	}
	else if (v) {
		for (var i = This._children.length - 1; i >= 0; i--)
			if (This._children[i][0] == v) {
				This._children.splice(i, 1);
				break;
			}

		for (var i = 0; i < This.length; i++)
			if (This[i].contains(v))
				This[i].removeChild(v);
	}
}

/**
 * @method ArquesElement.prototype.clear
 * @desc Delete all child elements.
 */

ArquesElement.prototype.clear = function() {
	var This = this;

	for (var j = This.count - 1; j >= 0; j--) {
		var v = This._children[j];

		for (var i = 0; i < This.length; i++)
			for (var k = 0; k < v.length; k++)
				if (This[i].contains(v[k]))
					This[i].removeChild(v[k]);
	}

	This._children = [];
}

/**
 * @method ArquesElement.prototype.indexOf
 * @desc Finds the index of the specified element.
 */

ArquesElement.prototype.indexOf = function(e) {
	var This = this;

	for (var j = This.count - 1; j >= 0; j--) {
		if (This._children[j] == e)
			return j;
	}

	return -1;
}

/**
 * @member {ArquesElement} first
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] the first child
 */

Object.defineProperty(ArquesElement.prototype, 'first', {
	get : function() {
		var This = this;
		if (This._children.length == 0)
			return null;

		var This = this;
		return This._children[0];
	},

	set : function(v) {
		var This = this;
		if (This._children.length == 0)
			This._children.push(v);
		else
			This._children[0] = v;
	}
});

/**
 * @member {ArquesElement} last
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] the last child
 */

Object.defineProperty(ArquesElement.prototype, 'last', {
	get : function() {
		var This = this;
		if (This._children.length == 0)
			return null;

		var This = this;
		return This._children[This._children.length - 1];
	},

	set : function(v) {
		var This = this;
		if (This._children.length == 0)
			This._children.push(v);
		else
			This._children[This._children.length - 1] = v;
	}
});

/**
 * @member {ArquesElement} parent
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] parent.
 */

Object.defineProperty(ArquesElement.prototype, 'parent', {
	get : function() {
		var This = this;
		if (This.length > 0 && This[0].parentNode && This[0].parentNode != document) {
			return E(This[0].parentNode);
		}

		return null;
	},

	set : function(v) {
		var This = this;

		for (var i = 0; i < This.length; i++)
			if (This[i].parentNode)
				This[i].parentNode.removeChild(This[i]);

		if (ar.isE(v)) {
			if (v.length == 0) {
				ar.log("you're setting invalide parent. Parent must have a real element.");
				return;
			}

			v = v[0];
		}

		for (var i = 0; i < This.length; i++)
			This[i].parentNode = v;

		return This.parent;
	}
});

/**
 * @member {ArquesElement[]} children
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] children list.
 */

Object.defineProperty(ArquesElement.prototype, 'children', {
	get : function() {
		var This = this;
		return This._children;
	},

	set : function(v) {
		var This = this;

		if (Array.isArray(v)) {
			for (var i = 0; i < v.length; i++)
				if (!ar.isE(v)) {
					ar.log("child must be arques object.");
					return;
				}

			for (var i = This.count - 1; i >= 0; i--)
				This.del(This._children[i]);

			for (var i = 0; i < v.length; i++)
				This.add(v[i]);
		}
		else {
			ar.log("you're setting invalide children. Children must have an array of arques object.");
		}
	}
});

ArquesElement.prototype.child = function(i) {
	var This = this;
	return This._children[i];
}

/**
 * @method ArquesElement.prototype.E 
 * @desc Finds child element.
 * @param {string} id - Element id
 * @return {ArquesElement} ArquesElement object
 * @example
 * <script src="arques.js"></script>
 * 
 * <div id="parent_id">
 *  <div id="child_id">
 *   Cool!
 *  </div>
 * </div>
 * 
 * <script>
 * var parent = E('parent_id'); 
 * var child = parent.E('child_id'); 
 * 
 * ar.log(child.html); // this will print "Cool!" in console. 
 * </script>
 */

ArquesElement.prototype.E = function(id) {
	var This = this;

	for (var i = 0; i < This.length; i++) {
		var autoId = ar.isPrefix(id, '.') ? id : '#' + id;
		var e = This[i].querySelectorAll(autoId);

		if (e.length == 0)
			e = This[i].querySelectorAll(id);

		if (e.length == 0)
			continue;

		var r = E('');

		for (var i = 0; i < e.length; i++)
			r[i] = e[i];

		r.length = e.length;
		return r;
	}

	var r = E('');
	return r;
}

ArquesElement.prototype.scanAll = function() {
	function makeChildren(ele) {
		var dom = ele[0];
		var cnt = dom.childElementCount;

		if (!(ele.count == 0 && cnt > 0))
			return;

		for (var i = 0; i < cnt; i++) {
			var newE = E(dom.children[i]);
			ele.children.push(newE);
			makeChildren(newE);
		}
	}

	makeChildren(this);
}

/**
 * @member ___Location
 * @memberOf ArquesElement.prototype
 */

//
// 
//
/**
 * @member {integer|string} x
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] x position. This works only for absolute or relatvie position of css.
 */

Object.defineProperty(ArquesElement.prototype, 'x', {
	get : function() {
		var r = this.style({
			field : 'left',
			isUsePxUnit : true,
			isToUseClientRect : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'left',
			value : v,
			isUsePxUnit : true,
			isToUseClientRect : true,
			returnType : 'int',
		});
		return r;
	}
});

/**
 * @member {integer|string} y
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] y position. This works only for absolute or relatvie position of css.
 */

Object.defineProperty(ArquesElement.prototype, 'y', {
	get : function() {
		var r = this.style({
			field : 'top',
			isUsePxUnit : true,
			isToUseClientRect : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'top',
			value : v,
			isUsePxUnit : true,
			isToUseClientRect : true,
			returnType : 'int',
		});
		return r;
	}
});

/**
 * @member {integer|string} cx
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] center x position. This works only for absolute or relatvie position of css.
 */

Object.defineProperty(ArquesElement.prototype, 'cx', {
	get : function() {
		return this.x + this.w / 2;
	},

	set : function(v) {
		this.x = v - this.w / 2;
		return this.cx;
	}
});

/**
 * @member {integer|string} cy
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] center y position. This works only for absolute or relatvie position of css.
 */

Object.defineProperty(ArquesElement.prototype, 'cy', {
	get : function() {
		return this.y + this.h / 2;
	},

	set : function(v) {
		this.y = v - this.h / 2;
		return this.cy;
	}
});

/**
 * @member {integer} z
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] zIndex.
 */

Object.defineProperty(ArquesElement.prototype, 'z', {
	get : function() {
		var r = this.style({
			field : 'zIndex',
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'zIndex',
			returnType : 'int',
			value : v,
		});
		return r;
	}
});

/**
 * @member ___Translation
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {float} tx
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] translation on the x axis.
 */

Object.defineProperty(ArquesElement.prototype, 'tx', {
	get : function() {
		return this._tx;
	},

	set : function(v) {
		this._tx = v;
		this.matrix.apply();

		return this.tx;
	}
});

/**
 * @member {float} ty
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] translation on the y axis.
 */

Object.defineProperty(ArquesElement.prototype, 'ty', {
	get : function() {
		return this._ty;
	},

	set : function(v) {
		this._ty = v;
		this.matrix.apply();

		return this.ty;
	}
});

/**
 * @member {float} tz
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] translation on the z axis.
 */

Object.defineProperty(ArquesElement.prototype, 'tz', {
	get : function() {
		return this._tz;
	},

	set : function(v) {
		this._tz = v;
		this.matrix.apply();

		return this.tz;
	}
});

/**
 * @member ___Size
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {integer|string} w
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] width.
 */

Object.defineProperty(ArquesElement.prototype, 'w', {
	get : function() {
		var r = this.style({
			field : 'width',
			isUsePxUnit : true,
			isToUseClientRect : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var This = this;
		var r = This.style({
			field : 'width',
			value : v,
			isUsePxUnit : true,
			isToUseClientRect : true,
			returnType : 'int',
		});

		if (This._onSetW)
			This._onSetW(r);

		return r;
	}
});

/**
 * @member {integer|string} h
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] height.
 */

Object.defineProperty(ArquesElement.prototype, 'h', {
	get : function() {
		var r = this.style({
			field : 'height',
			isUsePxUnit : true,
			isToUseClientRect : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		//ar.log(v);
		var This = this;
		var r = This.style({
			field : 'height',
			value : v,
			isUsePxUnit : true,
			isToUseClientRect : true,
			returnType : 'int',
		});

		if (This._onSetH)
			This._onSetH(r);

		return r;
	}
});

/**
 * @member ___Location of rect
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {integer} l
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] left (= x position).
 */

Object.defineProperty(ArquesElement.prototype, 'l', {
	get : function() {
		return this.x;
	},

	set : function(v) {
		this.x = v;
		return this.x;
	}
});

/**
 * @member {integer} t
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] top (= y position).
 */

Object.defineProperty(ArquesElement.prototype, 't', {
	get : function() {
		return this.y;
	},

	set : function(v) {
		this.y = v;
		return this.y;
	}
});

/**
 * @member {integer} r
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] right (= x + w - 1)
 */

Object.defineProperty(ArquesElement.prototype, 'r', {
	get : function() {
		return this.x + this.w - 1;
	},

	set : function(v) {
		this.x = v - this.w + 1;
		return this.x + this.w - 1;
	}
});

/**
 * @member {integer} b
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] bottom (= y + h - 1).
 */

Object.defineProperty(ArquesElement.prototype, 'b', {
	get : function() {
		return this.y + this.h - 1;
	},

	set : function(v) {
		this.y = v - this.h + 1;
		return this.y + this.h - 1;
	}
});

/**
 * @member ___Point
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {P} point
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] x, y, z points. Use global P(x, y, [z]) functions to specify the point.
 */

Object.defineProperty(ArquesElement.prototype, 'point', {
	get : function() {
		return P(this.x, this.y, this.z);
	},

	set : function(v) {
		this.x = v.x;
		this.y = v.y;

		if (v.z)
			this.z = v.z;
	}
});

/**
 * member ___Vector
 * memberOf ArquesElement.prototype
 */

/**
 * member {P} v
 * memberOf ArquesElement.prototype
 * desc [Get/Set] vector pointer array.
 */

//Object.defineProperty(ArquesElement.prototype, 'v', {
//	get : function() {
//		return P(this.x + this.w / 2, this.y + this.h / 2, this.z);
//	},
//
//	set : function(v) {
//		this.x = v.x - this.w / 2;
//		this.y = v.y - this.h / 2;
//		
//		if (v.z)
//			this.z = v.z;
//	}
//});
/**
 * @member ___Frame
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {R} frame
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] frame. Use global R(x, y, w, h) or RR(l, t, r, b) functions to specify the frame.
 */

Object.defineProperty(ArquesElement.prototype, 'frame', {
	get : function() {
		return R(this.x, this.y, this.w, this.h);
	},

	set : function(v) {
		this.x = v.x;
		this.y = v.y;
		this.w = v.w;
		this.h = v.h;
	}
});

/**
 * @member {R} frameP
 * @memberOf ArquesElement.prototype
 * @readonly
 * @desc [Get] frame adding padding.
 */

Object.defineProperty(ArquesElement.prototype, 'frameP', {
	get : function() {
		return R(this.x, //
		this.y, //
		this.w + this.pl + this.pr, //
		this.h + this.pt + this.pb);
	},

	set : function(v) {
		ar.log('ArquesElement.prototype.frameP is read only.');
	}
});

/**
 * @member {R} frameM
 * @memberOf ArquesElement.prototype
 * @readonly
 * @desc [Get] frame adding margin.
 */

Object.defineProperty(ArquesElement.prototype, 'frameM', {
	get : function() {
		return R(this.x, //
		this.y, //
		this.w + this.ml + this.mr, //
		this.h + this.mt + this.mb);
	},

	set : function(v) {
		ar.log('ArquesElement.prototype.frameM is read only.');
	}
});

/**
 * @member {R} frameMP
 * @memberOf ArquesElement.prototype
 * @readonly
 * @desc [Get] frame adding margin and padding.
 */

Object.defineProperty(ArquesElement.prototype, 'frameMP', {
	get : function() {
		return R(this.x, //
		this.y, // 
		this.w + this.pl + this.pr + this.ml + this.mr, //
		this.h + this.pt + this.pb + this.mt + this.mb);
	},

	set : function(v) {
		ar.log('ArquesElement.prototype.frameMP is read only.');
	}
});

//
//
//

/**
 * @member ___Min/Max
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {integer|string} minw
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] min width.
 */

Object.defineProperty(ArquesElement.prototype, 'minw', {
	get : function() {
		var r = this.style({
			field : 'minWidth',
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'minWidth',
			value : v,
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	}
});

/**
 * @member {integer|string} minh
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] min height.
 */

Object.defineProperty(ArquesElement.prototype, 'minh', {
	get : function() {
		var r = this.style({
			field : 'minHeight',
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'minHeight',
			value : v,
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	}
});

/**
 * @member {integer|string} maxw
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] max width.
 */

Object.defineProperty(ArquesElement.prototype, 'maxw', {
	get : function() {
		var r = this.style({
			field : 'maxWidth',
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'maxWidth',
			value : v,
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	}
});

/**
 * @member {integer|string} maxh
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] max height.
 */

Object.defineProperty(ArquesElement.prototype, 'maxh', {
	get : function() {
		var r = this.style({
			field : 'maxHeight',
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'maxHeight',
			value : v,
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	}
});

//
//
//

/**
 * @member ___Transform
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {string} transform
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] css transform.
 */

Object.defineProperty(ArquesElement.prototype, 'transform', {
	get : function() {
		var r = this.style({
			field : 'transform',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'transform',
			value : v,
		});
		return r;
	}
});

/**
 * @member ___Animation Options
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {string} aniFunc
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] css transition-timing-function.
 */

Object.defineProperty(ArquesElement.prototype, 'aniFunc', {
	get : function() {
		var r = this.style({
			field : 'transitionTimingFunction',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'transitionTimingFunction',
			value : v,
		});
		return r;
	}
});

/**
 * @member {float|string} aniTime
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] css animationDuration as milliseconds.
 */

Object.defineProperty(ArquesElement.prototype, 'aniTime', {
	get : function() {
		var r = this.style({
			field : 'animationDuration',
		});
		return parseFloat(r) * 1000;
	},

	set : function(v) {
		if (ar.isNum(v)) {
			v /= 1000;
			v += 's';
		}

		var r = this.style({
			field : 'animationDuration',
			value : v,
		});
		return r;
	}
});

/**
 * @member {float|string} transTime
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] css transitionDuration as milliseconds.
 */

Object.defineProperty(ArquesElement.prototype, 'transTime', {
	get : function() {
		var r = this.style({
			field : 'transitionDuration',
		});
		return parseFloat(r) * 1000;
	},

	set : function(v) {
		if (ar.isNum(v)) {
			v /= 1000;
			v += 's';
		}

		var r = this.style({
			field : 'transitionDuration',
			value : v,
		});
		return r;
	}
});

/**
 * @member {float|string} transDelay
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] css transitionDelay as milliseconds.
 */

Object.defineProperty(ArquesElement.prototype, 'transDelay', {
	get : function() {
		var r = this.style({
			field : 'transitionDelay',
		});
		return parseFloat(r) * 1000;
	},

	set : function(v) {
		if (ar.isNum(v)) {
			v /= 1000;
			v += 's';
		}

		var r = this.style({
			field : 'transitionDelay',
			value : v,
		});
		return r;
	}
});

/**
 * @member {float|string} transProp
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] css transitionProperty.
 */

Object.defineProperty(ArquesElement.prototype, 'transProp', {
	get : function() {
		var r = this.style({
			field : 'transitionProperty',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'transitionProperty',
			value : v,
		});
		return r;
	}
});

/**
 * @member {float|string} trans
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] css transition.
 */

Object.defineProperty(ArquesElement.prototype, 'trans', {
	get : function() {
		var r = this.style({
			field : 'transition',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'transition',
			value : v,
		});
		return r;
	}
});

ArquesElement.prototype.toRadIfRad = function(v) {
	var unit = this._angleUnit ? this._angleUnit : ar._angleUnit;

	if (unit == ar.RADIAN)
		v = v * Math.PI / 180;

	return v;
}

ArquesElement.prototype.toDegIfRad = function(v) {
	var unit = this._angleUnit ? this._angleUnit : ar._angleUnit;

	if (unit == ar.RADIAN)
		v = v * 180 / Math.PI;

	return v;
}

/**
 * @member ___Angle Unit
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {ArquesElement} angleUnit
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] angle unit. Specify ar.DEGREE or ar.RADIAN.
 */

Object.defineProperty(ArquesElement.prototype, 'angleUnit', {
	get : function() {
		var This = this;
		return This._angleUnit;
	},

	set : function(v) {
		var This = this;
		This._angleUnit = v;
		return This._angleUnit;
	}
});

/**
 * @member ___Spin
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {float} spin
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] spin angle.
 */

Object.defineProperty(ArquesElement.prototype, 'spin', {
	get : function() {
		var r = this._degree;
		r = this.toRadIfRad(r);
		return r;
	},

	set : function(v) {
		v = this.toDegIfRad(v);
		this._degree = v;
		this._degreeX = v;
		this._degreeY = v;
		this._degreeZ = v;
		this.matrix.apply();

		return this.rotate;
	}
});

/**
 * @member {float} spinX
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] spin angle on the x axis.
 */

Object.defineProperty(ArquesElement.prototype, 'spinX', {
	get : function() {
		var r = this._degreeX;
		r = this.toRadIfRad(r);
		return r;
	},

	set : function(v) {
		v = this.toDegIfRad(v);
		this._degreeX = v;
		this.matrix.apply();

		return this.spinX;
	}
});

/**
 * @member {float} spinY
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] spin angle on the y axis.
 */

Object.defineProperty(ArquesElement.prototype, 'spinY', {
	get : function() {
		var r = this._degreeY;
		r = this.toRadIfRad(r);
		return r;
	},

	set : function(v) {
		v = this.toDegIfRad(v);
		this._degreeY = v;
		this.matrix.apply();

		return this.spinY;
	}
});

/**
 * @member {float} spinZ
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] spin angle on the z axis.
 */

Object.defineProperty(ArquesElement.prototype, 'spinZ', {
	get : function() {
		var r = this._degreeZ;
		r = this.toRadIfRad(r);
		return r;
	},

	set : function(v) {
		v = this.toDegIfRad(v);
		this._degreeZ = v;
		this.matrix.apply();

		return this.spinZ;
	}
});

/**
 * @member ___Scale
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {float} scale
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] scale.
 */

Object.defineProperty(ArquesElement.prototype, 'scale', {
	get : function() {
		return Math.sqrt(this._scaleX * this._scaleX + this._scaleY * this._scaleY + this._scaleZ * this._scaleZ);
	},

	set : function(v) {
		this._scaleX = v;
		this._scaleY = v;
		this._scaleZ = v;
		this.matrix.apply();

		return this.scale;
	}
});

/**
 * @member {float} scaleX
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] scale on the x axis.
 */

Object.defineProperty(ArquesElement.prototype, 'scaleX', {
	get : function() {
		return this._scaleX;
	},

	set : function(v) {
		this._scaleX = v;
		this.matrix.apply();

		return this.scaleX;
	}
});

/**
 * @member {float} scaleY
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] scale on the y axis.
 */

Object.defineProperty(ArquesElement.prototype, 'scaleY', {
	get : function() {
		return this._scaleY;
	},

	set : function(v) {
		this._scaleY = v;
		this.matrix.apply();

		return this.scaleY;
	}
});

/**
 * @member {float} scaleZ
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] scale on the z axis.
 */

Object.defineProperty(ArquesElement.prototype, 'scaleZ', {
	get : function() {
		return this._scaleZ;
	},

	set : function(v) {
		this._scaleZ = v;
		this.matrix.apply();

		return this.scaleZ;
	}
});

/**
 * @member ___Skew
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {float} skew
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] skew angle.
 */

Object.defineProperty(ArquesElement.prototype, 'skew', {
	get : function() {
		var x = this.toRadIfRad(this._skewX);
		var y = this.toRadIfRad(this._skewY);
		var z = this.toRadIfRad(this._skewZ);

		return Math.sqrt(x * x + y * y + z * z);
	},

	set : function(v) {
		v = this.toDegIfRad(v);

		if (-91 < v && v < -89 || 89 < v && v < 91) {
			ar.log('skew value must avoid around 90 or -90 because a critical error could be occurred in some browser(including Chrome).');
			return;
		}

		this._skewX = v;
		this._skewY = v;
		this._skewZ = v;
		this.matrix.apply();

		return this.skew;
	}
});

/**
 * @member {float} skewX
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] skew on the x axis.
 */

Object.defineProperty(ArquesElement.prototype, 'skewX', {
	get : function() {
		var r = this._skewX;
		r = this.toRadIfRad(r);
		return r;
	},

	set : function(v) {
		v = this.toDegIfRad(v);

		if (-91 < v && v < -89 || 89 < v && v < 91) {
			ar.log('skew value must avoid around 90 or -90 because a critical error(infinite loop) could be occurred in some browser.');
			return;
		}

		this._skewX = v;
		this.matrix.apply();

		return this.skewX;
	}
});

/**
 * @member {float} skewY
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] skew on the y axis.
 */

Object.defineProperty(ArquesElement.prototype, 'skewY', {
	get : function() {
		var r = this._skewY;
		r = this.toRadIfRad(r);
		return r;
	},

	set : function(v) {
		v = this.toDegIfRad(v);

		if (-91 < v && v < -89 || 89 < v && v < 91) {
			ar.log('skew value must avoid around 90 or -90 because a critical error(infinite loop) could be occurred in some browser.');
			return;
		}

		this._skewY = v;
		this.matrix.apply();
		return this.skewY;
	}
});

Object.defineProperty(ArquesElement.prototype, 'skewZ', {
	get : function() {
		var r = this._skewZ;
		r = this.toRadIfRad(r);
		return r;
	},

	set : function(v) {
		v = this.toDegIfRad(v);

		ar.log('currently skewZ is not supported.');
		return;

		/*
		this._skewZ = v;
		this.matrix.apply();

		return this.skewZ;
		*/
	}
});

/**
 * @member ___Flip
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {boolean} flipX
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] flip on the x axis.
 */

Object.defineProperty(ArquesElement.prototype, 'flipX', {
	get : function() {
		return this._flipX;
	},

	set : function(v) {
		this._flipX = v ? -1 : 1;
		this.matrix.apply();

		return this.flipX;
	}
});

/**
 * @member {boolean} flipY
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] flip on the y axis.
 */

Object.defineProperty(ArquesElement.prototype, 'flipY', {
	get : function() {
		return this._flipY;
	},

	set : function(v) {
		this._flipY = v ? -1 : 1;
		this.matrix.apply();

		return this.flipY;
	}
});

Object.defineProperty(ArquesElement.prototype, 'flipZ', {
	get : function() {
		return this._flipZ;
	},

	set : function(v) {
		this._flipZ = v ? -1 : 1;
		this.matrix.apply();

		return this.flipZ;
	}
});

//
//
//

/**
 * @member ___Margin
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {integer|string} margin
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] margin.
 */

Object.defineProperty(ArquesElement.prototype, 'margin', {
	get : function() {
		var r = this.style({
			field : 'margin',
			isUsePxUnit : false,
			returnType : '',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'margin',
			value : v,
			isUsePxUnit : false,
			returnType : '',
		});
		return r;
	}
});

/**
 * @member {integer|string} ml
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] margin left.
 */

Object.defineProperty(ArquesElement.prototype, 'ml', {
	get : function() {
		var r = this.style({
			field : 'marginLeft',
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'marginLeft',
			value : v,
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	}
});

/**
 * @member {integer|string} mt
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] margin top.
 */

Object.defineProperty(ArquesElement.prototype, 'mt', {
	get : function() {
		var r = this.style({
			field : 'marginTop',
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'marginTop',
			value : v,
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	}
});

/**
 * @member {integer|string} mr
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] margin right.
 */

Object.defineProperty(ArquesElement.prototype, 'mr', {
	get : function() {
		var r = this.style({
			field : 'marginRight',
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'marginRight',
			value : v,
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	}
});

/**
 * @member {integer|string} mb
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] margin bottom.
 */

Object.defineProperty(ArquesElement.prototype, 'mb', {
	get : function() {
		var r = this.style({
			field : 'marginBottom',
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'marginBottom',
			value : v,
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	}
});

//
//
//

/**
 * @member ___Padding
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {integer|string} padding
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] padding.
 */

Object.defineProperty(ArquesElement.prototype, 'padding', {
	get : function() {
		var r = this.style({
			field : 'padding',
			isUsePxUnit : false,
			returnType : '',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'padding',
			value : v,
			isUsePxUnit : false,
			returnType : '',
		});
		return r;
	}
});

/**
 * @member {integer|string} pl
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] padding left.
 */

Object.defineProperty(ArquesElement.prototype, 'pl', {
	get : function() {
		var r = this.style({
			field : 'paddingLeft',
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'paddingLeft',
			value : v,
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	}
});

/**
 * @member {integer|string} pt
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] padding top.
 */

Object.defineProperty(ArquesElement.prototype, 'pt', {
	get : function() {
		var r = this.style({
			field : 'paddingTop',
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'paddingTop',
			value : v,
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	}
});

/**
 * @member {integer|string} pr
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] padding right.
 */

Object.defineProperty(ArquesElement.prototype, 'pr', {
	get : function() {
		var r = this.style({
			field : 'paddingRight',
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'paddingRight',
			value : v,
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	}
});

/**
 * @member {integer|string} pb
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] padding bottom.
 */

Object.defineProperty(ArquesElement.prototype, 'pb', {
	get : function() {
		var r = this.style({
			field : 'paddingBottom',
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'paddingBottom',
			value : v,
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	}
});

//
//
//

/**
 * @member ___Scroll
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {integer} sl
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] scroll left.
 */

Object.defineProperty(ArquesElement.prototype, 'sl', {
	get : function() {
		return this[0] ? this[0].scrollLeft : 0;
	},

	set : function(v) {
		if (v != undefined)
			for (var i = 0; i < this.length; i++)
				this[i].scrollLeft = v;

		return this.sl;
	}
});

/**
 * @member {integer} st
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] scroll top.
 */

Object.defineProperty(ArquesElement.prototype, 'st', {
	get : function() {
		return this[0] ? this[0].scrollTop : 0;
	},

	set : function(v) {
		if (v != undefined)
			for (var i = 0; i < this.length; i++)
				this[i].scrollTop = v;

		return this.st;
	}
});

/**
 * @member {integer} sw
 * @memberOf ArquesElement.prototype
 * @desc [Get] scroll width.
 * @readonly
 */

Object.defineProperty(ArquesElement.prototype, 'sw', {
	get : function() {
		return this[0] ? this[0].scrollWidth : 0;
	},

	set : function() {
		ar.log('"sw"(scrollWidth) property is readonly');
	}
});

/**
 * @member {integer} sh
 * @memberOf ArquesElement.prototype
 * @desc [Get] scroll height.
 * @readonly
 */

Object.defineProperty(ArquesElement.prototype, 'sh', {
	get : function() {
		return this[0] ? this[0].scrollHeight : 0;
	},

	set : function() {
		ar.log('"sh"(scrollHeight) property is readonly');
	}
});

/**
 * @method ArquesElement.prototype.se
 * @desc Scroll to the end.
 * @param {boolean} isHorizontal
 */

ArquesElement.prototype.se = function(isHorizontal) { // scroll to the end
	if (isHorizontal)
		this.sl = this.sw - this.w;
	else
		this.st = this.sh - this.h;
}

/**
 * @member {integer} onScroll
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] onScroll.
 */

Object.defineProperty(ArquesElement.prototype, 'onScroll', {
	get : function() {
		return this[0] ? this[0].onscroll : 0;
	},

	set : function(v) {
		if (v != undefined)
			for (var i = 0; i < this.length; i++)
				this[i].onscroll = v;
	}
});

/**
 * @member ___Offset
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {integer} ot
 * @memberOf ArquesElement.prototype
 * @desc [Get] offset top.
 * @readonly
 */

Object.defineProperty(ArquesElement.prototype, 'ot', {
	get : function() {
		return this[0] ? this[0].offsetTop : 0;
	},

	set : function() {
		ar.log('"ot"(offsetTop) property is readonly');
	}
});

/**
 * @member {integer} ol
 * @memberOf ArquesElement.prototype
 * @desc [Get] offset left.
 * @readonly
 */

Object.defineProperty(ArquesElement.prototype, 'ol', {
	get : function() {
		return this[0] ? this[0].offsetLeft : 0;
	},

	set : function() {
		ar.log('"ol"(offsetLeft) property is readonly');
	}
});

/**
 * @member {integer} ow
 * @memberOf ArquesElement.prototype
 * @desc [Get] offset width.
 * @readonly
 */

Object.defineProperty(ArquesElement.prototype, 'ow', {
	get : function() {
		return this[0] ? this[0].offsetWidth : 0;
	},

	set : function() {
		ar.log('"ow"(offsetWidth) property is readonly');
	}
});

/**
 * @member {integer} oh
 * @memberOf ArquesElement.prototype
 * @desc [Get] offset height.
 * @readonly
 */

Object.defineProperty(ArquesElement.prototype, 'oh', {
	get : function() {
		return this[0] ? this[0].offsetHeight : 0;
	},

	set : function() {
		ar.log('"oh"(offsetHeight) property is readonly');
	}
});

//
//
//

/**
 * @member ___Overflow
 * @memberOf ArquesElement.prototype
 */

/**
 * @member overflow
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] overflow.
 */

Object.defineProperty(ArquesElement.prototype, 'overflow', {
	get : function() {
		var r = this.style({
			field : 'overflow',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'overflow',
			value : v,
		});
		return r;
	}
});

/**
 * @member ox
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] overflow-x.
 */

Object.defineProperty(ArquesElement.prototype, 'ox', {
	get : function() {
		var r = this.style({
			field : 'overflowX',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'overflowX',
			value : v,
		});
		return r;
	}
});

/**
 * @member oy
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] overflow-y.
 */

Object.defineProperty(ArquesElement.prototype, 'oy', {
	get : function() {
		var r = this.style({
			field : 'overflowY',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'overflowY',
			value : v,
		});
		return r;
	}
});

//
//
//

/**
 * @member ___Visibility
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {string} display
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] display.
 */

Object.defineProperty(ArquesElement.prototype, 'display', {
	get : function() {
		var r = this.style({
			field : 'display',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'display',
			value : v,
		});

		return r;
	}
});

/**
 * @member {boolean|string} visible
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] visibility.
 */

Object.defineProperty(ArquesElement.prototype, 'visible', {
	get : function() {
		var r = this.style({
			field : 'visibility',
		});
		return r != 'hidden';
	},

	set : function(v) {
		var r = 'hidden';

		if (isNaN(v) == false || typeof v == 'boolean')
			r = this.style({
				field : 'visibility',
				value : v ? 'visible' : 'hidden',
			});
		else
			r = this.style({
				field : 'visibility',
				value : v == 'visible' || v == 'true' || v != '0' ? v : 'hidden',
			});

		return r;
	}
});

/**
 * @method ArquesElement.prototype.hide
 * @desc Hides element. (runs display = none)
 */

ArquesElement.prototype.hide = function() {
	this.display = 'none';
}

/**
 * @method ArquesElement.prototype.show
 * @desc Shows element. (runs display = 'block', visibility = 'visible')
 * @param {string} type - Specify a display type. The default is 'block' if it's not given.
 */

ArquesElement.prototype.show = function(type) {
	this.display = type ? type : 'block';
	this.visible = true;
}

/**
 * @method ArquesElement.prototype.isShowing
 * @desc Runs animation.
 * @return {boolean} Tells if it's visible. (this.display != 'none' && this.visible != 'hidden')
 */

ArquesElement.prototype.isShowing = function() {
	if (this.length == 0)
		return false;

	return this.display != 'none' && this.visible != 'hidden';
}

/**
 * @member {string} position
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] position. Set one of static | absolute | fixed | relative | sticky | initial | inherit.
 */

Object.defineProperty(ArquesElement.prototype, 'position', {
	get : function() {
		var r = this.style({
			field : 'position',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'position',
			value : v,
			isUsePxUnit : false,
			isToUseClientRect : false,
		});
		return r;
	}
});

/**
 * @member {string} float
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] cssFloat. Set one of left | right | none | initial | inherit.
 */

Object.defineProperty(ArquesElement.prototype, 'float', {
	get : function() {
		var r = this.style({
			field : 'cssFloat',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'cssFloat',
			value : v,
			isUsePxUnit : false,
			isToUseClientRect : false,
		});
		return r;
	}
});

//
//
//

/**
 * @member ___Background & Color
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {string} background
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] background.
 */

Object.defineProperty(ArquesElement.prototype, 'background', {
	get : function() {
		var r = this.style({
			field : 'background',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'background',
			value : v,
		});
		return r;
	}
});

/**
 * @member {string} bi
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] background image.
 */

Object.defineProperty(ArquesElement.prototype, 'bi', {
	get : function() {
		var r = this.style({
			field : 'backgroundImage',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'backgroundImage',
			value : v,
		});
		return r;
	}
});

/**
 * @member {string} bs
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] background size.
 */

Object.defineProperty(ArquesElement.prototype, 'bs', {
	get : function() {
		var r = this.style({
			field : 'backgroundSize',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'backgroundSize',
			value : v,
		});
		return r;
	}
});

/**
 * @member {string} bc
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] background color.
 */

Object.defineProperty(ArquesElement.prototype, 'bc', {
	get : function() {
		var r = this.style({
			field : 'backgroundColor',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'backgroundColor',
			value : v,
		});
		return r;
	}
});

/**
 * @member {string} fill
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] fill color.
 */

Object.defineProperty(ArquesElement.prototype, 'fill', {
	get : function() {
		var r = this.style({
			field : 'fill',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'fill',
			value : v,
		});
		return r;
	}
});

//
//
//

/**
 * @member {float} alpha
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] opacity.
 */

Object.defineProperty(ArquesElement.prototype, 'alpha', {
	get : function() {
		var r = this.style({
			field : 'opacity',
			returnType : 'float',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'opacity',
			returnType : 'float',
			value : v,
		});
		return r;
	}
});

//
//
//

/**
 * @member ___Font
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {string} fc
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] font color.
 */

Object.defineProperty(ArquesElement.prototype, 'fc', {
	get : function() {
		var r = this.style({
			field : 'color',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'color',
			value : v,
		});
		return r;
	}
});

/**
 * @member {integer} fs
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] font size.
 */

Object.defineProperty(ArquesElement.prototype, 'fs', {
	get : function() {
		var r = this.style({
			field : 'fontSize',
			isUsePxUnit : true,
			returnType : 'int',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'fontSize',
			isUsePxUnit : true,
			returnType : 'int',
			value : v,
		});
		return r;
	}
});

/**
 * @member {string} ff
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] font family.
 */

Object.defineProperty(ArquesElement.prototype, 'ff', {
	get : function() {
		var r = this.style({
			field : 'fontFamily',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'fontFamily',
			value : v,
		});
		return r;
	}
});

/**
 * @member {string} fw
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] font weight.
 */

Object.defineProperty(ArquesElement.prototype, 'fw', {
	get : function() {
		var r = this.style({
			field : 'fontWeight',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'fontWeight',
			value : v,
		});
		return r;
	}
});

/**
 * @member ___Etc
 * @memberOf ArquesElement.prototype
 */

/**
 * @member {string} filter
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] filter.
 */

Object.defineProperty(ArquesElement.prototype, 'filter', {
	get : function() {
		var r = this.style({
			field : 'filter',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'filter',
			value : v,
		});
		return r;
	}
});

/**
 * @member {string} alignX
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] text align. Set one of ar.LEFT | ar.CENTER | ar.RIGHT
 */

Object.defineProperty(ArquesElement.prototype, 'alignX', {
	get : function() {
		var r = this.style({
			field : 'text-align',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'text-align',
			value : v,
		});
		return r;
	}
});

/**
 * @member {string} alignY
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] text align. Set one of ar.TOP | ar.CENTER | ar.BOTTOM
 */

Object.defineProperty(ArquesElement.prototype, 'alignY', {
	get : function() {
		var r = this.style({
			field : 'vertical-align',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'vertical-align',
			value : v,
		});
		return r;
	}
});

//
//
//

/**
 * @member {string} cursor
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] Cursor.
 */

Object.defineProperty(ArquesElement.prototype, 'cursor', {
	get : function() {
		var r = this.style({
			field : 'cursor',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'cursor',
			value : v,
		});
		return r;
	}
});

/**
 * @member {float} zoom
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] zoom.
 */

Object.defineProperty(ArquesElement.prototype, 'zoom', {
	get : function() {
		var r = this.style({
			field : 'zoom',
			returnType : 'float',
		});
		return r;
	},

	set : function(v) {
		var r = this.style({
			field : 'zoom',
			value : v,
			returnType : 'float',
		});
		return r;
	}
});

/**
 * @member {string} sel
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] User selection. Set one of 'auto' | 'text' | 'none' | 'contain' | 'all'
 */

Object.defineProperty(ArquesElement.prototype, 'sel', {
	get : function() {
		var r = this.style({
			field : 'user-select',
		});
		return r;
	},

	set : function(v) {
		this.style({
			field : '-webkit-user-select',
			value : v,
		});
		var r = this.style({
			field : 'user-select',
			value : v,
		});
		return r;
	}
});

/**
 * @member {string} drag
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] User drag. Set one of 'auto' | 'element' | 'none'
 */

Object.defineProperty(ArquesElement.prototype, 'drag', {
	get : function() {
		var r = this.style({
			field : 'user-drag',
		});
		return r;
	},

	set : function(v) {
		this.style({
			field : '-webkit-user-drag',
			value : v,
		});
		var r = this.style({
			field : 'user-drag',
			value : v,
		});
		return r;
	}
});

//
// Classes
//

/**
 * @member {string} cls
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] class.
 */

Object.defineProperty(ArquesElement.prototype, 'cls', {
	get : function() {
		if (this.length == 0)
			return null;

		return this[0].className;
	},

	set : function(v) {
		if (this.length == 0)
			return null;

		for (var i = 0; i < this.length; i++)
			this[i].className = v;

		return this.cls;
	}
});

/**
 * @method ArquesElement.prototype.addCls
 * @desc Add class.
 * @param {string} className - A class name to be added.
 */

ArquesElement.prototype.addCls = function(className) {
	for (var i = 0; i < this.length; i++) {
		this[i].className = this[i].className.replaceAll(className, '').trim();
		this[i].className += ' ' + className;
	}
}

/**
 * @method ArquesElement.prototype.delCls
 * @desc Delete class.
 * @param {string} className - A class name to be deleted.
 */

ArquesElement.prototype.delCls = function(className) {
	for (var i = 0; i < this.length; i++)
		this[i].className = this[i].className.replaceAll(className, '').trim();
}

//
//
//

/**
 * @member {string} html
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] inner html.
 */

Object.defineProperty(ArquesElement.prototype, 'html', {
	get : function() {
		if (this.length == 0)
			return null;

		return this[0].innerHTML;
	},

	set : function(v) {
		this._children = [];

		for (var i = 0; i < this.length; i++) {
			this[i].innerHTML = v;
			var chil = null;

			if (this[i].children.length == 1 && this[i].children[0].tagName && this[i].children[0].tagName.toLowerCase() == 'tbody') {
				chil = this[i].children[0].children;
			}
			else {
				chil = this[i].children;
			}

			for (var j = 0; j < chil.length; j++)
				this._children.push(E(chil[j]));
		}

		return v ? v : (this[0] ? this[0].innerHTML : null);
	}
});

/**
 * @member {string} val
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] value.
 */

Object.defineProperty(ArquesElement.prototype, 'val', {
	get : function() {
		if (this.length == 0)
			return null;

		return this[0].value;
	},

	set : function(v) {
		for (var i = 0; i < this.length; i++)
			this[i].value = v;

		return v ? v : (this[0] ? this[0].value : null);
	}
});

/**
 * @member {boolean} checked
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] checked.
 */

Object.defineProperty(ArquesElement.prototype, 'checked', {
	get : function() {
		if (this.length == 0)
			return null;

		return this[0].checked ? true : false;
	},

	set : function(v) {
		for (var i = 0; i < this.length; i++)
			this[i].checked = v ? true : false;

		return this.checked;
	}
});

/**
 * @member {boolean} focused
 * @memberOf ArquesElement.prototype
 * @desc [Get/Set] focused.
 */

Object.defineProperty(ArquesElement.prototype, 'focused', {
	get : function() {
		if (this.length == 0)
			return null;

		for (var i = 0; i < this.length; i++)
			if (this[i] == document.activeElement)
				return true;

		return false;
	},

	set : function(v) {
		for (var i = 0; i < this.length; i++)
			if (v && this[i].focus) {
				this[i].focus();
				break;
			}
			else if (!v && this[i].blur) {
				this[i].blur();
				break;
			}

		return this.focused;
	}
});

/**
 * @member {string} tag
 * @memberOf ArquesElement.prototype
 * @desc [Get] the tag name.
 * @readonly
 */

Object.defineProperty(ArquesElement.prototype, 'tag', {
	get : function() {
		if (this.length == 0 || !this[0].tagName)
			return null;

		return this[0].tagName.toLowerCase();
	},

	set : function(v) {
		ar.log('tag property is readonly');
	}
});

//
// Event
//

/**
 * @method ArquesElement.prototype.on
 * @desc Sets an event handler
 * @param {string} key - javascript event name
 * @param {function} cb - callback
 * @param {string} [isUseNative] - Specify whether using centralized event controller or javascript native event. Please remind that native event uses more resources and can cause performance issue.
 */

ArquesElement.prototype.on = function(name, cb, isUseNative) {
	var This = this;

	if (cb) {
		This.events[name] = cb;

		for (var i = 0; i < This.length; i++) {
			if (isUseNative) {
				if (This._isWindow)
					window.addEventListener(name, cb);
				else
					This[i].addEventListener(name, cb);
			}
			else
				ar.on(This[i], name, cb);
		}
	}
	else if (This.events[name])
		This.events[name]();
}

/**
 * @method ArquesElement.prototype.off
 * @desc Unsets an event handler
 * @param {string} key - javascript event name
 * @param {function} [cb] - callback
 * @param {string} [isUseNative] - Specify whether using centralized event controller or javascript native event. Please remind that native event uses more resources and can cause performance issue.
 */

ArquesElement.prototype.off = function(name, cb, isUseNative) {
	var This = this;

	for (var i = 0; i < This.length; i++) {
		if (isUseNative) {
			if (This._isWindow)
				window.removeEventListener(name, cb);
			else
				This[i].removeEventListener(name, cb);
		}
		else
			ar.off(This[i], name, This.events[name]);
	}

	delete This.events[name];
}

//
// Etc Utils
//

/**
 * @method ArquesElement.prototype.attr
 * @desc [Get/Set] attribute of DOM object.
 * @param {string} key - attribute name
 * @param {string} [value] - attribute value to set
 */

ArquesElement.prototype.attr = function(k, v) {
	if (typeof v != 'undefined')
		for (var i = 0; i < this.length; i++)
			this[i].setAttribute(k, v);

	if (this[0])
		return this[0].getAttribute(k);
	else
		return null;
}

/**
 * @method ArquesElement.prototype.enable
 * @desc Enables element. The element will accept centralized events if it's enabled
 */

ArquesElement.prototype.enable = function() {
	this._isEnabled = true;
}

/**
 * @method ArquesElement.prototype.disable
 * @desc Disables element. The element will not accept centralized events if it's disabled
 */

ArquesElement.prototype.disable = function() {
	this._isEnabled = false;
}

/**
 * @method ArquesElement.prototype.isEnabled
 * @desc Tells if the element is enabled.
 */

ArquesElement.prototype.isEnabled = function() {
	return this._isEnabled;
}

//
// Animation
// 

/**
 * @method ArquesElement.prototype.ani
 * @desc Runs animation.
 * @param {string} name - animation name (please refer to https://daneden.github.io/animate.css/ for the name)
 * @param {function} cb - Callback is called as soon as the animation is finished.
 */

ArquesElement.prototype.ani = function(name, cb) {
	var This = this;
	ar.ani({
		obj : This,
		name : name,
		cb : cb,
	});
}

/**
 * @function P
 * @desc Returns { x, y, z } point structure.
 * @param {float} x
 * @param {float} y
 * @param {float} z
 */

P = function(x, y, z) {
	var point = {};
	point.x = x;
	point.y = y;
	point.z = z;
	return point;
}

/**
 * @function R
 * @desc Returns { x, y, w, h } rect structure.
 * @param {float} x
 * @param {float} y
 * @param {float} w
 * @param {float} h
 */

R = function(x, y, w, h) {
	var rect = {};
	rect.x = x;
	rect.y = y;
	rect.w = w;
	rect.h = h;
	return rect;
}

/**
 * @function RR
 * @desc Returns { x, y, w, h } rect structure by converting { l, t, r, b } to { x, y, w, h }.
 * @param {float} l
 * @param {float} t
 * @param {float} r
 * @param {float} b
 */

RR = function(l, t, r, b) {
	var rect = {};
	rect.x = l;
	rect.y = t;
	rect.w = r - l + 1;
	rect.h = b - t + 1;
	return rect;
}
