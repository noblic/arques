(function() {
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
		if (This._isWindow)
			return window.scrollX;
		
		return this[0] ? this[0].scrollLeft : 0;
	},

	set : function(v) {
		if (This._isWindow) {
			ar.log('window.scrollX is read only.');
			return this.sl;
		}
		
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
		if (This._isWindow)
			return window.scrollY;
		
		return this[0] ? this[0].scrollTop : 0;
	},

	set : function(v) {
		if (This._isWindow) {
			ar.log('window.scrollY is read only.');
			return this.st;
		}
		
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
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

/**
 * @func icon
 * @memberOf ar
 * @desc Returns html string of specified icon.
 * @param {string} name - Icon name. Please refer to <a target="newnew" href="https://www.noblic.com/arques/samples/icons.html">https://www.noblic.com/arques/samples/icons.html</a> for the name.
 * @param {integer} [size] - Icon size. Default size is 24.
 * @param {string} [style] - CSS style string for coloring and etc.
 */

ar.icon = function(name, size, style) {
	if (ar.icon.shapes[name] == undefined)
		name = 'help';

	if (size == undefined)
		size = 24;

	var html = '';
	html += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" shape-rendering="geometricPrecision" width="' + size + '" height="' + size + '" style="' + (style ? style : '') + '">';
	html += ar.icon.shapes[name];
	html += '</svg>';

	return html;
}

/*
 * angular-material-icons v0.7.1
 * (c) 2014 Klar Systems
 * License: MIT
 * 
 * Edited by Andy Remi
 */

ar.icon.shapes = {
	/*
	 * Material Design Icons
	 * (http://materialdesignicons.com)
	 */
	'_title0' : 'None',
	'none' : '<path/>',

	'_title1' : 'Company',
	'amazon' : '<path d="M13.23 10.56V10c-1.94 0-3.99.39-3.99 2.67 0 1.16.61 1.95 1.63 1.95.76 0 1.43-.47 1.86-1.22.52-.93.5-1.8.5-2.84m2.7 6.53c-.18.16-.43.17-.63.06-.89-.74-1.05-1.08-1.54-1.79-1.47 1.5-2.51 1.95-4.42 1.95-2.25 0-4.01-1.39-4.01-4.17 0-2.18 1.17-3.64 2.86-4.38 1.46-.64 3.49-.76 5.04-.93V7.5c0-.66.05-1.41-.33-1.96-.32-.49-.95-.7-1.5-.7-1.02 0-1.93.53-2.15 1.61-.05.24-.25.48-.47.49l-2.6-.28c-.22-.05-.46-.22-.4-.56.6-3.15 3.45-4.1 6-4.1 1.3 0 3 .35 4.03 1.33C17.11 4.55 17 6.18 17 7.95v4.17c0 1.25.5 1.81 1 2.48.17.25.21.54 0 .71l-2.06 1.78h-.01"/><path d="M20.16 19.54C18 21.14 14.82 22 12.1 22c-3.81 0-7.25-1.41-9.85-3.76-.2-.18-.02-.43.25-.29 2.78 1.63 6.25 2.61 9.83 2.61 2.41 0 5.07-.5 7.51-1.53.37-.16.66.24.32.51"/><path d="M21.07 18.5c-.28-.36-1.85-.17-2.57-.08-.19.02-.22-.16-.03-.3 1.24-.88 3.29-.62 3.53-.33.24.3-.07 2.35-1.24 3.32-.18.16-.35.07-.26-.11.26-.67.85-2.14.57-2.5z"/>',
	'apple' : '<path d="M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83"/>',
	'facebook-box' : '<path d="M19 4v3h-2a1 1 0 0 0-1 1v2h3v3h-3v7h-3v-7h-2v-3h2V7.5C13 5.56 14.57 4 16.5 4M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4c0-1.11-.9-2-2-2z"/>',
	'facebook-messenger' : '<path d="M12 2C6.5 2 2 6.14 2 11.25c0 2.88 1.42 5.45 3.65 7.15l.06 3.6 3.45-1.88-.03-.01c.91.25 1.87.39 2.87.39 5.5 0 10-4.14 10-9.25S17.5 2 12 2m1.03 12.41l-2.49-2.63-5.04 2.63 5.38-5.63 2.58 2.47 4.85-2.47-5.28 5.63z"/>',
	'facebook' : '<path d="M17 2v4h-2c-.69 0-1 .81-1 1.5V10h3v4h-3v8h-4v-8H7v-4h3V6a4 4 0 0 1 4-4h3z"/>',
	'github-box' : '<path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-5.15c-.35-.08-.35-.76-.35-1v-2.74c0-.93-.33-1.54-.69-1.85 2.23-.25 4.57-1.09 4.57-4.91 0-1.11-.38-2-1.03-2.71.1-.25.45-1.29-.1-2.64 0 0-.84-.27-2.75 1.02-.79-.22-1.65-.33-2.5-.33-.85 0-1.71.11-2.5.33-1.91-1.29-2.75-1.02-2.75-1.02-.55 1.35-.2 2.39-.1 2.64-.65.71-1.03 1.6-1.03 2.71 0 3.81 2.33 4.67 4.55 4.92-.28.25-.54.69-.63 1.34-.57.24-2.04.69-2.91-.83 0 0-.53-.96-1.53-1.03 0 0-.98-.02-.1.6 0 0 .68.31 1.14 1.47 0 0 .59 1.94 3.36 1.34V21c0 .24 0 .92-.36 1H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>',
	'github-circle' : '<path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>',
	'google-plus-box' : '<path d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4c0-1.11-.9-2-2-2M9.07 19.2C6.27 19.2 5 17.64 5 16.18c0-.45.14-1.59 1.5-2.38.75-.47 1.83-.8 3.12-.91-.19-.25-.34-.55-.34-.99 0-.15.02-.31.06-.46h-.39C7 11.44 5.8 9.89 5.8 8.39c0-1.73 1.29-3.59 4.11-3.59h4.22l-.34.34-.71.71-.08.06h-.7c.41.42.9 1.09.9 2.16 0 1.4-.74 2.09-1.56 2.73-.14.12-.42.38-.42.7 0 .32.24.5.39.64.13.11.29.22.47.36.81.55 1.92 1.33 1.92 2.86 0 1.77-1.29 3.84-4.93 3.84M19 12h-2v2h-1v-2h-2v-1h2V9h1v2h2"/><path d="M10.57 13.81c-.11-.01-.19-.01-.32-.01h-.02c-.26 0-1.15.05-1.82.27-.64.24-1.41.72-1.41 1.7C7 16.85 8.04 18 9.96 18c1.54 0 2.44-1 2.44-2 0-.75-.46-1.21-1.83-2.19"/><path d="M11.2 8.87c0-1.02-.63-3.02-2.08-3.02-.62 0-1.32.44-1.32 1.65 0 1.2.62 2.95 1.97 2.95.06 0 1.43-.01 1.43-1.58z"/>',
	'google-plus' : '<path d="M13.3 13.45l-1.08-.85c-.36-.3-.82-.69-.82-1.42s.55-1.29.97-1.62c1.31-1.02 2.57-2.1 2.57-4.34 0-2.07-1.27-3.26-2.04-3.92h1.75L15.9.05H9.67c-4.36 0-6.6 2.71-6.6 5.72 0 2.33 1.79 4.83 4.98 4.83h.8c-.13.35-.35.84-.35 1.3 0 1.01.42 1.43.92 2-1.42.1-4.01.43-5.92 1.6-1.86 1.1-2.3 2.63-2.3 3.75 0 2.3 2.06 4.5 6.57 4.5 5.35 0 8.03-2.96 8.03-5.88 0-2.16-1.13-3.27-2.5-4.42M5.65 4.31c0-2.21 1.31-3.21 2.69-3.21 2.66 0 4.01 3.45 4.01 5.53 0 2.57-2.07 3.07-2.89 3.07C7 9.7 5.65 6.64 5.65 4.31M9.3 22.3c-3.33 0-5.45-1.49-5.45-3.7 0-2.2 1.96-2.91 2.65-3.16 1.3-.44 3-.49 3.27-.49.3 0 .46 0 .73.02 2.34 1.69 3.35 2.44 3.35 4.03 0 1.77-1.82 3.3-4.55 3.3"/><path d="M21 10V7h-2v3h-3v2h3v3h2v-3h3v-2h-3z"/>',
	'hangouts' : '<path d="M15 11l-1 2h-1.5l1-2H12V8h3m-4 3l-1 2H8.5l1-2H8V8h3m.5-6A8.5 8.5 0 0 0 3 10.5a8.5 8.5 0 0 0 8.5 8.5h.5v3.5c4.86-2.35 8-7.5 8-12C20 5.8 16.19 2 11.5 2z"/>',
	'linkedin-box' : '<path d="M19 19h-3v-5.3a1.5 1.5 0 0 0-1.5-1.5 1.5 1.5 0 0 0-1.5 1.5V19h-3v-9h3v1.2c.5-.84 1.59-1.4 2.5-1.4a3.5 3.5 0 0 1 3.5 3.5M6.5 8.31c-1 0-1.81-.81-1.81-1.81A1.81 1.81 0 0 1 6.5 4.69c1 0 1.81.81 1.81 1.81A1.81 1.81 0 0 1 6.5 8.31M8 19H5v-9h3m12-8H4c-1.11 0-2 .89-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4c0-1.11-.9-2-2-2z"/>',
	'linkedin' : '<path d="M21 21h-4v-6.75c0-1.06-1.19-1.94-2.25-1.94S13 13.19 13 14.25V21H9V9h4v2c.66-1.07 2.36-1.76 3.5-1.76 2.5 0 4.5 2.04 4.5 4.51V21"/><path d="M7 21H3V9h4v12"/><path d="M5 3a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2z"/>',
	'login' : '<path d="M10 17.25V14H3v-4h7V6.75L15.25 12 10 17.25"/><path d="M8 2h9a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4h2v4h9V4H8v4H6V4a2 2 0 0 1 2-2z"/>',
	'logout' : '<path d="M17 17.25V14h-7v-4h7V6.75L22.25 12 17 17.25"/><path d="M13 2a2 2 0 0 1 2 2v4h-2V4H4v16h9v-4h2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z"/>',
	'office' : '<path d="M3 18l4-1.25V7l7-2v14.5L3.5 18.25 14 22l6-1.25V3.5L13.95 2 3 5.75V18z"/>',
	'twitter' : '<path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21-.36.1-.74.15-1.13.15-.27 0-.54-.03-.8-.08.54 1.69 2.11 2.95 4 2.98-1.46 1.16-3.31 1.84-5.33 1.84-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>',
	'whatsapp' : '<path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88"/><path d="M12 4a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96C8.69 19.46 10.28 20 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8zm0-2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65C2.57 15.8 2 13.97 2 12A10 10 0 0 1 12 2"/>',
	'windows' : '<path d="M3 12V6.75l6-1.32v6.48L3 12"/><path d="M20 3v8.75l-10 .15V5.21L20 3"/><path d="M3 13l6 .09v6.81l-6-1.15V13"/><path d="M20 13.25V22l-10-1.91V13.1l10 .15z"/>',

	/*
	 * custom icons
	 */
	'_title2' : 'Custom Icon',
	'signal_wifi_0_bar' : '<path fill-opacity=".3" d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/>',
	'signal_wifi_1_bar' : '<path fill-opacity=".3" d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/><path d="M6.67 14.86L12 21.49v.01l.01-.01 5.33-6.63C17.06 14.65 15.03 13 12 13s-5.06 1.65-5.33 1.86z"/>',
	'signal_wifi_2_bar' : '<path fill-opacity=".3" d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/><path d="M4.79 12.52l7.2 8.98H12l.01-.01 7.2-8.98C18.85 12.24 16.1 10 12 10s-6.85 2.24-7.21 2.52z"/>',
	'signal_wifi_3_bar' : '<path fill-opacity=".3" d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/><path d="M3.53 10.95l8.46 10.54.01.01.01-.01 8.46-10.54C20.04 10.62 16.81 8 12 8c-4.81 0-8.04 2.62-8.47 2.95z"/>',
	'signal_cellular_connected_no_internet_0_bar' : '<path fill-opacity=".3" d="M22 8V2L2 22h16V8z"/><path d="M20 22h2v-2h-2v2zm0-12v8h2v-8h-2z"/>',
	'signal_cellular_connected_no_internet_1_bar' : '<path fill-opacity=".3" d="M22 8V2L2 22h16V8z"/><path d="M20 10v8h2v-8h-2zm-8 12V12L2 22h10zm8 0h2v-2h-2v2z"/>',
	'signal_cellular_connected_no_internet_2_bar' : '<path fill-opacity=".3" d="M22 8V2L2 22h16V8z"/><path d="M14 22V10L2 22h12zm6-12v8h2v-8h-2zm0 12h2v-2h-2v2z"/>',
	'signal_cellular_connected_no_internet_3_bar' : '<path fill-opacity=".3" d="M22 8V2L2 22h16V8z"/><path d="M17 22V7L2 22h15zm3-12v8h2v-8h-2zm0 12h2v-2h-2v2z"/>',
	'signal_cellular_0_bar' : '<path fill-opacity=".3" d="M2 22h20V2z"/>',
	'signal_cellular_1_bar' : '<path fill-opacity=".3" d="M2 22h20V2z"/><path d="M12 12L2 22h10z"/>',
	'signal_cellular_2_bar' : '<path fill-opacity=".3" d="M2 22h20V2z"/><path d="M14 10L2 22h12z"/>',
	'signal_cellular_3_bar' : '<path fill-opacity=".3" d="M2 22h20V2z"/><path d="M17 7L2 22h15z"/>',
	'now_wallpaper' : '<path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4z"/><path d="M10 13l-4 5h12l-3-4-2.03 2.71L10 13z"/><path d="M17 8.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5z"/><path d="M20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2z"/><path d="M20 20h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7z"/><path d="M4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z"/>',
	'now_widgets' : '<path d="M13 13v8h8v-8h-8z"/><path d="M3 21h8v-8H3v8z"/><path d="M3 3v8h8V3H3z"/><path d="M16.66 1.69L11 7.34 16.66 13l5.66-5.66-5.66-5.65z"/>',
	'battery_20' : '<path d="M7 17v3.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V17H7z"/><path fill-opacity=".3" d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V17h10V5.33z"/>',
	'battery_30' : '<path fill-opacity=".3" d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V15h10V5.33z"/><path d="M7 15v5.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V15H7z"/>',
	'battery_50' : '<path fill-opacity=".3" d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V13h10V5.33z"/><path d="M7 13v7.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V13H7z"/>',
	'battery_60' : '<path fill-opacity=".3" d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V11h10V5.33z"/><path d="M7 11v9.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V11H7z"/>',
	'battery_80' : '<path fill-opacity=".3" d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V9h10V5.33z"/><path d="M7 9v11.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V9H7z"/>',
	'battery_90' : '<path fill-opacity=".3" d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V8h10V5.33z"/><path d="M7 8v12.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V8H7z"/>',
	'battery_alert' : '<path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 18h-2v-2h2v2zm0-4h-2V9h2v5z"/>',
	'battery_charging_20' : '<path d="M11 20v-3H7v3.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V17h-4.4L11 20z"/><path fill-opacity=".3" d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V17h4v-2.5H9L13 7v5.5h2L12.6 17H17V5.33C17 4.6 16.4 4 15.67 4z"/>',
	'battery_charging_30' : '<path fill-opacity=".3" d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v9.17h2L13 7v5.5h2l-1.07 2H17V5.33C17 4.6 16.4 4 15.67 4z"/><path d="M11 20v-5.5H7v6.17C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V14.5h-3.07L11 20z"/>',
	'battery_charging_50' : '<path d="M14.47 13.5L11 20v-5.5H9l.53-1H7v7.17C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V13.5h-2.53z"/><path fill-opacity=".3" d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v8.17h2.53L13 7v5.5h2l-.53 1H17V5.33C17 4.6 16.4 4 15.67 4z"/>',
	'battery_charging_60' : '<path fill-opacity=".3" d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V11h3.87L13 7v4h4V5.33C17 4.6 16.4 4 15.67 4z"/><path d="M13 12.5h2L11 20v-5.5H9l1.87-3.5H7v9.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V11h-4v1.5z"/>',
	'battery_charging_80' : '<path fill-opacity=".3" d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V9h4.93L13 7v2h4V5.33C17 4.6 16.4 4 15.67 4z"/><path d="M13 12.5h2L11 20v-5.5H9L11.93 9H7v11.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V9h-4v3.5z"/>',
	'battery_charging_90' : '<path fill-opacity=".3" d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V8h5.47L13 7v1h4V5.33C17 4.6 16.4 4 15.67 4z"/><path d="M13 12.5h2L11 20v-5.5H9L12.47 8H7v12.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V8h-4v4.5z"/>',
	'account_child' : '<circle cx="12" cy="13.49" r="1.5"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2.5c1.24 0 2.25 1.01 2.25 2.25S13.24 9 12 9 9.75 7.99 9.75 6.75 10.76 4.5 12 4.5zm5 10.56v2.5c-.45.41-.96.77-1.5 1.05v-.68c0-.34-.17-.65-.46-.92-.65-.62-1.89-1.02-3.04-1.02-.96 0-1.96.28-2.65.73l-.17.12-.21.17c.78.47 1.63.72 2.54.82l1.33.15c.37.04.66.36.66.75 0 .29-.16.53-.4.66-.28.15-.64.09-.95.09-.35 0-.69-.01-1.03-.05-.5-.06-.99-.17-1.46-.33-.49-.16-.97-.38-1.42-.64-.22-.13-.44-.27-.65-.43l-.31-.24c-.04-.02-.28-.18-.28-.23v-4.28c0-1.58 2.63-2.78 5-2.78s5 1.2 5 2.78v1.78z"/>',
	'-' : '',

	/*
	 * Google Material Design Icons
	 * (https://www.google.com/design/icons)
	 */
	//
	// action
	//
	'_title3' : 'Action',
	'3d_rotation' : '<path d="M7.52 21.48C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z"/><path d="M16.57 12.2c0 .42-.05.79-.14 1.13-.1.33-.24.62-.43.85-.19.23-.43.41-.71.53-.29.12-.62.18-.99.18h-.91V9.12h.97c.72 0 1.27.23 1.64.69.38.46.57 1.12.57 1.99v.4zm.39-3.16c-.32-.33-.7-.59-1.14-.77-.43-.18-.92-.27-1.46-.27H12v8h2.3c.55 0 1.06-.09 1.51-.27.45-.18.84-.43 1.16-.76.32-.33.57-.73.74-1.19.17-.47.26-.99.26-1.57v-.4c0-.58-.09-1.1-.26-1.57-.18-.47-.43-.87-.75-1.2zm-8.55 5.92c-.19 0-.37-.03-.52-.08-.16-.06-.29-.13-.4-.24-.11-.1-.2-.22-.26-.37-.06-.14-.09-.3-.09-.47h-1.3c0 .36.07.68.21.95.14.27.33.5.56.69.24.18.51.32.82.41.3.1.62.15.96.15.37 0 .72-.05 1.03-.15.32-.1.6-.25.83-.44.23-.19.42-.43.55-.72.13-.29.2-.61.2-.97 0-.19-.02-.38-.07-.56-.05-.18-.12-.35-.23-.51-.1-.16-.24-.3-.4-.43-.17-.13-.37-.23-.61-.31.2-.09.37-.2.52-.33.15-.13.27-.27.37-.42.1-.15.17-.3.22-.46.05-.16.07-.32.07-.48 0-.36-.06-.68-.18-.96-.12-.28-.29-.51-.51-.69-.2-.19-.47-.33-.77-.43C9.1 8.05 8.76 8 8.39 8c-.36 0-.69.05-1 .16-.3.11-.57.26-.79.45-.21.19-.38.41-.51.67-.12.26-.18.54-.18.85h1.3c0-.17.03-.32.09-.45s.14-.25.25-.34c.11-.09.23-.17.38-.22.15-.05.3-.08.48-.08.4 0 .7.1.89.31.19.2.29.49.29.86 0 .18-.03.34-.08.49-.05.15-.14.27-.25.37-.11.1-.25.18-.41.24-.16.06-.36.09-.58.09H7.5v1.03h.77c.22 0 .42.02.6.07s.33.13.45.23c.12.11.22.24.29.4.07.16.1.35.1.57 0 .41-.12.72-.35.93-.23.23-.55.33-.95.33z"/><path d="M12 0l-.66.03 3.81 3.81 1.33-1.33c3.27 1.55 5.61 4.72 5.96 8.48h1.5C23.44 4.84 18.29 0 12 0z"/>',
	'accessibility' : '<path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/><path d="M21 9h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>',
	'accessible' : '<circle cx="12" cy="4" r="2"/><path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01H13c-.35-.2-.75-.3-1.19-.26C10.76 7.11 10 8.04 10 9.09V15c0 1.1.9 2 2 2h5v5h2v-5.5c0-1.1-.9-2-2-2h-3v-3.45c1.29 1.07 3.25 1.94 5 1.95zm-6.17 5c-.41 1.16-1.52 2-2.83 2-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V12.1c-2.28.46-4 2.48-4 4.9 0 2.76 2.24 5 5 5 2.42 0 4.44-1.72 4.9-4h-2.07z"/>',
	'account_balance' : '<path d="M4 10v7h3v-7H4z"/><path d="M10 10v7h3v-7h-3z"/><path d="M2 22h19v-3H2v3z"/><path d="M16 10v7h3v-7h-3z"/><path d="M11.5 1L2 6v2h19V6l-9.5-5z"/>',
	'account_balance_wallet' : '<path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9z"/><path d="M16 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 16h10V8H12v8z"/>',
	'account_box' : '<path d="M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z"/>',
	'account_circle' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>',
	'add_shopping_cart' : '<path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3z"/><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z"/><path d="M17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/><path d="M7.17 14.75l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/>',
	'alarm' : '<path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>',
	'alarm_add' : '<path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><path d="M13 9h-2v3H8v2h3v3h2v-3h3v-2h-3V9z"/>',
	'alarm_off' : '<path d="M12 6c3.87 0 7 3.13 7 7 0 .84-.16 1.65-.43 2.4l1.52 1.52c.58-1.19.91-2.51.91-3.92a9 9 0 0 0-9-9c-1.41 0-2.73.33-3.92.91L9.6 6.43C10.35 6.16 11.16 6 12 6z"/><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M16.47 18.39C15.26 19.39 13.7 20 12 20c-3.87 0-7-3.13-7-7 0-1.7.61-3.26 1.61-4.47l9.86 9.86zM2.92 2.29L1.65 3.57 2.98 4.9l-1.11.93 1.42 1.42 1.11-.94.8.8A8.964 8.964 0 0 0 3 13c0 4.97 4.02 9 9 9 2.25 0 4.31-.83 5.89-2.2l2.2 2.2 1.27-1.27L3.89 3.27l-.97-.98z"/><path d="M8.02 3.28L6.6 1.86l-.86.71 1.42 1.42.86-.71z"/>',
	'alarm_on' : '<path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><path d="M10.54 14.53L8.41 12.4l-1.06 1.06 3.18 3.18 6-6-1.06-1.06-4.93 4.95z"/>',
	'all_out' : '<path d="M16.21 4.16l4 4v-4z"/><path d="M20.21 16.16l-4 4h4z"/><path d="M8.21 20.16l-4-4v4z"/><path d="M4.21 8.16l4-4h-4z"/><path d="M16.06 16.01a5.438 5.438 0 0 1-7.7 0 5.438 5.438 0 0 1 0-7.7 5.438 5.438 0 0 1 7.7 0 5.438 5.438 0 0 1 0 7.7zm1.1-8.8a7.007 7.007 0 0 0-9.9 0 7.007 7.007 0 0 0 0 9.9 7.007 7.007 0 0 0 9.9 0c2.73-2.73 2.73-7.16 0-9.9z"/>',
	'android' : '<path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10z"/><path d="M3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8z"/><path d="M20.5 8c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5z"/><path d="M15 5h-1V4h1v1zm-5 0H9V4h1v1zm5.53-2.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84z"/>',
	'announcement' : '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>',
	'aspect_ratio' : '<path d="M19 12h-2v3h-3v2h5v-5z"/><path d="M7 9h3V7H5v5h2V9z"/><path d="M21 19.01H3V4.99h18v14.02zM21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
	'assessment' : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>',
	'assignment' : '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>',
	'assignment_ind' : '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"/>',
	'assignment_late' : '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 15h-2v-2h2v2zm0-4h-2V8h2v6zm-1-9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>',
	'assignment_return' : '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 12h-4v3l-5-5 5-5v3h4v4z"/>',
	'assignment_returned' : '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 15l-5-5h3V9h4v4h3l-5 5z"/>',
	'assignment_turned_in' : '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>',
	'autorenew' : '<path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6z"/><path d="M18.76 7.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>',
	'backup' : '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>',
	'book' : '<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>',
	'bookmark' : '<path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>',
	'bookmark_outline' : '<path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>',
	'bug_report' : '<path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z"/>',
	'build' : '<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>',
	'cached' : '<path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4z"/><path d="M6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>',
	'camera_enhanced' : '<path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/> <path d="M12 17l1.25-2.75L16 13l-2.75-1.25L12 9l-1.25 2.75L8 13l2.75 1.25z"/>',
	'card_giftcard' : '<path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>',
	'card_membership' : '<path d="M20 2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h4v5l4-2 4 2v-5h4c1.11 0 2-.89 2-2V4c0-1.11-.89-2-2-2zm0 13H4v-2h16v2zm0-5H4V4h16v6z"/>',
	'card_travel' : '<path d="M20 6h-3V4c0-1.11-.89-2-2-2H9c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4h6v2H9V4zm11 15H4v-2h16v2zm0-5H4V8h3v2h2V8h6v2h2V8h3v6z"/>',
	'change_history' : '<path d="M12 7.77L18.39 18H5.61L12 7.77M12 4L2 20h20L12 4z"/>',
	'check_circle' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
	'chrome_reader_mode' : '<path d="M13 12h7v1.5h-7z"/><path d="M13 9.5h7V11h-7z"/><path d="M13 14.5h7V16h-7z"/><path d="M21 19h-9V6h9v13zm0-15H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>',
	'class' : '<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>',
	'code' : '<path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4z"/><path d="M14.6 16.6l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>',
	'compare_arrows' : '<path d="M9.01 14H2v2h7.01v3L13 15l-3.99-4v3z"/><path d="M14.99 13v-3H22V8h-7.01V5L11 9l3.99 4z"/>',
	'copyright' : '<path d="M10.08 10.86c.05-.33.16-.62.3-.87.14-.25.34-.46.59-.62.24-.15.54-.22.91-.23.23.01.44.05.63.13.2.09.38.21.52.36s.25.33.34.53c.09.2.13.42.14.64h1.79c-.02-.47-.11-.9-.28-1.29-.17-.39-.4-.73-.7-1.01-.3-.28-.66-.5-1.08-.66-.42-.16-.88-.23-1.39-.23-.65 0-1.22.11-1.7.34-.48.23-.88.53-1.2.92-.32.39-.56.84-.71 1.36-.15.52-.24 1.06-.24 1.64v.27c0 .58.08 1.12.23 1.64.15.52.39.97.71 1.35.32.38.72.69 1.2.91.48.22 1.05.34 1.7.34.47 0 .91-.08 1.32-.23.41-.15.77-.36 1.08-.63.31-.27.56-.58.74-.94.18-.36.29-.74.3-1.15h-1.79c-.01.21-.06.4-.15.58-.09.18-.21.33-.36.46s-.32.23-.52.3c-.19.07-.39.09-.6.1-.36-.01-.66-.08-.89-.23a1.75 1.75 0 0 1-.59-.62c-.14-.25-.25-.55-.3-.88a6.74 6.74 0 0 1-.08-1v-.27c0-.35.03-.68.08-1.01z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
	'credit_card' : '<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>',
	'dashboard' : '<path d="M3 13h8V3H3v10z"/><path d="M3 21h8v-6H3v6z"/><path d="M13 21h8V11h-8v10z"/><path d="M13 3v6h8V3h-8z"/>',
	'date_range' : '<path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>',
	'delete' : '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>',
	'delete_forever' : '<path d="M8.46 11.88l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/><path d="M15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>',
	'description' : '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>',
	'dns' : '<path d="M7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm13-6H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z"/><path d="M7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm13-6H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"/>',
	'done' : '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
	'done_all' : '<path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7z"/><path d="M22.24 5.59L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41z"/><path d="M.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>',
	'donut_large' : '<path d="M11 5.08V2c-5 .5-9 4.81-9 10s4 9.5 9 10v-3.08c-3-.48-6-3.4-6-6.92s3-6.44 6-6.92z"/><path d="M18.97 11H22c-.47-5-4-8.53-9-9v3.08C16 5.51 18.54 8 18.97 11z"/><path d="M13 18.92V22c5-.47 8.53-4 9-9h-3.03c-.43 3-2.97 5.49-5.97 5.92z"/>',
	'donut_small' : '<path d="M11 9.16V2c-5 .5-9 4.79-9 10s4 9.5 9 10v-7.16c-1-.41-2-1.52-2-2.84 0-1.32 1-2.43 2-2.84z"/><path d="M14.86 11H22c-.48-4.75-4-8.53-9-9v7.16c1 .3 1.52.98 1.86 1.84z"/><path d="M13 14.84V22c5-.47 8.52-4.25 9-9h-7.14c-.34.86-.86 1.54-1.86 1.84z"/>',
	'eject' : '<path d="M5 17h14v2H5z"/><path d="M12 5L5.33 15h13.34z"/>',
	'euro_symbol' : '<path d="M15 18.5c-2.51 0-4.68-1.42-5.76-3.5H15v-2H8.58c-.05-.33-.08-.66-.08-1s.03-.67.08-1H15V9H9.24C10.32 6.92 12.5 5.5 15 5.5c1.61 0 3.09.59 4.23 1.57L21 5.3C19.41 3.87 17.3 3 15 3c-3.92 0-7.24 2.51-8.48 6H3v2h3.06c-.04.33-.06.66-.06 1 0 .34.02.67.06 1H3v2h3.52c1.24 3.49 4.56 6 8.48 6 2.31 0 4.41-.87 6-2.3l-1.78-1.77c-1.13.98-2.6 1.57-4.22 1.57z"/>',
	'event' : '<path d="M17 12h-5v5h5v-5z"/><path d="M19 19H5V8h14v11zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2z"/>',
	'event_seat' : '<path d="M4 18v3h3v-3h10v3h3v-6H4z"/><path d="M19 10h3v3h-3z"/><path d="M2 10h3v3H2z"/><path d="M17 13H7V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v8z"/>',
	'exit_to_app' : '<path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59z"/><path d="M19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
	'explore' : '<path d="M12 10.9c-.61 0-1.1.49-1.1 1.1 0 .61.49 1.1 1.1 1.1.61 0 1.1-.49 1.1-1.1 0-.61-.49-1.1-1.1-1.1z"/><path d="M14.19 14.19L6 18l3.81-8.19L18 6l-3.81 8.19zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
	'extension' : '<path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/>',
	'face' : '<path d="M14.69 17.1c-.74.58-1.7.9-2.69.9s-1.95-.32-2.69-.9c-.22-.17-.53-.13-.7.09-.17.22-.13.53.09.7.91.72 2.09 1.11 3.3 1.11s2.39-.39 3.31-1.1c.22-.17.26-.48.09-.7-.17-.23-.49-.26-.71-.1z"/><path d="M19.96 14.82c-1.09 3.74-4.27 6.46-8.04 6.46-3.78 0-6.96-2.72-8.04-6.47-1.19-.11-2.13-1.18-2.13-2.52 0-1.27.85-2.31 1.97-2.5 2.09-1.46 3.8-3.49 4.09-5.05v-.01c1.35 2.63 6.3 5.19 11.83 5.06l.3-.03c1.28 0 2.31 1.14 2.31 2.54 0 1.38-1.02 2.51-2.29 2.52zM12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z"/><path d="M16.5 12.5c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm-7 0c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1z"/>',
	'favorite' : '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
	'favorite_border' : '<path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>',
	'feedback' : '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>',
	'find_in_page' : '<path d="M20 19.59V8l-6-6H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c.45 0 .85-.15 1.19-.4l-4.43-4.43c-.8.52-1.74.83-2.76.83-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5c0 1.02-.31 1.96-.83 2.75L20 19.59z"/><path d="M9 13c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3z"/>',
	'find_replace' : '<path d="M11 6c1.38 0 2.63.56 3.54 1.46L12 10h6V4l-2.05 2.05C14.68 4.78 12.93 4 11 4c-3.53 0-6.43 2.61-6.92 6H6.1c.46-2.28 2.48-4 4.9-4z"/><path d="M16.64 15.14c.66-.9 1.12-1.97 1.28-3.14H15.9c-.46 2.28-2.48 4-4.9 4-1.38 0-2.63-.56-3.54-1.46L10 12H4v6l2.05-2.05C7.32 17.22 9.07 18 11 18c1.55 0 2.98-.51 4.14-1.36L20 21.49 21.49 20l-4.85-4.86z"/>',
	'fingerprint' : '<path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2a.506.506 0 0 1 .2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67a.49.49 0 0 1-.44.28z"/><path d="M3.5 9.72a.499.499 0 0 1-.41-.79c.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25a.5.5 0 0 1-.12.7c-.23.16-.54.11-.7-.12a9.388 9.388 0 0 0-3.39-2.94c-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21z"/><path d="M9.75 21.79a.47.47 0 0 1-.35-.15c-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15z"/><path d="M16.92 19.94c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12z"/><path d="M14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1a7.297 7.297 0 0 1-2.17-5.22c0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29a11.14 11.14 0 0 1-.73-3.96c0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94-1.7 0-3.08-1.32-3.08-2.94 0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z"/>',
	'flight_land' : '<path d="M2.5 19h19v2h-19z"/><path d="M9.68 13.27l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-5.31-1.42-2.76-9.02L10.12 2v8.28L5.15 8.95l-.93-2.32-1.45-.39v5.17l1.6.43 5.31 1.43z"/>',
	'flight_takeoff' : '<path d="M2.5 19h19v2h-19z"/><path d="M22.07 9.64c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 1.82 3.16.77 1.33 1.6-.43 5.31-1.42 4.35-1.16L21 11.49c.81-.23 1.28-1.05 1.07-1.85z"/>',
	'flip_to_back' : '<path d="M9 7H7v2h2V7z"/><path d="M9 11H7v2h2v-2z"/><path d="M9 3a2 2 0 0 0-2 2h2V3z"/><path d="M13 15h-2v2h2v-2z"/><path d="M19 3v2h2c0-1.1-.9-2-2-2z"/><path d="M13 3h-2v2h2V3z"/><path d="M9 17v-2H7a2 2 0 0 0 2 2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 9h2V7h-2v2z"/><path d="M19 17c1.1 0 2-.9 2-2h-2v2z"/><path d="M5 7H3v12a2 2 0 0 0 2 2h12v-2H5V7z"/><path d="M15 5h2V3h-2v2z"/><path d="M15 17h2v-2h-2v2z"/>',
	'flip_to_front' : '<path d="M3 13h2v-2H3v2z"/><path d="M3 17h2v-2H3v2z"/><path d="M5 21v-2H3a2 2 0 0 0 2 2z"/><path d="M3 9h2V7H3v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M19 15H9V5h10v10zm0-12H9a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M7 21h2v-2H7v2z"/>',
	'g_translate' : '<path d="M20 5h-9.12L10 2H4c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h7l1 3h8c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM7.17 14.59c-2.25 0-4.09-1.83-4.09-4.09s1.83-4.09 4.09-4.09c1.04 0 1.99.37 2.74 1.07l.07.06-1.23 1.18-.06-.05c-.29-.27-.78-.59-1.52-.59-1.31 0-2.38 1.09-2.38 2.42s1.07 2.42 2.38 2.42c1.37 0 1.96-.87 2.12-1.46H7.08V9.91h3.95l.01.07c.04.21.05.4.05.61 0 2.35-1.61 4-3.92 4zm6.03-1.71c.33.6.74 1.18 1.19 1.7l-.54.53-.65-2.23zm.77-.76h-.99l-.31-1.04h3.99s-.34 1.31-1.56 2.74c-.52-.62-.89-1.23-1.13-1.7zM21 20c0 .55-.45 1-1 1h-7l2-2-.81-2.77.92-.92L17.79 18l.73-.73-2.71-2.68c.9-1.03 1.6-2.25 1.92-3.51H19v-1.04h-3.64V9h-1.04v1.04h-1.96L11.18 6H20c.55 0 1 .45 1 1v13z"/>',
	'gavel' : '<path d="M1 21h12v2H1z"/><path d="M5.245 8.07l2.83-2.827 14.14 14.142-2.828 2.828z"/><path d="M12.317 1l5.657 5.656-2.83 2.83-5.654-5.66z"/><path d="M3.825 9.485l5.657 5.657-2.828 2.828-5.657-5.657z"/>',
	'get_app' : '<path d="M19 9h-4V3H9v6H5l7 7 7-7z"/><path d="M5 18v2h14v-2H5z"/>',
	'gif' : '<path d="M11.5 9H13v6h-1.5z"/><path d="M9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1z"/><path d="M19 10.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z"/>',
	'grade' : '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
	'group_work' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8zm6.5 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
	'help' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>',
	'help_outline' : '<path d="M11 18h2v-2h-2v2z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>',
	'highlight_off' : '<path d="M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z"/>',
	'history' : '<path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><path d="M12 8v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>',
	'home' : '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
	'hourglass_empty' : '<path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"/>',
	'hourglass_full' : '<path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z"/>',
	'http' : '<path d="M4.5 11h-2V9H1v6h1.5v-2.5h2V15H6V9H4.5v2z"/><path d="M7 10.5h1.5V15H10v-4.5h1.5V9H7v1.5z"/><path d="M12.5 10.5H14V15h1.5v-4.5H17V9h-4.5v1.5z"/><path d="M21.5 11.5h-2v-1h2v1zm0-2.5H18v6h1.5v-2h2c.8 0 1.5-.7 1.5-1.5v-1c0-.8-.7-1.5-1.5-1.5z"/>',
	'https' : '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>',
	'important_devices' : '<path d="M23 20h-5v-7h5v7zm0-8.99L18 11c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-9c0-.55-.45-.99-1-.99z"/><path d="M20 2H2C.89 2 0 2.89 0 4v12a2 2 0 0 0 2 2h7v2H7v2h8v-2h-2v-2h2v-2H2V4h18v5h2V4a2 2 0 0 0-2-2z"/><path d="M11.97 9L11 6l-.97 3H7l2.47 1.76-.94 2.91 2.47-1.8 2.47 1.8-.94-2.91L15 9h-3.03z"/>',
	'info' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>',
	'info_outline' : '<path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M11 9h2V7h-2v2zm0 8h2v-6h-2v6z"/>',
	'input' : '<path d="M21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14c0-1.11-.9-2-2-2z"/><path d="M11 16l4-4-4-4v3H1v2h10v3z"/>',
	'invert_colors' : '<path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/>',
	'label' : '<path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/>',
	'label_outline' : '<path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z"/>',
	'language' : '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>',
	'launch' : '<path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7z"/><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>',
	'lightbulb_outline' : '<path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z"/><path d="M14.85 13.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1zM12 2C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>',
	'line_style' : '<path d="M3 16h5v-2H3v2z"/><path d="M9.5 16h5v-2h-5v2z"/><path d="M16 16h5v-2h-5v2z"/><path d="M3 20h2v-2H3v2z"/><path d="M7 20h2v-2H7v2z"/><path d="M11 20h2v-2h-2v2z"/><path d="M15 20h2v-2h-2v2z"/><path d="M19 20h2v-2h-2v2z"/><path d="M3 12h8v-2H3v2z"/><path d="M13 12h8v-2h-8v2z"/><path d="M3 4v4h18V4H3z"/>',
	'line_weight' : '<path d="M3 17h18v-2H3v2z"/><path d="M3 20h18v-1H3v1z"/><path d="M3 13h18v-3H3v3z"/><path d="M3 4v4h18V4H3z"/>',
	'list' : '<path d="M3 9h2V7H3v2zm0 8h2v-2H3v2zm0-4h2v-2H3v2z"/><path d="M7 13h14v-2H7v2z"/><path d="M7 17h14v-2H7v2z"/><path d="M7 7v2h14V7H7z"/>',
	'lock' : '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>',
	'lock_open' : '<path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/><path d="M18 20H6V10h12v10zm0-12h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>',
	'lock_outline' : '<path d="M18 20H6V10h12zM12 2.9c1.71 0 3.1 1.39 3.1 3.1v2H9V6l-.002-.008C8.998 4.282 10.29 2.9 12 2.9zM18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>',
	'loyalty' : '<path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7zm11.77 8.27L13 19.54l-4.27-4.27C8.28 14.81 8 14.19 8 13.5c0-1.38 1.12-2.5 2.5-2.5.69 0 1.32.28 1.77.74l.73.72.73-.73c.45-.45 1.08-.73 1.77-.73 1.38 0 2.5 1.12 2.5 2.5 0 .69-.28 1.32-.73 1.77z"/>',
	'markunread_mailbox' : '<path d="M20 6H10v6H8V4h6V0H6v6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>',
	'motorcycle' : '<path d="M19.44 9.03L15.41 5H11v2h3.59l2 2H5c-2.8 0-5 2.2-5 5s2.2 5 5 5c2.46 0 4.45-1.69 4.9-4h1.65l2.77-2.77c-.21.54-.32 1.14-.32 1.77 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.65-1.97-4.77-4.56-4.97zM7.82 15C7.4 16.15 6.28 17 5 17c-1.63 0-3-1.37-3-3s1.37-3 3-3c1.28 0 2.4.85 2.82 2H5v2h2.82zM19 17c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>',
	'note_add' : '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z"/>',
	'offline_pin' : '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5 16H7v-2h10v2zm-6.7-4L7 10.7l1.4-1.4 1.9 1.9 5.3-5.3L17 7.3 10.3 14z"/>',
	'opacity' : '<path d="M17.66 8L12 2.35 6.34 8C4.78 9.56 4 11.64 4 13.64s.78 4.11 2.34 5.67 3.61 2.35 5.66 2.35 4.1-.79 5.66-2.35S20 15.64 20 13.64 19.22 9.56 17.66 8zM6 14c.01-2 .62-3.27 1.76-4.4L12 5.27l4.24 4.38C17.38 10.77 17.99 12 18 14H6z"/>',
	'open_in_browser' : '<path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2z"/><path d="M12 10l-4 4h3v6h2v-6h3l-4-4z"/>',
	'open_in_new' : '<path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7z"/><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>',
	'open_with' : '<path d="M10 9h4V6h3l-5-5-5 5h3v3z"/><path d="M9 10H6V7l-5 5 5 5v-3h3v-4z"/><path d="M23 12l-5-5v3h-3v4h3v3l5-5z"/><path d="M14 15h-4v3H7l5 5 5-5h-3v-3z"/>',
	'pageview' : '<path d="M11 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/><path d="M17.59 19l-3.83-3.83c-.8.52-1.74.83-2.76.83-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5c0 1.02-.31 1.96-.83 2.75L19 17.59 17.59 19zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
	'pan_tool' : '<path d="M23 5.5V20c0 2.2-1.8 4-4 4h-7.3c-1.08 0-2.1-.43-2.85-1.19L1 14.83s1.26-1.23 1.3-1.25c.22-.19.49-.29.79-.29.22 0 .42.06.6.16.04.01 4.31 2.46 4.31 2.46V4c0-.83.67-1.5 1.5-1.5S11 3.17 11 4v7h1V1.5c0-.83.67-1.5 1.5-1.5S15 .67 15 1.5V11h1V2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11h1V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5z"/>',
	'payment' : '<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>',
	'perm_camera_mic' : '<path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v-2.09c-2.83-.48-5-2.94-5-5.91h2c0 2.21 1.79 4 4 4s4-1.79 4-4h2c0 2.97-2.17 5.43-5 5.91V21h7c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-6 8c0 1.1-.9 2-2 2s-2-.9-2-2V9c0-1.1.9-2 2-2s2 .9 2 2v4z"/>',
	'perm_contact_calendar' : '<path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1z"/>',
	'perm_data_setting' : '<path d="M18.99 11.5c.34 0 .67.03 1 .07L20 0 0 20h11.56c-.04-.33-.07-.66-.07-1 0-4.14 3.36-7.5 7.5-7.5z"/><path d="M18.99 20.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3.71-1.01c.02-.16.04-.32.04-.49 0-.17-.01-.33-.04-.49l1.06-.83c.09-.08.12-.21.06-.32l-1-1.73c-.06-.11-.19-.15-.31-.11l-1.24.5c-.26-.2-.54-.37-.85-.49l-.19-1.32c-.01-.12-.12-.21-.24-.21h-2c-.12 0-.23.09-.25.21l-.19 1.32c-.3.13-.59.29-.85.49l-1.24-.5c-.11-.04-.24 0-.31.11l-1 1.73c-.06.11-.04.24.06.32l1.06.83c-.02.16-.03.32-.03.49 0 .17.01.33.03.49l-1.06.83c-.09.08-.12.21-.06.32l1 1.73c.06.11.19.15.31.11l1.24-.5c.26.2.54.37.85.49l.19 1.32c.02.12.12.21.25.21h2c.12 0 .23-.09.25-.21l.19-1.32c.3-.13.59-.29.84-.49l1.25.5c.11.04.24 0 .31-.11l1-1.73c.06-.11.03-.24-.06-.32l-1.07-.83z"/>',
	'perm_device_information' : '<path d="M13 11h-2v6h2v-6zm0-4h-2v2h2V7z"/><path d="M17 19H7V5h10v14zm0-17.99L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99z"/>',
	'perm_identity' : '<path d="M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 1.9c1.16 0 2.1.94 2.1 2.1 0 1.16-.94 2.1-2.1 2.1-1.16 0-2.1-.94-2.1-2.1 0-1.16.94-2.1 2.1-2.1"/><path d="M12 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm0 1.9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1"/>',
	'perm_media' : '<path d="M2 6H0v5h.01L0 20c0 1.1.9 2 2 2h18v-2H2V6z"/><path d="M7 15l4.5-6 3.5 4.51 2.5-3.01L21 15H7zM22 4h-8l-2-2H6c-1.1 0-1.99.9-1.99 2L4 16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>',
	'perm_phone_msg' : '<path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/><path d="M12 3v10l3-3h6V3h-9z"/>',
	'perm_scan_wifi' : '<path d="M12 3C6.95 3 3.15 4.85 0 7.23L12 22 24 7.25C20.85 4.87 17.05 3 12 3zm1 13h-2v-6h2v6zm-2-8V6h2v2h-2z"/>',
	'pets' : '<circle cx="4.5" cy="9.5" r="2.5"/> <circle cx="9" cy="5.5" r="2.5"/> <circle cx="15" cy="5.5" r="2.5"/> <circle cx="19.5" cy="9.5" r="2.5"/> <path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.03 2.33 2.32.73.15 3.06-.44 5.54-.44h.18c2.48 0 4.81.58 5.54.44 1.31-.29 2.04-1.31 2.33-2.32.31-2.04-1.3-3.49-2.61-4.8z"/>',
	'picture_in_picture' : '<path d="M19 7h-8v6h8V7z"/><path d="M21 19.01H3V4.98h18v14.03zM21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2z"/>',
	'picture_in_picture_alt' : '<path d="M19 11h-8v6h8v-6z"/><path d="M21 19.02H3V4.97h18v14.05zm2-.02V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2z"/>',
	'play_for_work' : '<path d="M11 5v5.59H7.5l4.5 4.5 4.5-4.5H13V5h-2z"/><path d="M6 14c0 3.31 2.69 6 6 6s6-2.69 6-6h-2c0 2.21-1.79 4-4 4s-4-1.79-4-4H6z"/>',
	'polymer' : '<path d="M19 4h-4L7.11 16.63 4.5 12 9 4H5L.5 12 5 20h4l7.89-12.63L19.5 12 15 20h4l4.5-8z"/>',
	'power_settings_new' : '<path d="M13 3h-2v10h2V3z"/><path d="M17.83 5.17l-1.42 1.42A6.92 6.92 0 0 1 19 12c0 3.87-3.13 7-7 7A6.995 6.995 0 0 1 7.58 6.58L6.17 5.17A8.932 8.932 0 0 0 3 12a9 9 0 0 0 18 0c0-2.74-1.23-5.18-3.17-6.83z"/>',
	'pregnant_woman' : '<path d="M9 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm7 9c-.01-1.34-.83-2.51-2-3 0-1.66-1.34-3-3-3s-3 1.34-3 3v7h2v5h3v-5h3v-4z"/>',
	'print' : '<path d="M19 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-3 7H8v-5h8v5zm3-11H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3z"/><path d="M18 3H6v4h12V3z"/>',
	'query_builder' : '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>',
	'question_answer' : '<path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1z"/><path d="M17 12V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>',
	'receipt' : '<path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z"/>',
	'record_voice_over' : '<circle cx="9" cy="9" r="4"/><path d="M9 15c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7.76-9.64l-1.68 1.69c.84 1.18.84 2.71 0 3.89l1.68 1.69c2.02-2.02 2.02-5.07 0-7.27zM20.07 2l-1.63 1.63c2.77 3.02 2.77 7.56 0 10.74L20.07 16c3.9-3.89 3.91-9.95 0-14z"/>',
	'redeem' : '<path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>',
	'remove_shopping_cart' : '<path d="M7.42 15c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h2.36l2 2H7.42zm15.31 7.73L2.77 2.77 2 2l-.73-.73L0 2.54l4.39 4.39 2.21 4.66-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h7.46l1.38 1.38A1.997 1.997 0 0 0 17 22c.67 0 1.26-.33 1.62-.84L21.46 24l1.27-1.27z"/><path d="M15.55 13c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H6.54l9.01 9z"/><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z"/>',
	'reorder' : '<path d="M3 15h18v-2H3v2z"/><path d="M3 19h18v-2H3v2z"/><path d="M3 11h18V9H3v2z"/><path d="M3 5v2h18V5H3z"/>',
	'report_problem' : '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>',
	'restore' : '<path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><path d="M12 8v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>',
	'restore_page' : '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16c-2.05 0-3.81-1.24-4.58-3h1.71c.63.9 1.68 1.5 2.87 1.5 1.93 0 3.5-1.57 3.5-3.5S13.93 9.5 12 9.5c-1.35 0-2.52.78-3.1 1.9l1.6 1.6h-4V9l1.3 1.3C8.69 8.92 10.23 8 12 8c2.76 0 5 2.24 5 5s-2.24 5-5 5z"/>',
	'room' : '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
	'rounded_corner' : '<path d="M19 19h2v2h-2v-2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M3 13h2v-2H3v2z"/><path d="M3 17h2v-2H3v2z"/><path d="M3 9h2V7H3v2z"/><path d="M3 5h2V3H3v2z"/><path d="M7 5h2V3H7v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M3 21h2v-2H3v2z"/><path d="M21 8c0-2.76-2.24-5-5-5h-5v2h5c1.65 0 3 1.35 3 3v5h2V8z"/>',
	'rowing' : '<path d="M8.5 14.5L4 19l1.5 1.5L9 17h2l-2.5-2.5z"/><path d="M15 1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M21 21.01L18 24l-2.99-3.01V19.5l-7.1-7.09c-.31.05-.61.07-.91.07v-2.16c1.66.03 3.61-.87 4.67-2.04l1.4-1.55c.19-.21.43-.38.69-.5.29-.14.62-.23.96-.23h.03C15.99 6.01 17 7.02 17 8.26v5.75c0 .84-.35 1.61-.92 2.16l-3.58-3.58v-2.27c-.63.52-1.43 1.02-2.29 1.39L16.5 18H18l3 3.01z"/>',
	'schedule' : '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>',
	'search' : '<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>',
	'settings' : '<path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>',
	'settings_applications' : '<path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M17.25 12c0 .23-.02.46-.05.68l1.48 1.16c.13.11.17.3.08.45l-1.4 2.42c-.09.15-.27.21-.43.15l-1.74-.7c-.36.28-.76.51-1.18.69l-.26 1.85c-.03.17-.18.3-.35.3h-2.8c-.17 0-.32-.13-.35-.29l-.26-1.85c-.43-.18-.82-.41-1.18-.69l-1.74.7c-.16.06-.34 0-.43-.15l-1.4-2.42c-.09-.15-.05-.34.08-.45l1.48-1.16c-.03-.23-.05-.46-.05-.69 0-.23.02-.46.05-.68l-1.48-1.16c-.13-.11-.17-.3-.08-.45l1.4-2.42c.09-.15.27-.21.43-.15l1.74.7c.36-.28.76-.51 1.18-.69l.26-1.85c.03-.17.18-.3.35-.3h2.8c.17 0 .32.13.35.29l.26 1.85c.43.18.82.41 1.18.69l1.74-.7c.16-.06.34 0 .43.15l1.4 2.42c.09.15.05.34-.08.45l-1.48 1.16c.03.23.05.46.05.69zM19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2z"/>',
	'settings_backup_restore' : '<path d="M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z"/><path d="M12 3c-4.97 0-9 4.03-9 9H0l4 4 4-4H5c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.51 0-2.91-.49-4.06-1.3l-1.42 1.44C8.04 20.3 9.94 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>',
	'settings_bluetooth' : '<path d="M15 24h2v-2h-2v2zm-8 0h2v-2H7v2zm4 0h2v-2h-2v2z"/><path d="M14.88 14.29L13 16.17v-3.76l1.88 1.88zM13 3.83l1.88 1.88L13 7.59V3.83zm4.71 1.88L12 0h-1v7.59L6.41 3 5 4.41 10.59 10 5 15.59 6.41 17 11 12.41V20h1l5.71-5.71-4.3-4.29 4.3-4.29z"/>',
	'settings_brightness' : '<path d="M21 19.01H3V4.99h18v14.02zM21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M12 9c1.66 0 3 1.34 3 3s-1.34 3-3 3V9zm-4 7h2.5l1.5 1.5 1.5-1.5H16v-2.5l1.5-1.5-1.5-1.5V8h-2.5L12 6.5 10.5 8H8v2.5L6.5 12 8 13.5V16z"/>',
	'settings_cell' : '<path d="M15 24h2v-2h-2v2zm-4 0h2v-2h-2v2zm-4 0h2v-2H7v2z"/><path d="M16 16H8V4h8v12zM16 .01L8 0C6.9 0 6 .9 6 2v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V2c0-1.1-.9-1.99-2-1.99z"/>',
	'settings_ethernet' : '<path d="M7.77 6.76L6.23 5.48.82 12l5.41 6.52 1.54-1.28L3.42 12l4.35-5.24z"/><path d="M11 13h2v-2h-2v2zm6-2h-2v2h2v-2zM7 13h2v-2H7v2z"/><path d="M17.77 5.48l-1.54 1.28L20.58 12l-4.35 5.24 1.54 1.28L23.18 12l-5.41-6.52z"/>',
	'settings_input_antenna' : '<path d="M12 5c-3.87 0-7 3.13-7 7h2c0-2.76 2.24-5 5-5s5 2.24 5 5h2c0-3.87-3.13-7-7-7z"/><path d="M13 14.29c.88-.39 1.5-1.26 1.5-2.29 0-1.38-1.12-2.5-2.5-2.5S9.5 10.62 9.5 12c0 1.02.62 1.9 1.5 2.29v3.3L7.59 21 9 22.41l3-3 3 3L16.41 21 13 17.59v-3.3z"/><path d="M12 1C5.93 1 1 5.93 1 12h2c0-4.97 4.03-9 9-9s9 4.03 9 9h2c0-6.07-4.93-11-11-11z"/>',
	'settings_input_component' : '<path d="M1 16c0 1.3.84 2.4 2 2.82V23h2v-4.18C6.16 18.4 7 17.3 7 16v-2H1v2zM5 2c0-.55-.45-1-1-1s-1 .45-1 1v4H1v6h6V6H5V2z"/><path d="M13 2c0-.55-.45-1-1-1s-1 .45-1 1v4H9v6h6V6h-2V2zM9 16c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2H9v2z"/><path d="M17 16c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2h-6v2zm4-10V2c0-.55-.45-1-1-1s-1 .45-1 1v4h-2v6h6V6h-2z"/>',
	'settings_input_composite' : '<path d="M1 16c0 1.3.84 2.4 2 2.82V23h2v-4.18C6.16 18.4 7 17.3 7 16v-2H1v2zM5 2c0-.55-.45-1-1-1s-1 .45-1 1v4H1v6h6V6H5V2z"/><path d="M13 2c0-.55-.45-1-1-1s-1 .45-1 1v4H9v6h6V6h-2V2zM9 16c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2H9v2z"/><path d="M17 16c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2h-6v2zm4-10V2c0-.55-.45-1-1-1s-1 .45-1 1v4h-2v6h6V6h-2z"/>',
	'settings_input_hdmi' : '<path d="M18 7V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v3H5v6l3 6v3h8v-3l3-6V7h-1zM8 4h8v3h-2V5h-1v2h-2V5h-1v2H8V4z"/>',
	'settings_input_svideo' : '<path d="M15 6.5c0-.83-.67-1.5-1.5-1.5h-3C9.67 5 9 5.67 9 6.5S9.67 8 10.5 8h3c.83 0 1.5-.67 1.5-1.5z"/><path d="M8.5 15c-.83 0-1.5.67-1.5 1.5S7.67 18 8.5 18s1.5-.67 1.5-1.5S9.33 15 8.5 15zM8 11.5c0-.83-.67-1.5-1.5-1.5S5 10.67 5 11.5 5.67 13 6.5 13 8 12.33 8 11.5z"/><path d="M12 21c-4.96 0-9-4.04-9-9s4.04-9 9-9 9 4.04 9 9-4.04 9-9 9zm0-20C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1z"/><path d="M15.5 15c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm2-5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>',
	'settings_overscan' : '<path d="M14 16h-4l2.01 2.5L14 16zm-8-6l-2.5 2.01L6 14v-4zm12 0v4l2.5-1.99L18 10zm-5.99-4.5L10 8h4l-1.99-2.5z"/><path d="M21 19.01H3V4.99h18v14.02zM21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
	'settings_phone' : '<path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/><path d="M19 9v2h2V9h-2zm-2 0h-2v2h2V9zm-4 0h-2v2h2V9z"/>',
	'settings_power' : '<path d="M13 2h-2v10h2V2z"/><path d="M16.56 4.44l-1.45 1.45C16.84 6.94 18 8.83 18 11c0 3.31-2.69 6-6 6s-6-2.69-6-6c0-2.17 1.16-4.06 2.88-5.12L7.44 4.44C5.36 5.88 4 8.28 4 11c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2.72-1.36-5.12-3.44-6.56z"/><path d="M15 24h2v-2h-2v2zm-4 0h2v-2h-2v2zm-4 0h2v-2H7v2z"/>',
	'settings_remote' : '<path d="M12 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-6H9c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V10c0-.55-.45-1-1-1z"/><path d="M7.05 6.05l1.41 1.41C9.37 6.56 10.62 6 12 6s2.63.56 3.54 1.46l1.41-1.41C15.68 4.78 13.93 4 12 4c-1.93 0-3.68.78-4.95 2.05z"/><path d="M12 0C8.96 0 6.21 1.23 4.22 3.22l1.41 1.41C7.26 3.01 9.51 2 12 2s4.74 1.01 6.36 2.64l1.41-1.41C17.79 1.23 15.04 0 12 0z"/>',
	'settings_voice' : '<path d="M12 13c1.66 0 2.99-1.34 2.99-3L15 4c0-1.66-1.34-3-3-3S9 2.34 9 4v6c0 1.66 1.34 3 3 3z"/><path d="M15 24h2v-2h-2v2zm-4 0h2v-2h-2v2zm-4 0h2v-2H7v2z"/><path d="M19 10h-1.7c0 3-2.54 5.1-5.3 5.1S6.7 13 6.7 10H5c0 3.41 2.72 6.23 6 6.72V20h2v-3.28c3.28-.49 6-3.31 6-6.72z"/>',
	'shop' : '<path d="M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zM9 18V9l7.5 4L9 18z"/>',
	'shop_two' : '<path d="M3 9H1v11c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2H3V9z"/><path d="M12 15V8l5.5 3-5.5 4zm0-12h4v2h-4V3zm6 2V3c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H5v11c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5h-5z"/>',
	'shopping_basket' : '<path d="M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>',
	'shopping_cart' : '<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z"/><path d="M1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1z"/><path d="M17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>',
	'speaker_notes' : '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 14H6v-2h2v2zm0-3H6V9h2v2zm0-3H6V6h2v2zm7 6h-5v-2h5v2zm3-3h-8V9h8v2zm0-3h-8V6h8v2z"/>',
	'speaker_notes_off' : '<path d="M6 11V9l2 2H6zm2 3H6v-2h2v2zm2.54-3l-.54-.54L7.54 8 6 6.46 2.38 2.84 1.27 1.73 0 3l2.01 2.01L2 22l4-4h9l5.73 5.73L22 22.46 17.54 18l-7-7z"/><path d="M20 2H4.08L10 7.92V6h8v2h-7.92l1 1H18v2h-4.92l6.99 6.99C21.14 17.95 22 17.08 22 16V4c0-1.1-.9-2-2-2z"/>',
	'spellcheck' : '<path d="M6.43 11L8.5 5.48 10.57 11H6.43zm6.02 5h2.09L9.43 3H7.57L2.46 16h2.09l1.12-3h5.64l1.14 3z"/><path d="M21.59 11.59l-8.09 8.09L9.83 16l-1.41 1.41 5.09 5.09L23 13l-1.41-1.41z"/>',
	'star_rate' : '<path d="M12 14.3l3.71 2.7-1.42-4.36L18 10h-4.55L12 5.5 10.55 10H6l3.71 2.64L8.29 17z"/>',
	'stars' : '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/>',
	'store' : '<path d="M20 4H4v2h16V4z"/><path d="M12 18H6v-4h6v4zm9-4v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1z"/>',
	'subject' : '<path d="M14 17H4v2h10v-2z"/><path d="M20 9H4v2h16V9z"/><path d="M4 15h16v-2H4v2z"/><path d="M4 5v2h16V5H4z"/>',
	'supervisor_account' : '<path d="M16.5 12c1.38 0 2.49-1.12 2.49-2.5S17.88 7 16.5 7C15.12 7 14 8.12 14 9.5s1.12 2.5 2.5 2.5z"/><path d="M9 11c1.66 0 2.99-1.34 2.99-3S10.66 5 9 5C7.34 5 6 6.34 6 8s1.34 3 3 3z"/><path d="M16.5 14c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75z"/><path d="M9 13c-2.33 0-7 1.17-7 3.5V19h7v-2.25c0-.85.33-2.34 2.37-3.47C10.5 13.1 9.66 13 9 13z"/>',
	'swap_horiz' : '<path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3z"/><path d="M21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>',
	'swap_vert' : '<path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3z"/>',
	'swap_vertial_circle' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM6.5 9L10 5.5 13.5 9H11v4H9V9H6.5zm11 6L14 18.5 10.5 15H13v-4h2v4h2.5z"/>',
	'system_update_alt' : '<path d="M12 16.5l4-4h-3v-9h-2v9H8l4 4z"/><path d="M21 3.5h-6v1.99h6v14.03H3V5.49h6V3.5H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2z"/>',
	'tab' : '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h10v4h8v10z"/>',
	'tab_unselected' : '<path d="M1 9h2V7H1v2z"/><path d="M1 13h2v-2H1v2z"/><path d="M1 5h2V3c-1.1 0-2 .9-2 2z"/><path d="M9 21h2v-2H9v2z"/><path d="M1 17h2v-2H1v2z"/><path d="M3 21v-2H1c0 1.1.9 2 2 2z"/><path d="M21 3h-8v6h10V5c0-1.1-.9-2-2-2z"/><path d="M21 17h2v-2h-2v2z"/><path d="M9 5h2V3H9v2z"/><path d="M5 21h2v-2H5v2z"/><path d="M5 5h2V3H5v2z"/><path d="M21 21c1.1 0 2-.9 2-2h-2v2z"/><path d="M21 13h2v-2h-2v2z"/><path d="M13 21h2v-2h-2v2z"/><path d="M17 21h2v-2h-2v2z"/>',
	'theaters' : '<path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>',
	'thumb_down' : '<path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2z"/><path d="M19 3v12h4V3h-4z"/>',
	'thumb_up' : '<path d="M1 21h4V9H1v12z"/><path d="M23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/>',
	'thumbs_up_down' : '<path d="M12 6c0-.55-.45-1-1-1H5.82l.66-3.18.02-.23c0-.31-.13-.59-.33-.8L5.38 0 .44 4.94C.17 5.21 0 5.59 0 6v6.5c0 .83.67 1.5 1.5 1.5h6.75c.62 0 1.15-.38 1.38-.91l2.26-5.29c.07-.17.11-.36.11-.55V6z"/><path d="M22.5 10h-6.75c-.62 0-1.15.38-1.38.91l-2.26 5.29c-.07.17-.11.36-.11.55V18c0 .55.45 1 1 1h5.18l-.66 3.18-.02.24c0 .31.13.59.33.8l.79.78 4.94-4.94c.27-.27.44-.65.44-1.06v-6.5c0-.83-.67-1.5-1.5-1.5z"/>',
	'timeline' : '<path d="M23 8c0 1.1-.9 2-2 2-.18 0-.35-.02-.51-.07l-3.56 3.55c.05.16.07.34.07.52 0 1.1-.9 2-2 2s-2-.9-2-2c0-.18.02-.36.07-.52l-2.55-2.55c-.16.05-.34.07-.52.07s-.36-.02-.52-.07l-4.55 4.56c.05.16.07.33.07.51 0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.18 0 .35.02.51.07l4.56-4.55C8.02 9.36 8 9.18 8 9c0-1.1.9-2 2-2s2 .9 2 2c0 .18-.02.36-.07.52l2.55 2.55c.16-.05.34-.07.52-.07s.36.02.52.07l3.55-3.56C19.02 8.35 19 8.18 19 8c0-1.1.9-2 2-2s2 .9 2 2z"/>',
	'toc' : '<path d="M3 9h14V7H3v2z"/><path d="M3 13h14v-2H3v2z"/><path d="M3 17h14v-2H3v2z"/><path d="M19 13h2v-2h-2v2zm0-6v2h2V7h-2zm0 10h2v-2h-2v2z"/>',
	'today' : '<path d="M19 19H5V8h14v11zm0-16h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M7 10h5v5H7z"/>',
	'toll' : '<path d="M3 12c0-2.61 1.67-4.83 4-5.65V4.26C3.55 5.15 1 8.27 1 12s2.55 6.85 6 7.74v-2.09c-2.33-.82-4-3.04-4-5.65z"/>',
	'touch_app' : '<path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74z"/><path d="M18.84 15.87l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/>',
	'track_changes' : '<path d="M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.16 6.57 6 9.03 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.66-.67-3.16-1.76-4.24l-1.41 1.41C15.55 9.9 16 10.9 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-1.86 1.28-3.41 3-3.86v2.14c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V2h-1C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z"/>',
	'translate' : '<path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04z"/><path d="M15.88 17l1.62-4.33L19.12 17h-3.24zm2.62-7h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12z"/>',
	'trending_down' : '<path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/>',
	'trending_flat' : '<path d="M22 12l-4-4v3H3v2h15v3z"/>',
	'trending_up' : '<path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>',
	'turned_in' : '<path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>',
	'turned_in_not' : '<path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>',
	'update' : '<path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1a6.875 6.875 0 0 0 0 9.79 7.02 7.02 0 0 0 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58a8.987 8.987 0 0 1 12.65 0L21 3v7.12z"/><path d="M12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z"/>',
	'verified_user' : '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>',
	'view_agenda' : '<path d="M20 13H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z"/><path d="M20 3H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"/>',
	'view_array' : '<path d="M4 18h3V5H4v13z"/><path d="M18 5v13h3V5h-3z"/><path d="M8 18h9V5H8v13z"/>',
	'view_carousel' : '<path d="M7 19h10V4H7v15z"/><path d="M2 17h4V6H2v11z"/><path d="M18 6v11h4V6h-4z"/>',
	'view_column' : '<path d="M10 18h5V5h-5v13z"/><path d="M4 18h5V5H4v13z"/><path d="M16 5v13h5V5h-5z"/>',
	'view_day' : '<path d="M2 21h19v-3H2v3z"/><path d="M20 8H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z"/><path d="M2 3v3h19V3H2z"/>',
	'view_headline' : '<path d="M4 15h17v-2H4v2z"/><path d="M4 19h17v-2H4v2z"/><path d="M4 11h17V9H4v2z"/><path d="M4 5v2h17V5H4z"/>',
	'view_list' : '<path d="M4 14h4v-4H4v4z"/><path d="M4 19h4v-4H4v4z"/><path d="M4 9h4V5H4v4z"/><path d="M9 14h12v-4H9v4z"/><path d="M9 19h12v-4H9v4z"/><path d="M9 5v4h12V5H9z"/>',
	'view_module' : '<path d="M4 11h5V5H4v6z"/><path d="M4 18h5v-6H4v6z"/><path d="M10 18h5v-6h-5v6z"/><path d="M16 18h5v-6h-5v6z"/><path d="M10 11h5V5h-5v6z"/><path d="M16 5v6h5V5h-5z"/>',
	'view_quilt' : '<path d="M10 18h5v-6h-5v6z"/><path d="M4 18h5V5H4v13z"/><path d="M16 18h5v-6h-5v6z"/><path d="M10 5v6h11V5H10z"/>',
	'view_stream' : '<path d="M4 18h17v-6H4v6z"/><path d="M4 5v6h17V5H4z"/>',
	'view_week' : '<path d="M6 5H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"/><path d="M20 5h-3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"/><path d="M13 5h-3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"/>',
	'visibility' : '<path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/><path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>',
	'visibility_off' : '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7z"/><path d="M7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z"/><path d="M11.84 9.02l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>',
	'watch_later' : '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>',
	'work' : '<path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>',
	'youtube_searched_for' : '<path d="M17.01 14h-.8l-.27-.27c.98-1.14 1.57-2.61 1.57-4.23 0-3.59-2.91-6.5-6.5-6.5s-6.5 3-6.5 6.5H2l3.84 4 4.16-4H6.51C6.51 7 8.53 5 11.01 5s4.5 2.01 4.5 4.5c0 2.48-2.02 4.5-4.5 4.5-.65 0-1.26-.14-1.82-.38L7.71 15.1c.97.57 2.09.9 3.3.9 1.61 0 3.08-.59 4.22-1.57l.27.27v.79l5.01 4.99L22 19l-4.99-5z"/>',
	'zoom_in' : '<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>',
	'zoom_out' : '<path d="M9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm6 0h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"/><path d="M7 9h5v1H7z"/>',
	//
	// alert
	//
	'_title4' : 'Alert',
	'add_alert' : '<path d="M10.01 21.01c0 1.1.89 1.99 1.99 1.99s1.99-.89 1.99-1.99h-3.98zm8.87-4.19V11c0-3.25-2.25-5.97-5.29-6.69v-.72C13.59 2.71 12.88 2 12 2s-1.59.71-1.59 1.59v.72C7.37 5.03 5.12 7.75 5.12 11v5.82L3 18.94V20h18v-1.06l-2.12-2.12zM16 13.01h-3v3h-2v-3H8V11h3V8h2v3h3v2.01z"/>',
	'error' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
	'error_outline' : '<path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>',
	'warning' : '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>',
	//
	// av
	//
	'_title5' : 'AV',
	'add_to_queue' : '<path d="M21 17H3V5h18v12zm0-14H3c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2z"/><path d="M16 10v2h-3v3h-2v-3H8v-2h3V7h2v3h3z"/>',
	'airplay' : '<path d="M6 22h12l-6-6z"/><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
	'album' : '<path d="M12 16.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 11c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>',
	'art_track' : '<path d="M22 13h-8v-2h8v2z"/><path d="M22 7h-8v2h8V7z"/><path d="M14 17h8v-2h-8v2z"/><path d="M10.5 15l-2.25-3-1.75 2.26-1.25-1.51L3.5 15h7zM12 9v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2z"/>',
	'av_timer' : '<path d="M11 17c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1z"/><path d="M11 3v4h2V5.08c3.39.49 6 3.39 6 6.92 0 3.87-3.13 7-7 7s-7-3.13-7-7c0-1.68.59-3.22 1.58-4.42L12 13l1.41-1.41-6.8-6.8v.02C4.42 6.45 3 9.05 3 12c0 4.97 4.02 9 9 9 4.97 0 9-4.03 9-9s-4.03-9-9-9h-1z"/><path d="M18 12c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1z"/><path d="M6 12c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1z"/>',
	'branding_watermark' : '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16h-9v-6h9v6z"/>',
	'call_to_action' : '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3v-3h18v3z"/>',
	'closed_caption' : '<path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"/>',
	'equalizer' : '<path d="M10 20h4V4h-4v16z"/><path d="M4 20h4v-8H4v8z"/><path d="M16 9v11h4V9h-4z"/>',
	'explicit' : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h4v2h-4v2h4v2H9V7h6v2z"/>',
	'fast_forward' : '<path d="M4 18l8.5-6L4 6v12z"/><path d="M13 6v12l8.5-6L13 6z"/>',
	'fast_rewind' : '<path d="M11 18V6l-8.5 6 8.5 6z"/><path d="M11.5 12l8.5 6V6l-8.5 6z"/>',
	'featured_play_list' : '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 8H3V9h9v2zm0-4H3V5h9v2z"/>',
	'featured_video' : '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 9H3V5h9v7z"/>',
	'fibre_dvr' : '<path d="M17.5 10.5h2v1h-2zm-13 0h2v3h-2zM21 3H3c-1.11 0-2 .89-2 2v14c0 1.1.89 2 2 2h18c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zM8 13.5c0 .85-.65 1.5-1.5 1.5H3V9h3.5c.85 0 1.5.65 1.5 1.5v3zm4.62 1.5h-1.5L9.37 9h1.5l1 3.43 1-3.43h1.5l-1.75 6zM21 11.5c0 .6-.4 1.15-.9 1.4L21 15h-1.5l-.85-2H17.5v2H16V9h3.5c.85 0 1.5.65 1.5 1.5v1z"/>',
	'fiber_manual_record' : '<circle cx="12" cy="12" r="8"/>',
	'fibre_new' : '<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM8.5 15H7.3l-2.55-3.5V15H3.5V9h1.25l2.5 3.5V9H8.5v6zm5-4.74H11v1.12h2.5v1.26H11v1.11h2.5V15h-4V9h4v1.26zm7 3.74c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1V9h1.25v4.51h1.13V9.99h1.25v3.51h1.12V9h1.25v5z"/>',
	'fibre_pin' : '<path d="M5.5 10.5h2v1h-2zM20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM9 11.5c0 .85-.65 1.5-1.5 1.5h-2v2H4V9h3.5c.85 0 1.5.65 1.5 1.5v1zm3.5 3.5H11V9h1.5v6zm7.5 0h-1.2l-2.55-3.5V15H15V9h1.25l2.5 3.5V9H20v6z"/>',
	'fibre_smart_record' : '<path d="M17 4.26v2.09c2.33.82 4 3.04 4 5.65s-1.67 4.83-4 5.65v2.09c3.45-.89 6-4.01 6-7.74s-2.55-6.85-6-7.74z"/>',
	'forward_10' : '<path d="M4 13c0 4.4 3.6 8 8 8s8-3.6 8-8h-2c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6v4l5-5-5-5v4c-4.4 0-8 3.6-8 8z"/><path d="M10.8 16H10v-3.3L9 13v-.7l1.8-.6h.1V16z"/><path d="M14.3 13.4v-.5s-.1-.2-.1-.3c0-.1-.1-.1-.2-.2s-.2-.1-.3-.1c-.1 0-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3c0 .1.1.1.2.2s.2.1.3.1c.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5zm.8.8c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1c-.2 0-.4 0-.6-.1-.2-.1-.3-.2-.5-.3-.2-.1-.2-.3-.3-.6-.1-.3-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1c.2 0 .4 0 .6.1.2.1.3.2.5.3.2.1.2.3.3.6.1.3.1.5.1.8v.7z"/>',
	'forward_30' : '<path d="M9.6 13.5h.4c.2 0 .4-.1.5-.2.1-.1.2-.2.2-.4v-.2s-.1-.1-.1-.2-.1-.1-.2-.1h-.5s-.1.1-.2.1-.1.1-.1.2v.2h-1c0-.2 0-.3.1-.5s.2-.3.3-.4c.1-.1.3-.2.4-.2.1 0 .4-.1.5-.1.2 0 .4 0 .6.1.2.1.3.1.5.2s.2.2.3.4c.1.2.1.3.1.5v.3s-.1.2-.1.3c0 .1-.1.2-.2.2s-.2.1-.3.2c.2.1.4.2.5.4.1.2.2.4.2.6 0 .2 0 .4-.1.5-.1.1-.2.3-.3.4-.1.1-.3.2-.5.2s-.4.1-.6.1c-.2 0-.4 0-.5-.1-.1-.1-.3-.1-.5-.2s-.2-.2-.3-.4c-.1-.2-.1-.4-.1-.6h.8v.2s.1.1.1.2.1.1.2.1h.5s.1-.1.2-.1.1-.1.1-.2v-.5s-.1-.1-.1-.2-.1-.1-.2-.1h-.6v-.7z"/><path d="M14.4 13.4v-.5s-.1-.2-.1-.3c0-.1-.1-.1-.2-.2s-.2-.1-.3-.1c-.1 0-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3c0 .1.1.1.2.2s.2.1.3.1c.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5zm.9.8c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1c-.2 0-.4 0-.6-.1-.2-.1-.3-.2-.5-.3-.2-.1-.2-.3-.3-.6-.1-.3-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1c.2 0 .4 0 .6.1.2.1.3.2.5.3.2.1.2.3.3.6.1.3.1.5.1.8v.7z"/><path d="M4 13c0 4.4 3.6 8 8 8s8-3.6 8-8h-2c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6v4l5-5-5-5v4c-4.4 0-8 3.6-8 8z"/>',
	'forward_5' : '<path d="M4 13c0 4.4 3.6 8 8 8s8-3.6 8-8h-2c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6v4l5-5-5-5v4c-4.4 0-8 3.6-8 8z"/><path d="M10.7 13.9l.2-2.2h2.4v.7h-1.7l-.1.9s.1 0 .1-.1.1 0 .1-.1.1 0 .2 0h.2c.2 0 .4 0 .5.1.1.1.3.2.4.3.1.1.2.3.3.5.1.2.1.4.1.6 0 .2 0 .4-.1.5-.1.1-.1.3-.3.5-.2.2-.3.2-.5.3-.2.1-.4.1-.6.1-.2 0-.4 0-.5-.1-.1-.1-.3-.1-.5-.2s-.2-.2-.3-.4c-.1-.2-.1-.3-.1-.5h.8c0 .2.1.3.2.4.1.1.2.1.4.1.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-.6l-.1-.2-.2-.2s-.2-.1-.3-.1h-.2s-.1 0-.2.1-.1 0-.1.1-.1.1-.1.1h-.6z"/>',
	'games' : '<path d="M15 7.5V2H9v5.5l3 3 3-3z"/><path d="M7.5 9H2v6h5.5l3-3-3-3z"/><path d="M9 16.5V22h6v-5.5l-3-3-3 3z"/><path d="M16.5 9l-3 3 3 3H22V9h-5.5z"/>',
	'hd' : '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 12H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11v6zm2-6h4c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1h-4V9zm1.5 4.5h2v-3h-2v3z"/>',
	'hearing' : '<path d="M17 20c-.29 0-.56-.06-.76-.15-.71-.37-1.21-.88-1.71-2.38-.51-1.56-1.47-2.29-2.39-3-.79-.61-1.61-1.24-2.32-2.53C9.29 10.98 9 9.93 9 9c0-2.8 2.2-5 5-5s5 2.2 5 5h2c0-3.93-3.07-7-7-7S7 5.07 7 9c0 1.26.38 2.65 1.07 3.9.91 1.65 1.98 2.48 2.85 3.15.81.62 1.39 1.07 1.71 2.05.6 1.82 1.37 2.84 2.73 3.55.51.23 1.07.35 1.64.35 2.21 0 4-1.79 4-4h-2c0 1.1-.9 2-2 2z"/><path d="M7.64 2.64L6.22 1.22C4.23 3.21 3 5.96 3 9s1.23 5.79 3.22 7.78l1.41-1.41C6.01 13.74 5 11.49 5 9s1.01-4.74 2.64-6.36z"/><path d="M11.5 9c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5z"/>',
	'high_quality' : '<path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 11H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11v6zm7-1c0 .55-.45 1-1 1h-.75v1.5h-1.5V15H14c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v4zm-3.5-.5h2v-3h-2v3z"/>',
	'my_library_add' : '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/><path d="M19 11h-4v4h-2v-4H9V9h4V5h2v4h4v2zm1-9H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
	'my_library_books' : '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/><path d="M19 7H9V5h10v2zm-4 8H9v-2h6v2zm4-4H9V9h10v2zm1-9H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
	'my_library_music' : '<path d="M18 7h-3v5.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zm2-5H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>',
	'loop' : '<path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8z"/><path d="M12 18c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>',
	'mic' : '<path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17.3 11c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>',
	'mic_none' : '<path d="M10.8 4.9c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2l-.01 6.2c0 .66-.53 1.2-1.19 1.2-.66 0-1.2-.54-1.2-1.2V4.9zM12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17.3 11c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>',
	'mic_off' : '<path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28z"/><path d="M14.98 11.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99z"/><path d="M4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>',
	'movie' : '<path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>',
	'music_video' : '<path d="M21 19H3V5h18v14zm0-16H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M8 15c0-1.66 1.34-3 3-3 .35 0 .69.07 1 .18V6h5v2h-3v7.03A3.003 3.003 0 0 1 11 18c-1.66 0-3-1.34-3-3z"/>',
	'new_releases' : '<path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-10 5h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
	'not_interested' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>',
	'note' : '<path d="M22 10l-6-6H4c-1.1 0-2 .9-2 2v12.01c0 1.1.9 1.99 2 1.99l16-.01c1.1 0 2-.89 2-1.99v-8zm-7-4.5l5.5 5.5H15V5.5z"/>',
	'pause' : '<path d="M6 19h4V5H6v14z"/><path d="M14 5v14h4V5h-4z"/>',
	'pause_circle_filled' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>',
	'pause_circle_outline' : '<path d="M9 16h2V8H9v8z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M13 16h2V8h-2v8z"/>',
	'play_arrow' : '<path d="M8 5v14l11-7z"/>',
	'play_circle_fill' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>',
	'play_circle_outline' : '<path d="M10 16.5l6-4.5-6-4.5v9z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
	'playlist_add' : '<path d="M14 10H2v2h12v-2z"/><path d="M14 6H2v2h12V6z"/><path d="M18 14v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z"/><path d="M2 16h8v-2H2v2z"/>',
	'playlist_add_check' : '<path d="M14 10H2v2h12v-2z"/><path d="M14 6H2v2h12V6z"/><path d="M2 16h8v-2H2v2z"/><path d="M21.5 11.5L23 13l-6.99 7-4.51-4.5L13 14l3.01 3 5.49-5.5z"/>',
	'playlist_play' : '<path d="M19 9H2v2h17V9z"/><path d="M19 5H2v2h17V5z"/><path d="M2 15h13v-2H2v2z"/><path d="M17 13v6l5-3-5-3z"/>',
	'queue' : '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/><path d="M19 11h-4v4h-2v-4H9V9h4V5h2v4h4v2zm1-9H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
	'queue_music' : '<path d="M15 6H3v2h12V6z"/><path d="M15 10H3v2h12v-2z"/><path d="M3 16h8v-2H3v2z"/><path d="M17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>',
	'queue_play_next' : '<path d="M21 3H3c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h5v2h8v-2h2v-2H3V5h18v8h2V5a2 2 0 0 0-2-2z"/><path d="M13 10V7h-2v3H8v2h3v3h2v-3h3v-2h-3z"/><path d="M24 18l-4.5 4.5L18 21l3-3-3-3 1.5-1.5L24 18z"/>',
	'radio' : '<path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.89 2 2 2h16c1.11 0 2-.9 2-2V8c0-1.11-.89-2-2-2H8.3l8.26-3.34L15.88 1 3.24 6.15zM7 20c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-8h-2v-2h-2v2H4V8h16v4z"/>',
	'recent_actors' : '<path d="M17 19h2V5h-2v14zm4-14v14h2V5h-2z"/><path d="M12.5 17h-9v-.75c0-1.5 3-2.25 4.5-2.25s4.5.75 4.5 2.25V17zM8 7.75c1.24 0 2.25 1.01 2.25 2.25S9.24 12.25 8 12.25 5.75 11.24 5.75 10 6.76 7.75 8 7.75zM14 5H2c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"/>',
	'remove_from_queue' : '<path d="M21 17H3V5h18v12zm0-14H3c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2z"/><path d="M16 10v2H8v-2h8z"/>',
	'repeat' : '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7z"/><path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>',
	'repeat_one' : '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7z"/><path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/><path d="M13 15V9h-1l-2 1v1h1.5v4H13z"/>',
	'replay' : '<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>',
	'replay_10' : '<path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/><path d="M10.9 16H10v-3.3L9 13v-.7l1.8-.6h.1V16z"/><path d="M14.3 13.4v-.5s-.1-.2-.1-.3c0-.1-.1-.1-.2-.2s-.2-.1-.3-.1c-.1 0-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3c0 .1.1.1.2.2s.2.1.3.1c.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5zm.9.8c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1c-.2 0-.4 0-.6-.1-.2-.1-.3-.2-.5-.3-.2-.1-.2-.3-.3-.6-.1-.3-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1c.2 0 .4 0 .6.1.2.1.3.2.5.3.2.1.2.3.3.6.1.3.1.5.1.8v.7z"/>',
	'replay_30' : '<path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/><path d="M9.6 13.5h.4c.2 0 .4-.1.5-.2.1-.1.2-.2.2-.4v-.2s-.1-.1-.1-.2-.1-.1-.2-.1h-.5s-.1.1-.2.1-.1.1-.1.2v.2h-1c0-.2 0-.3.1-.5s.2-.3.3-.4c.1-.1.3-.2.4-.2.1 0 .4-.1.5-.1.2 0 .4 0 .6.1.2.1.3.1.5.2s.2.2.3.4c.1.2.1.3.1.5v.3s-.1.2-.1.3c0 .1-.1.2-.2.2s-.2.1-.3.2c.2.1.4.2.5.4.1.2.2.4.2.6 0 .2 0 .4-.1.5-.1.1-.2.3-.3.4-.1.1-.3.2-.5.2s-.4.1-.6.1c-.2 0-.4 0-.5-.1-.1-.1-.3-.1-.5-.2s-.2-.2-.3-.4c-.1-.2-.1-.4-.1-.6h.8v.2s.1.1.1.2.1.1.2.1h.5s.1-.1.2-.1.1-.1.1-.2v-.5s-.1-.1-.1-.2-.1-.1-.2-.1h-.6v-.7z"/><path d="M14.5 13.4v-.5c0-.1-.1-.2-.1-.3 0-.1-.1-.1-.2-.2s-.2-.1-.3-.1c-.1 0-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3c0 .1.1.1.2.2s.2.1.3.1c.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5zm.8.8c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1c-.2 0-.4 0-.6-.1-.2-.1-.3-.2-.5-.3-.2-.1-.2-.3-.3-.6-.1-.3-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1c.2 0 .4 0 .6.1.2.1.3.2.5.3.2.1.2.3.3.6.1.3.1.5.1.8v.7z"/>',
	'replay_5' : '<path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/><path d="M10.7 13.9l.2-2.2h2.4v.7h-1.7l-.1.9s.1 0 .1-.1.1 0 .1-.1.1 0 .2 0h.2c.2 0 .4 0 .5.1.1.1.3.2.4.3.1.1.2.3.3.5.1.2.1.4.1.6 0 .2 0 .4-.1.5-.1.1-.1.3-.3.5-.2.2-.3.2-.4.3-.1.1-.4.1-.6.1-.2 0-.4 0-.5-.1-.1-.1-.3-.1-.5-.2s-.2-.2-.3-.4c-.1-.2-.1-.3-.1-.5h.8c0 .2.1.3.2.4.1.1.2.1.4.1.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-.6l-.1-.2-.2-.2s-.2-.1-.3-.1h-.2s-.1 0-.2.1-.1 0-.1.1-.1.1-.1.1h-.7z"/>',
	'shuffle' : '<path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41z"/><path d="M14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5z"/><path d="M14.83 13.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>',
	'skip_next' : '<path d="M6 18l8.5-6L6 6v12z"/><path d="M16 6v12h2V6h-2z"/>',
	'skip_previous' : '<path d="M6 6h2v12H6z"/><path d="M9.5 12l8.5 6V6z"/>',
	'slow_motion_video' : '<path d="M13.05 9.79L10 7.5v9l3.05-2.29L16 12z"/><path d="M13.05 9.79L10 7.5v9l3.05-2.29L16 12z"/><path d="M13.05 9.79L10 7.5v9l3.05-2.29L16 12z"/><path d="M11 4.07V2.05c-2.01.2-3.84 1-5.32 2.21L7.1 5.69A7.941 7.941 0 0 1 11 4.07z"/><path d="M5.69 7.1L4.26 5.68A9.949 9.949 0 0 0 2.05 11h2.02c.18-1.46.76-2.79 1.62-3.9z"/><path d="M4.07 13H2.05c.2 2.01 1 3.84 2.21 5.32l1.43-1.43A7.868 7.868 0 0 1 4.07 13z"/><path d="M5.68 19.74A9.981 9.981 0 0 0 11 21.95v-2.02a7.941 7.941 0 0 1-3.9-1.62l-1.42 1.43z"/><path d="M22 12c0 5.16-3.92 9.42-8.95 9.95v-2.02C16.97 19.41 20 16.05 20 12s-3.03-7.41-6.95-7.93V2.05C18.08 2.58 22 6.84 22 12z"/>',
	'snooze' : '<path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><path d="M9 11h3.63L9 15.2V17h6v-2h-3.63L15 10.8V9H9v2z"/>',
	'sort_by_alpha' : '<path d="M14.94 4.66h-4.72l2.36-2.36z"/><path d="M10.25 19.37h4.66l-2.33 2.33z"/><path d="M4.97 13.64l1.94-5.18 1.94 5.18H4.97zM6.1 6.27L1.6 17.73h1.84l.92-2.45h5.11l.92 2.45h1.84L7.74 6.27H6.1z"/><path d="M15.73 16.14h6.12v1.59h-8.53v-1.29l5.92-8.56h-5.88v-1.6h8.3v1.26l-5.93 8.6z"/>',
	'stop' : '<path d="M6 6h12v12H6z"/>',
	'subscriptions' : '<path d="M20 8H4V6h16v2z"/><path d="M18 2H6v2h12V2z"/><path d="M16 16l-6-3.27v6.53L16 16zm6-4v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2z"/>',
	'subtitles' : '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"/>',
	'surround_sound' : '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7.76 16.24l-1.41 1.41C4.78 16.1 4 14.05 4 12c0-2.05.78-4.1 2.34-5.66l1.41 1.41C6.59 8.93 6 10.46 6 12s.59 3.07 1.76 4.24zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm5.66 1.66l-1.41-1.41C17.41 15.07 18 13.54 18 12s-.59-3.07-1.76-4.24l1.41-1.41C19.22 7.9 20 9.95 20 12c0 2.05-.78 4.1-2.34 5.66zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>',
	'video_call' : ' <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>',
	'video_label' : '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H3V5h18v11z"/>',
	'video_library' : '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/><path d="M12 14.5v-9l6 4.5-6 4.5zM20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
	'videocam' : '<path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>',
	'videocam_off' : '<path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5z"/><path d="M3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>',
	'volume_down' : '<path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/><path d="M5 9v6h4l5 5V4L9 9H5z"/>',
	'volume_mute' : '<path d="M7 9v6h4l5 5V4l-5 5H7z"/>',
	'volume_off' : '<path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63z"/><path d="M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71z"/><path d="M4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3z"/><path d="M12 4L9.91 6.09 12 8.18V4z"/>',
	'volume_up' : '<path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"/>',
	'web' : '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>',
	'web_asset' : '<path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm0 14H5V8h14v10z" />',
	//
	// communication
	//
	'_title6' : 'Communication',
	'business' : '<path d="M20 19h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zM10 7H8V5h2v2zm0 4H8V9h2v2zm0 4H8v-2h2v2zm0 4H8v-2h2v2zM6 7H4V5h2v2zm0 4H4V9h2v2zm0 4H4v-2h2v2zm0 4H4v-2h2v2zm6-12V3H2v18h20V7H12z"/><path d="M18 11h-2v2h2v-2z"/><path d="M18 15h-2v2h2v-2z"/>',
	'call' : '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>',
	'call_end' : '<path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>',
	'call_made' : '<path d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z"/>',
	'call_merge' : '<path d="M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41z"/><path d="M7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z"/>',
	'call_missed' : '<path d="M19.59 7L12 14.59 6.41 9H11V7H3v8h2v-4.59l7 7 9-9z"/>',
	'call_missed_outgoing' : '<path d="M3 8.41l9 9 7-7V15h2V7h-8v2h4.59L12 14.59 4.41 7 3 8.41z"/>',
	'call_received' : '<path d="M20 5.41L18.59 4 7 15.59V9H5v10h10v-2H8.41z"/>',
	'call_split' : '<path d="M14 4l2.29 2.29-2.88 2.88 1.42 1.42 2.88-2.88L20 10V4z"/><path d="M10 4H4v6l2.29-2.29 4.71 4.7V20h2v-8.41l-5.29-5.3z"/>',
	'chat' : '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>',
	'chat_bubble' : '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
	'chat_bubble_outline' : '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>',
	'clear_all' : '<path d="M5 13h14v-2H5v2z"/><path d="M3 17h14v-2H3v2z"/><path d="M7 7v2h14V7H7z"/>',
	'comment' : '<path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>',
	'contact_mail' : '<path d="M21 8V7l-3 2-3-2v1l3 2 3-2zm1-5H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 1.99-.9 1.99-2L24 5c0-1.1-.9-2-2-2zM8 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H2v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1zm8-6h-8V6h8v6z"/>',
	'contact_phone' : '<path d="M22 3H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 1.99-.9 1.99-2L24 5c0-1.1-.9-2-2-2zM8 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H2v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1zm3.85-4h1.64L21 16l-1.99 1.99c-1.31-.98-2.28-2.38-2.73-3.99-.18-.64-.28-1.31-.28-2s.1-1.36.28-2c.45-1.62 1.42-3.01 2.73-3.99L21 8l-1.51 2h-1.64c-.22.63-.35 1.3-.35 2s.13 1.37.35 2z"/>',
	'contacts' : '<path d="M20 0H4v2h16V0z"/><path d="M4 24h16v-2H4v2z"/><path d="M17 17H7v-1.5c0-1.67 3.33-2.5 5-2.5s5 .83 5 2.5V17zM12 6.75c1.24 0 2.25 1.01 2.25 2.25s-1.01 2.25-2.25 2.25S9.75 10.24 9.75 9 10.76 6.75 12 6.75zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>',
	'dialer_sip' : '<path d="M20 5h-1V4h1v1zm-2-2v5h1V6h2V3h-3zm-3 2h-2V4h2V3h-3v3h2v1h-2v1h3V5zm2-2h-1v5h1V3z"/><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.01.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.27-.26.35-.65.24-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>',
	'dialpad' : '<path d="M12 19c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M6 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M18 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/><path d="M12 1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>',
	'email' : '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
	'forum' : '<path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1z"/><path d="M17 12V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>',
	'import_contacts' : '<path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>',
	'import_export' : '<path d="M9 3L5 6.99h3V14h2V6.99h3L9 3z"/><path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/>',
	'invert_colors_off' : '<path d="M12 19.59c-1.6 0-3.11-.62-4.24-1.76A5.945 5.945 0 0 1 6 13.59c0-1.32.43-2.57 1.21-3.6L12 14.77v4.82zm8.65 1.28l-2.35-2.35-6.3-6.29-3.56-3.57-1.42-1.41L4.27 4.5 3 5.77l2.78 2.78a8.005 8.005 0 0 0 .56 10.69A7.98 7.98 0 0 0 12 21.58c1.79 0 3.57-.59 5.03-1.78l2.7 2.7L21 21.23l-.35-.36z"/><path d="M12 5.1v4.58l7.25 7.26c1.37-2.96.84-6.57-1.6-9.01L12 2.27l-3.7 3.7 1.41 1.41L12 5.1z"/>',
	'live_help' : '<path d="M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 16h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>',
	'location_off' : '<path d="M12 6.5A2.5 2.5 0 0 1 14.5 9c0 .74-.33 1.39-.83 1.85l3.63 3.63c.98-1.86 1.7-3.8 1.7-5.48 0-3.87-3.13-7-7-7a7 7 0 0 0-5.04 2.15l3.19 3.19c.46-.52 1.11-.84 1.85-.84z"/><path d="M16.37 16.1l-4.63-4.63-.11-.11L3.27 3 2 4.27l3.18 3.18C5.07 7.95 5 8.47 5 9c0 5.25 7 13 7 13s1.67-1.85 3.38-4.35L18.73 21 20 19.73l-3.63-3.63z"/>',
	'location_on' : '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
	'mail_outline' : '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>',
	'message' : '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>',
	'no_sim' : '<path d="M18.99 5c0-1.1-.89-2-1.99-2h-7L7.66 5.34 19 16.68 18.99 5z"/><path d="M3.65 3.88L2.38 5.15 5 7.77V19c0 1.1.9 2 2 2h10.01c.35 0 .67-.1.96-.26l1.88 1.88 1.27-1.27L3.65 3.88z"/>',
	'phone' : '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>',
	'phonelink_erase' : '<path d="M13 8.2l-1-1-4 4-4-4-1 1 4 4-4 4 1 1 4-4 4 4 1-1-4-4 4-4zM19 1H9c-1.1 0-2 .9-2 2v3h2V4h10v16H9v-2H7v3c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
	'phonelink_lock' : '<path d="M19 1H9c-1.1 0-2 .9-2 2v3h2V4h10v16H9v-2H7v3c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-8.2 10V9.5C10.8 8.1 9.4 7 8 7S5.2 8.1 5.2 9.5V11c-.6 0-1.2.6-1.2 1.2v3.5c0 .7.6 1.3 1.2 1.3h5.5c.7 0 1.3-.6 1.3-1.2v-3.5c0-.7-.6-1.3-1.2-1.3zm-1.3 0h-3V9.5c0-.8.7-1.3 1.5-1.3s1.5.5 1.5 1.3V11z"/>',
	'phonelink_ring' : '<path d="M20.1 7.7l-1 1c1.8 1.8 1.8 4.6 0 6.5l1 1c2.5-2.3 2.5-6.1 0-8.5zM18 9.8l-1 1c.5.7.5 1.6 0 2.3l1 1c1.2-1.2 1.2-3 0-4.3zM14 1H4c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 19H4V4h10v16z"/>',
	'phonelink_setup' : '<path d="M11.8 12.5v-1l1.1-.8c.1-.1.1-.2.1-.3l-1-1.7c-.1-.1-.2-.2-.3-.1l-1.3.4c-.3-.2-.6-.4-.9-.5l-.2-1.3c0-.1-.1-.2-.3-.2H7c-.1 0-.2.1-.3.2l-.2 1.3c-.3.1-.6.3-.9.5l-1.3-.5c-.1 0-.2 0-.3.1l-1 1.7c-.1.1 0 .2.1.3l1.1.8v1l-1.1.8c-.1.2-.1.3-.1.4l1 1.7c.1.1.2.2.3.1l1.4-.4c.3.2.6.4.9.5l.2 1.3c-.1.1.1.2.2.2h2c.1 0 .2-.1.3-.2l.2-1.3c.3-.1.6-.3.9-.5l1.3.5c.1 0 .2 0 .3-.1l1-1.7c.1-.1 0-.2-.1-.3l-1.1-.9zM8 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM19 1H9c-1.1 0-2 .9-2 2v3h2V4h10v16H9v-2H7v3c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
	'portable_wifi_off' : '<path d="M17.56 14.24c.28-.69.44-1.45.44-2.24 0-3.31-2.69-6-6-6-.79 0-1.55.16-2.24.44l1.62 1.62c.2-.03.41-.06.62-.06a3.999 3.999 0 0 1 3.95 4.63l1.61 1.61z"/><path d="M12 4c4.42 0 8 3.58 8 8 0 1.35-.35 2.62-.95 3.74l1.47 1.47A9.86 9.86 0 0 0 22 12c0-5.52-4.48-10-10-10-1.91 0-3.69.55-5.21 1.47l1.46 1.46C9.37 4.34 10.65 4 12 4z"/><path d="M3.27 2.5L2 3.77l2.1 2.1C2.79 7.57 2 9.69 2 12c0 3.7 2.01 6.92 4.99 8.65l1-1.73C5.61 17.53 4 14.96 4 12c0-1.76.57-3.38 1.53-4.69l1.43 1.44C6.36 9.68 6 10.8 6 12c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-.65.17-1.25.44-1.79l1.58 1.58L10 12c0 1.1.9 2 2 2l.21-.02.01.01 7.51 7.51L21 20.23 4.27 3.5l-1-1z"/>',
	'present_to_all' : '<path d="M21 19.02H3V4.98h18v14.04zM21 3H3c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h18c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2z"/><path d="M10 12H8l4-4 4 4h-2v4h-4v-4z"/>',
	'ring_volume' : '<path d="M23.71 16.67C20.66 13.78 16.54 12 12 12 7.46 12 3.34 13.78.29 16.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2.48 2.48c.18.18.43.29.71.29.27 0 .52-.11.7-.28.79-.74 1.69-1.36 2.66-1.85.33-.16.56-.5.56-.9v-3.1c1.45-.48 3-.73 4.6-.73 1.6 0 3.15.25 4.6.72v3.1c0 .39.23.74.56.9.98.49 1.87 1.12 2.66 1.85.18.18.43.28.7.28.28 0 .53-.11.71-.29l2.48-2.48c.18-.18.29-.43.29-.71 0-.27-.11-.52-.29-.7z"/><path d="M21.16 6.26l-1.41-1.41-3.56 3.55 1.41 1.41s3.45-3.52 3.56-3.55z"/><path d="M13 2h-2v5h2V2z"/><path d="M6.4 9.81L7.81 8.4 4.26 4.84 2.84 6.26c.11.03 3.56 3.55 3.56 3.55z"/>',
	'rss_feed' : '<path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56z"/><path d="M4 10.1v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>',
	'screen_share' : '<path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zm-7-3.53v-2.19c-2.78 0-4.61.85-6 2.72.56-2.67 2.11-5.33 6-5.87V7l4 3.73-4 3.74z"/>',
	'stay_current_landscape' : '<path d="M1.01 7L1 17c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H3c-1.1 0-1.99.9-1.99 2zM19 7v10H5V7h14z"/>',
	'stay_current_portrait' : '<path d="M17 1.01L7 1c-1.1 0-1.99.9-1.99 2v18c0 1.1.89 2 1.99 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>',
	'stay_primary_landscape' : '<path d="M1.01 7L1 17c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H3c-1.1 0-1.99.9-1.99 2zM19 7v10H5V7h14z"/>',
	'stay_primary_portrait' : '<path d="M17 1.01L7 1c-1.1 0-1.99.9-1.99 2v18c0 1.1.89 2 1.99 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>',
	'stop_screen_share' : '<path d="M21.22 18.02l2 2H24v-2h-2.78z"/><path d="M21.99 16.02l.01-10a2 2 0 0 0-2-2H7.22l5.23 5.23c.18-.04.36-.07.55-.1V7.02l4 3.73-1.58 1.47 5.54 5.54c.61-.33 1.03-.99 1.03-1.74z"/><path d="M7 15.02c.31-1.48.92-2.95 2.07-4.06l1.59 1.59c-1.54.38-2.7 1.18-3.66 2.47zM2.39 1.73L1.11 3l1.54 1.54c-.4.36-.65.89-.65 1.48v10a2 2 0 0 0 2 2H0v2h18.13l2.71 2.71 1.27-1.27L2.39 1.73z"/>',
	'swap_calls' : '<path d="M18 4l-4 4h3v7c0 1.1-.9 2-2 2s-2-.9-2-2V8c0-2.21-1.79-4-4-4S5 5.79 5 8v7H2l4 4 4-4H7V8c0-1.1.9-2 2-2s2 .9 2 2v7c0 2.21 1.79 4 4 4s4-1.79 4-4V8h3l-4-4z"/>',
	'textsms' : '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>',
	'voicemail' : '<path d="M18.5 6C15.46 6 13 8.46 13 11.5c0 1.33.47 2.55 1.26 3.5H9.74c.79-.95 1.26-2.17 1.26-3.5C11 8.46 8.54 6 5.5 6S0 8.46 0 11.5 2.46 17 5.5 17h13c3.04 0 5.5-2.46 5.5-5.5S21.54 6 18.5 6zm-13 9C3.57 15 2 13.43 2 11.5S3.57 8 5.5 8 9 9.57 9 11.5 7.43 15 5.5 15zm13 0c-1.93 0-3.5-1.57-3.5-3.5S16.57 8 18.5 8 22 9.57 22 11.5 20.43 15 18.5 15z"/>',
	'vpn_key' : '<path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>',
	//
	// content
	//
	'_title7' : 'Content',
	'add' : '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>',
	'add_box' : '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>',
	'add_circle' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>',
	'add_circle_outline' : '<path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
	'archive' : '<path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>',
	'backspace' : '<path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/>',
	'block' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>',
	'clear' : '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',
	'content_copy' : '<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z"/><path d="M19 21H8V7h11v14zm0-16H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/>',
	'content_cut' : '<path d="M12 12.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM6 20a2 2 0 1 1-.001-3.999A2 2 0 0 1 6 20zM6 8a2 2 0 1 1-.001-3.999A2 2 0 0 1 6 8zm3.64-.36c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64z"/><path d="M19 3l-6 6 2 2 7-7V3z"/>',
	'content_paste' : '<path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"/>',
	'create' : '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
	'delete_sweep' : '<path d="M15 16h4v2h-4z"/><path d="M15 8h7v2h-7z"/><path d="M15 12h6v2h-6z"/><path d="M3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10z"/><path d="M14 5h-3l-1-1H6L5 5H2v2h12z"/>',
	'drafts' : '<path d="M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z"/>',
	'filter_list' : '<path d="M10 18h4v-2h-4v2z"/><path d="M3 6v2h18V6H3z"/><path d="M6 13h12v-2H6v2z"/>',
	'flag' : '<path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>',
	'font_download' : '<path d="M9.93 13.5h4.14L12 7.98z"/><path d="M15.95 18.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
	'forward' : '<path d="M12 8V4l8 8-8 8v-4H4V8z"/>',
	'gesture' : '<path d="M4.59 6.89c.7-.71 1.4-1.35 1.71-1.22.5.2 0 1.03-.3 1.52-.25.42-2.86 3.89-2.86 6.31 0 1.28.48 2.34 1.34 2.98.75.56 1.74.73 2.64.46 1.07-.31 1.95-1.4 3.06-2.77 1.21-1.49 2.83-3.44 4.08-3.44 1.63 0 1.65 1.01 1.76 1.79-3.78.64-5.38 3.67-5.38 5.37 0 1.7 1.44 3.09 3.21 3.09 1.63 0 4.29-1.33 4.69-6.1H21v-2.5h-2.47c-.15-1.65-1.09-4.2-4.03-4.2-2.25 0-4.18 1.91-4.94 2.84-.58.73-2.06 2.48-2.29 2.72-.25.3-.68.84-1.11.84-.45 0-.72-.83-.36-1.92.35-1.09 1.4-2.86 1.85-3.52.78-1.14 1.3-1.92 1.3-3.28C8.95 3.69 7.31 3 6.44 3 5.12 3 3.97 4 3.72 4.25c-.36.36-.66.66-.88.93l1.75 1.71zm9.29 11.66c-.31 0-.74-.26-.74-.72 0-.6.73-2.2 2.87-2.76-.3 2.69-1.43 3.48-2.13 3.48z"/>',
	'inbox' : '<path d="M19 15h-4c0 1.66-1.34 3-3 3s-3-1.34-3-3H4.99V5H19v10zm0-12H4.99c-1.1 0-1.98.9-1.98 2L3 19c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M16 10h-2V7h-4v3H8l4 4 4-4z"/>',
	'link' : '<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1z"/><path d="M8 13h8v-2H8v2z"/><path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>',
	'low_priority' : '<path d="M14 5h8v2h-8z"/><path d="M14 10.5h8v2h-8z"/><path d="M14 16h8v2h-8z"/><path d="M2 11.5C2 15.08 4.92 18 8.5 18H9v2l3-3-3-3v2h-.5C6.02 16 4 13.98 4 11.5S6.02 7 8.5 7H12V5H8.5C4.92 5 2 7.92 2 11.5z"/>',
	'mail' : '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
	'markunread' : '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
	'move_to_inbox' : '<path d="M19 15h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10zm0-12H4.99c-1.11 0-1.98.9-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M16 10h-2V7h-4v3H8l4 4 4-4z"/>',
	'next_week' : '<path d="M20 7h-4V5c0-.55-.22-1.05-.59-1.41C15.05 3.22 14.55 3 14 3h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zm1 13.5l-1-1 3-3-3-3 1-1 4 4-4 4z"/>',
	'redo' : '<path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>',
	'remove' : '<path d="M19 13H5v-2h14v2z"/>',
	'remove_circle' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>',
	'remove_circle_outline' : '<path d="M7 11v2h10v-2H7z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
	'reply' : '<path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>',
	'reply_all' : '<path d="M7 8V5l-7 7 7 7v-3l-4-4 4-4z"/><path d="M13 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>',
	'report' : '<path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"/>',
	'save' : '<path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>',
	'select_all' : '<path d="M3 5h2V3c-1.1 0-2 .9-2 2z"/><path d="M3 13h2v-2H3v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M3 9h2V7H3v2z"/><path d="M13 3h-2v2h2V3z"/><path d="M19 3v2h2c0-1.1-.9-2-2-2z"/><path d="M5 21v-2H3c0 1.1.9 2 2 2z"/><path d="M3 17h2v-2H3v2z"/><path d="M9 3H7v2h2V3z"/><path d="M11 21h2v-2h-2v2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 21c1.1 0 2-.9 2-2h-2v2z"/><path d="M19 9h2V7h-2v2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M15 5h2V3h-2v2z"/><path d="M9 9h6v6H9V9zm-2 8h10V7H7v10z"/>',
	'send' : '<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>',
	'sort' : '<path d="M3 18h6v-2H3v2z"/><path d="M3 6v2h18V6H3z"/><path d="M3 13h12v-2H3v2z"/>',
	'text_format' : '<path d="M5 17v2h14v-2H5z"/><path d="M12 5.98L13.87 11h-3.74L12 5.98zM9.5 12.8h5l.9 2.2h2.1L12.75 4h-1.5L6.5 15h2.1l.9-2.2z"/>',
	'unarchive' : '<path d="M20.55 5.22l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.15.55L3.46 5.22C3.17 5.57 3 6.01 3 6.5V19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.49-.17-.93-.45-1.28zM12 9.5l5.5 5.5H14v2h-4v-2H6.5L12 9.5zM5.12 5l.82-1h12l.93 1H5.12z"/>',
	'undo' : '<path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>',
	'weekend' : '<path d="M21 10c-1.1 0-2 .9-2 2v3H5v-3c0-1.1-.9-2-2-2s-2 .9-2 2v5c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2z"/><path d="M18 5H6c-1.1 0-2 .9-2 2v2.15c1.16.41 2 1.51 2 2.82V14h12v-2.03c0-1.3.84-2.4 2-2.82V7c0-1.1-.9-2-2-2z"/>',
	//
	// device
	//
	'_title8' : 'Device',
	'access_alarms' : '<path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>',
	'access_alarm' : '<path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>',
	'access_time' : '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>',
	'add_alarm' : '<path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><path d="M13 9h-2v3H8v2h3v3h2v-3h3v-2h-3V9z"/>',
	'airplanemode_on' : '<path d="M10.18 9"/><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>',
	'airplanemode_inactive' : '<path d="M13 9V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v3.68l7.83 7.83L21 16v-2l-8-5z"/><path d="M3 5.27l4.99 4.99L2 14v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-3.73L18.73 21 20 19.73 4.27 4 3 5.27z"/>',
	'battery_charging_full' : '<path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 7v5.5h2L11 20z"/>',
	'battery_full' : '<path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>',
	'battery_std' : '<path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>',
	'battery_unknown' : '<path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zm-2.72 13.95h-1.9v-1.9h1.9v1.9zm1.35-5.26s-.38.42-.67.71c-.48.48-.83 1.15-.83 1.6h-1.6c0-.83.46-1.52.93-2l.93-.94c.27-.27.44-.65.44-1.06 0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5H9c0-1.66 1.34-3 3-3s3 1.34 3 3c0 .66-.27 1.26-.7 1.69z"/>',
	'bluetooth' : '<path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>',
	'bluetooth_connected' : '<path d="M14.88 16.29L13 18.17v-3.76l1.88 1.88zM13 5.83l1.88 1.88L13 9.59V5.83zm4.71 1.88L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29z"/><path d="M19 10l-2 2 2 2 2-2-2-2z"/><path d="M7 12l-2-2-2 2 2 2 2-2z"/>',
	'bluetooth_disabled' : '<path d="M13 5.83l1.88 1.88-1.6 1.6 1.41 1.41 3.02-3.02L12 2h-1v5.03l2 2v-3.2z"/><path d="M13 18.17v-3.76l1.88 1.88L13 18.17zM5.41 4L4 5.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l4.29-4.29 2.3 2.29L20 18.59 5.41 4z"/>',
	'bluetooth_searching' : '<path d="M14.24 12.01l2.32 2.32c.28-.72.44-1.51.44-2.33 0-.82-.16-1.59-.43-2.31l-2.33 2.32z"/><path d="M19.53 6.71l-1.26 1.26c.63 1.21.98 2.57.98 4.02 0 1.45-.36 2.82-.98 4.02l1.2 1.2c.97-1.54 1.54-3.36 1.54-5.31-.01-1.89-.55-3.67-1.48-5.19z"/><path d="M12.88 16.29L11 18.17v-3.76l1.88 1.88zM11 5.83l1.88 1.88L11 9.59V5.83zm4.71 1.88L10 2H9v7.59L4.41 5 3 6.41 8.59 12 3 17.59 4.41 19 9 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29z"/>',
	'brightness_auto' : '<path d="M10.85 12.65h2.3L12 9l-1.15 3.65zM20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM14.3 16l-.7-2h-3.2l-.7 2H7.8L11 7h2l3.2 9h-1.9z"/>',
	'brightness_high' : '<path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm8-9.31V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69z"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>',
	'brightness_low' : '<path d="M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>',
	'brightness_medium' : '<path d="M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z"/>',
	'data_usage' : '<path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95z"/><path d="M12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>',
	'developer_mode' : '<path d="M7 5h10v2h2V3c0-1.1-.9-1.99-2-1.99L7 1c-1.1 0-2 .9-2 2v4h2V5z"/><path d="M15.41 16.59L20 12l-4.59-4.59L14 8.83 17.17 12 14 15.17l1.41 1.42z"/><path d="M10 15.17L6.83 12 10 8.83 8.59 7.41 4 12l4.59 4.59L10 15.17z"/><path d="M17 19H7v-2H5v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4h-2v2z"/>',
	'devices' : '<path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6z"/><path d="M22 17h-4v-7h4v7zm1-9h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z"/>',
	'dvr' : '<path d="M21 17H3V5h18v12zm0-14H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2z"/><path d="M7 8H5v2h2V8zm12 0H8v2h11V8z"/><path d="M7 12H5v2h2v-2zm12 0H8v2h11v-2z"/>',
	'gps_fixed' : '<path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/><path d="M12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm8.94-8c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06z"/>',
	'gps_not_fixed' : '<path d="M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>',
	'gps_off' : '<path d="M20.94 11A8.994 8.994 0 0 0 13 3.06V1h-2v2.06c-1.13.12-2.19.46-3.16.97l1.5 1.5A6.995 6.995 0 0 1 19 12c0 .94-.19 1.84-.52 2.65l1.5 1.5c.5-.96.84-2.02.97-3.15H23v-2h-2.06z"/><path d="M16.27 17.54a6.995 6.995 0 0 1-9.81-9.81l9.81 9.81zM3 4.27l2.04 2.04A8.914 8.914 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06c1.77-.2 3.38-.91 4.69-1.98L19.73 21 21 19.73 4.27 3 3 4.27z"/>',
	'graphic_eq' : '<path d="M7 18h2V6H7v12z"/><path d="M11 22h2V2h-2v20z"/><path d="M3 14h2v-4H3v4z"/><path d="M15 18h2V6h-2v12z"/><path d="M19 10v4h2v-4h-2z"/>',
	'location_disabled' : '<path d="M20.94 11A8.994 8.994 0 0 0 13 3.06V1h-2v2.06c-1.13.12-2.19.46-3.16.97l1.5 1.5A6.995 6.995 0 0 1 19 12c0 .94-.19 1.84-.52 2.65l1.5 1.5c.5-.96.84-2.02.97-3.15H23v-2h-2.06z"/><path d="M16.27 17.54a6.995 6.995 0 0 1-9.81-9.81l9.81 9.81zM3 4.27l2.04 2.04A8.914 8.914 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06c1.77-.2 3.38-.91 4.69-1.98L19.73 21 21 19.73 4.27 3 3 4.27z"/>',
	'location_searching' : '<path d="M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>',
	'network_cell' : '<path fill-opacity=".3" d="M2 22h20V2z"/><path d="M17 7L2 22h15z"/>',
	'network_wifi' : '<path fill-opacity=".3" d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/><path d="M3.53 10.95l8.46 10.54.01.01.01-.01 8.46-10.54C20.04 10.62 16.81 8 12 8c-4.81 0-8.04 2.62-8.47 2.95z"/>',
	'nfc' : '<path d="M20 20H4V4h16v16zm0-18H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/><path d="M18 6h-5c-1.1 0-2 .9-2 2v2.28c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V8h3v8H8V8h2V6H6v12h12V6z"/>',
	'screen_lock_landscape' : '<path d="M19 17H5V7h14v10zm2-12H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/><path d="M10.8 10c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2v1h-2.4v-1zm-.8 6h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1v-1c0-1.11-.9-2-2-2-1.11 0-2 .9-2 2v1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1z"/>',
	'screen_lock_portrait' : '<path d="M10.8 10c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2v1h-2.4v-1zm-.8 6h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1v-1c0-1.11-.9-2-2-2-1.11 0-2 .9-2 2v1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1z"/><path d="M17 19H7V5h10v14zm0-18H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
	'screen_lock_rotation' : '<path d="M23.25 12.77l-2.57-2.57-1.41 1.41 2.22 2.22-5.66 5.66L4.51 8.17l5.66-5.66 2.1 2.1 1.41-1.41L11.23.75c-.59-.59-1.54-.59-2.12 0L2.75 7.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12z"/><path d="M8.47 20.48C5.2 18.94 2.86 15.76 2.5 12H1c.51 6.16 5.66 11 11.95 11l.66-.03-3.81-3.82-1.33 1.33z"/><path d="M16.8 2.5c0-.94.76-1.7 1.7-1.7s1.7.76 1.7 1.7V3h-3.4v-.5zM16 9h5c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1v-.5C21 1.12 19.88 0 18.5 0S16 1.12 16 2.5V3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1z"/>',
	'screen_rotation' : '<path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32z"/><path d="M14.83 21.19L2.81 9.17l6.36-6.36 12.02 12.02-6.36 6.36zm-4.6-19.44c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12L10.23 1.75z"/><path d="M7.52 21.48C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z"/>',
	'sd_storage' : '<path d="M18 2h-8L4.02 8 4 20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 6h-2V4h2v4zm3 0h-2V4h2v4zm3 0h-2V4h2v4z"/>',
	'settings_system_daydream' : '<path d="M9 16h6.5c1.38 0 2.5-1.12 2.5-2.5S16.88 11 15.5 11h-.05c-.24-1.69-1.69-3-3.45-3-1.4 0-2.6.83-3.16 2.02h-.16C7.17 10.18 6 11.45 6 13c0 1.66 1.34 3 3 3z"/><path d="M21 19.01H3V4.99h18v14.02zM21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
	'signal_cellular_4_bar' : '<path d="M2 22h20V2z"/>',
	'signal_cellular_connected_no_internet_4_bar' : '<path d="M20 18h2v-8h-2v8z"/><path d="M20 22h2v-2h-2v2z"/><path d="M2 22h16V8h4V2L2 22z"/>',
	'signal_cellular_no_sim' : '<path d="M18.99 5c0-1.1-.89-2-1.99-2h-7L7.66 5.34 19 16.68 18.99 5z"/><path d="M3.65 3.88L2.38 5.15 5 7.77V19c0 1.1.9 2 2 2h10.01c.35 0 .67-.1.96-.26l1.88 1.88 1.27-1.27L3.65 3.88z"/>',
	'signal_cellular_null' : '<path d="M20 6.83V20H6.83L20 6.83M22 2L2 22h20V2z"/>',
	'signal_cellular_off' : '<path d="M21 1l-8.59 8.59L21 18.18V1z"/><path d="M4.77 4.5L3.5 5.77l6.36 6.36L1 21h17.73l2 2L22 21.73 4.77 4.5z"/>',
	'signal_wifi_4_bar' : '<path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/>',
	'signal_wifi_4_bar_lock' : '<path d="M22 16h-3v-1.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V16zm1 0v-1.5c0-1.4-1.1-2.5-2.5-2.5S18 13.1 18 14.5V16c-.5 0-1 .5-1 1v4c0 .5.5 1 1 1h5c.5 0 1-.5 1-1v-4c0-.5-.5-1-1-1z"/><path d="M15.5 14.5c0-2.8 2.2-5 5-5 .4 0 .7 0 1 .1L23.6 7c-.4-.3-4.9-4-11.6-4C5.3 3 .8 6.7.4 7L12 21.5l3.5-4.4v-2.6z"/>',
	'signal_wifi_off' : '<path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7z"/><path d="M17.04 15.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z"/>',
	'storage' : '<path d="M4 17h2v2H4v-2zm-2 3h20v-4H2v4z"/><path d="M6 7H4V5h2v2zM2 4v4h20V4H2z"/><path d="M4 11h2v2H4v-2zm-2 3h20v-4H2v4z"/>',
	'usb' : '<path d="M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2-1.21 0-2.2.99-2.2 2.2 0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95 0 1.22.99 2.2 2.2 2.2 1.21 0 2.2-.98 2.2-2.2 0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2v-2h1V7h-4z"/>',
	'wallpaper' : '<path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4z"/><path d="M10 13l-4 5h12l-3-4-2.03 2.71L10 13z"/><path d="M17 8.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5z"/><path d="M20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2z"/><path d="M20 20h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7z"/><path d="M4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z"/>',
	'wifi_lock' : '<path d="M20.5 9.5c.28 0 .55.04.81.08L24 6c-3.34-2.51-7.5-4-12-4S3.34 3.49 0 6l12 16 3.5-4.67V14.5c0-2.76 2.24-5 5-5z"/><path d="M22 16h-3v-1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V16zm1 0v-1.5c0-1.38-1.12-2.5-2.5-2.5S18 13.12 18 14.5V16c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1z"/>',
	'wifi_tethering' : '<path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M18 13c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.48-.81 2.75-2 3.45l1 1.74c1.79-1.04 3-2.97 3-5.19z"/><path d="M12 3C6.48 3 2 7.48 2 13c0 3.7 2.01 6.92 4.99 8.65l1-1.73C5.61 18.53 4 15.96 4 13c0-4.42 3.58-8 8-8s8 3.58 8 8c0 2.96-1.61 5.53-4 6.92l1 1.73c2.99-1.73 5-4.95 5-8.65 0-5.52-4.48-10-10-10z"/>',
	//
	// editor
	//
	'_title9' : 'Editor',
	'attach_file' : '<path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>',
	'attach_money' : '<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>',
	'border_all' : '<path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z"/>',
	'border_bottom' : '<path d="M9 11H7v2h2v-2z"/><path d="M13 15h-2v2h2v-2z"/><path d="M9 3H7v2h2V3z"/><path d="M13 11h-2v2h2v-2z"/><path d="M5 3H3v2h2V3z"/><path d="M13 7h-2v2h2V7z"/><path d="M17 11h-2v2h2v-2z"/><path d="M13 3h-2v2h2V3z"/><path d="M17 3h-2v2h2V3z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M5 7H3v2h2V7z"/><path d="M19 3v2h2V3h-2z"/><path d="M19 9h2V7h-2v2z"/><path d="M5 11H3v2h2v-2z"/><path d="M3 21h18v-2H3v2z"/><path d="M5 15H3v2h2v-2z"/>',
	'border_clear' : '<path d="M7 5h2V3H7v2z"/><path d="M7 13h2v-2H7v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M11 17h2v-2h-2v2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M3 21h2v-2H3v2z"/><path d="M3 17h2v-2H3v2z"/><path d="M3 13h2v-2H3v2z"/><path d="M3 9h2V7H3v2z"/><path d="M3 5h2V3H3v2z"/><path d="M11 13h2v-2h-2v2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 21h2v-2h-2v2z"/><path d="M19 9h2V7h-2v2z"/><path d="M11 9h2V7h-2v2z"/><path d="M19 3v2h2V3h-2z"/><path d="M11 5h2V3h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M15 13h2v-2h-2v2z"/><path d="M15 5h2V3h-2v2z"/>',
	'border_color' : '<path d="M17.75 7L14 3.25l-10 10V17h3.75l10-10zm2.96-2.96c.39-.39.39-1.02 0-1.41L18.37.29c-.39-.39-1.02-.39-1.41 0L15 2.25 18.75 6l1.96-1.96z"/><path fill-opacity=".36" d="M0 20h24v4H0z"/>',
	'border_horizontal' : '<path d="M3 21h2v-2H3v2z"/><path d="M5 7H3v2h2V7z"/><path d="M3 17h2v-2H3v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M5 3H3v2h2V3z"/><path d="M9 3H7v2h2V3z"/><path d="M17 3h-2v2h2V3z"/><path d="M13 7h-2v2h2V7z"/><path d="M13 3h-2v2h2V3z"/><path d="M19 17h2v-2h-2v2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M3 13h18v-2H3v2z"/><path d="M19 3v2h2V3h-2z"/><path d="M19 9h2V7h-2v2z"/><path d="M11 17h2v-2h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M19 21h2v-2h-2v2z"/>',
	'border_inner' : '<path d="M3 21h2v-2H3v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M5 7H3v2h2V7z"/><path d="M3 17h2v-2H3v2z"/><path d="M9 3H7v2h2V3z"/><path d="M5 3H3v2h2V3z"/><path d="M17 3h-2v2h2V3z"/><path d="M19 9h2V7h-2v2z"/><path d="M19 3v2h2V3h-2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M13 3h-2v8H3v2h8v8h2v-8h8v-2h-8V3z"/><path d="M19 21h2v-2h-2v2z"/><path d="M19 17h2v-2h-2v2z"/>',
	'border_left' : '<path d="M11 21h2v-2h-2v2z"/><path d="M11 17h2v-2h-2v2z"/><path d="M11 5h2V3h-2v2z"/><path d="M11 9h2V7h-2v2z"/><path d="M11 13h2v-2h-2v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M7 5h2V3H7v2z"/><path d="M7 13h2v-2H7v2z"/><path d="M3 21h2V3H3v18z"/><path d="M19 9h2V7h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M19 3v2h2V3h-2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 21h2v-2h-2v2z"/><path d="M15 13h2v-2h-2v2z"/><path d="M15 5h2V3h-2v2z"/>',
	'border_outer' : '<path d="M13 7h-2v2h2V7z"/><path d="M13 11h-2v2h2v-2z"/><path d="M17 11h-2v2h2v-2z"/><path d="M19 19H5V5h14v14zM3 3v18h18V3H3z"/><path d="M13 15h-2v2h2v-2z"/><path d="M9 11H7v2h2v-2z"/>',
	'border_right' : '<path d="M7 21h2v-2H7v2z"/><path d="M3 5h2V3H3v2z"/><path d="M7 5h2V3H7v2z"/><path d="M7 13h2v-2H7v2z"/><path d="M3 21h2v-2H3v2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M3 13h2v-2H3v2z"/><path d="M3 17h2v-2H3v2z"/><path d="M3 9h2V7H3v2z"/><path d="M11 17h2v-2h-2v2z"/><path d="M15 13h2v-2h-2v2z"/><path d="M19 3v18h2V3h-2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M15 5h2V3h-2v2z"/><path d="M11 13h2v-2h-2v2z"/><path d="M11 5h2V3h-2v2z"/><path d="M11 9h2V7h-2v2z"/>',
	'border_style' : '<path d="M15 21h2v-2h-2v2z"/><path d="M19 21h2v-2h-2v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M3 3v18h2V5h16V3H3z"/><path d="M19 9h2V7h-2v2z"/>',
	'border_top' : '<path d="M7 21h2v-2H7v2z"/><path d="M7 13h2v-2H7v2z"/><path d="M11 13h2v-2h-2v2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M3 17h2v-2H3v2z"/><path d="M3 21h2v-2H3v2z"/><path d="M3 13h2v-2H3v2z"/><path d="M3 9h2V7H3v2z"/><path d="M11 17h2v-2h-2v2z"/><path d="M19 9h2V7h-2v2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M3 3v2h18V3H3z"/><path d="M19 17h2v-2h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M11 9h2V7h-2v2z"/><path d="M19 21h2v-2h-2v2z"/><path d="M15 13h2v-2h-2v2z"/>',
	'border_vertical' : '<path d="M3 9h2V7H3v2z"/><path d="M3 5h2V3H3v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M7 13h2v-2H7v2z"/><path d="M3 13h2v-2H3v2z"/><path d="M3 21h2v-2H3v2z"/><path d="M3 17h2v-2H3v2z"/><path d="M7 5h2V3H7v2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M11 21h2V3h-2v18z"/><path d="M19 21h2v-2h-2v2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 3v2h2V3h-2z"/><path d="M19 9h2V7h-2v2z"/><path d="M15 5h2V3h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M15 13h2v-2h-2v2z"/>',
	'bubble_chart' : '<circle cx="7.2" cy="14.4" r="3.2"/><circle cx="14.8" cy="18" r="2"/><circle cx="15.2" cy="8.8" r="4.8"/>',
	'drag_handle' : '<path d="M20 9H4v2h16V9z"/><path d="M4 15h16v-2H4v2z"/>',
	'format_align_center' : '<path d="M7 15v2h10v-2H7z"/><path d="M3 21h18v-2H3v2z"/><path d="M3 13h18v-2H3v2z"/><path d="M7 7v2h10V7H7z"/><path d="M3 3v2h18V3H3z"/>',
	'format_align_justify' : '<path d="M3 21h18v-2H3v2z"/><path d="M3 17h18v-2H3v2z"/><path d="M3 13h18v-2H3v2z"/><path d="M3 9h18V7H3v2z"/><path d="M3 3v2h18V3H3z"/>',
	'format_align_left' : '<path d="M15 15H3v2h12v-2z"/><path d="M15 7H3v2h12V7z"/><path d="M3 13h18v-2H3v2z"/><path d="M3 21h18v-2H3v2z"/><path d="M3 3v2h18V3H3z"/>',
	'format_align_right' : '<path d="M3 21h18v-2H3v2z"/><path d="M9 17h12v-2H9v2z"/><path d="M3 13h18v-2H3v2z"/><path d="M9 9h12V7H9v2z"/><path d="M3 3v2h18V3H3z"/>',
	'format_bold' : '<path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>',
	'format_clear' : '<path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5z"/><path d="M6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"/>',
	'format_color_fill' : '<path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"/><path fill-opacity=".36" d="M0 20h24v4H0z"/>',
	'format_color_reset' : '<path d="M18 14c0-4-6-10.8-6-10.8s-1.33 1.51-2.73 3.52l8.59 8.59c.09-.42.14-.86.14-1.31z"/><path d="M17.12 17.12L12.5 12.5 5.27 5.27 4 6.55l3.32 3.32C6.55 11.32 6 12.79 6 14c0 3.31 2.69 6 6 6 1.52 0 2.9-.57 3.96-1.5l2.63 2.63 1.27-1.27-2.74-2.74z"/>',
	'format_color_text' : '<path fill-opacity=".36" d="M0 20h24v4H0z"/><path d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z"/>',
	'format_indent_decrease' : '<path d="M11 17h10v-2H11v2z"/><path d="M3 12l4 4V8l-4 4z"/><path d="M3 21h18v-2H3v2z"/><path d="M3 3v2h18V3H3z"/><path d="M11 9h10V7H11v2z"/><path d="M11 13h10v-2H11v2z"/>',
	'format_indent_increase' : '<path d="M3 21h18v-2H3v2z"/><path d="M3 8v8l4-4-4-4z"/><path d="M11 17h10v-2H11v2z"/><path d="M3 3v2h18V3H3z"/><path d="M11 9h10V7H11v2z"/><path d="M11 13h10v-2H11v2z"/>',
	'format_italic' : '<path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>',
	'format_line_spacing' : '<path d="M6 7h2.5L5 3.5 1.5 7H4v10H1.5L5 20.5 8.5 17H6V7z"/><path d="M10 5v2h12V5H10z"/><path d="M10 19h12v-2H10v2z"/><path d="M10 13h12v-2H10v2z"/>',
	'format_list_bulleted' : '<path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M4 4.5c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5z"/><path d="M4 16.67c-.74 0-1.33.6-1.33 1.33 0 .73.6 1.33 1.33 1.33.73 0 1.33-.6 1.33-1.33 0-.73-.59-1.33-1.33-1.33z"/><path d="M7 19h14v-2H7v2z"/><path d="M7 13h14v-2H7v2z"/><path d="M7 5v2h14V5H7z"/>',
	'format_list_numbered' : '<path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1z"/><path d="M3 8h1V4H2v1h1v3z"/><path d="M2 11h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1z"/><path d="M7 5v2h14V5H7z"/><path d="M7 19h14v-2H7v2z"/><path d="M7 13h14v-2H7v2z"/>',
	'format_paint' : '<path d="M18 4V3c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6h1v4H9v11c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h8V4h-3z"/>',
	'format_quote' : '<path d="M6 17h3l2-4V7H5v6h3z"/><path d="M14 17h3l2-4V7h-6v6h3z"/>',
	'format_shapes' : '<path d="M19 5V3h2v2h-2zm2 16h-2v-2h2v2zm-4-2H7v-2H5V7h2V5h10v2h2v10h-2v2zM5 21H3v-2h2v2zM3 3h2v2H3V3zm20 4V1h-6v2H7V1H1v6h2v10H1v6h6v-2h10v2h6v-6h-2V7h2z"/><path d="M10.69 12.74h2.61L12 8.91l-1.31 3.83zM13.73 14h-3.49l-.73 2H7.89l3.4-9h1.4l3.41 9h-1.63l-.74-2z"/>',
	'format_size' : '<path d="M9 4v3h5v12h3V7h5V4H9z"/><path d="M3 12h3v7h3v-7h3V9H3v3z"/>',
	'format_strikethrough' : '<path d="M10 19h4v-3h-4v3z"/><path d="M5 4v3h5v3h4V7h5V4H5z"/><path d="M3 14h18v-2H3v2z"/>',
	'format_textdirection_l_to_r' : '<path d="M9 10v5h2V4h2v11h2V4h2V2H9C6.79 2 5 3.79 5 6s1.79 4 4 4z"/><path d="M21 18l-4-4v3H5v2h12v3l4-4z"/>',
	'format_textdirection_r_to_l' : '<path d="M10 10v5h2V4h2v11h2V4h2V2h-8C7.79 2 6 3.79 6 6s1.79 4 4 4z"/><path d="M8 17v-3l-4 4 4 4v-3h12v-2H8z"/>',
	'format_underline' : '<path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6z"/><path d="M5 19v2h14v-2H5z"/>',
	'functions' : '<path d="M18 4H6v2l6.5 6L6 18v2h12v-3h-7l5-5-5-5h7z"/>',
	'highlight' : '<path d="M6 14l3 3v5h6v-5l3-3V9H6z"/><path d="M11 2h2v3h-2z"/><path d="M3.5 5.875L4.914 4.46l2.12 2.122L5.62 7.997z"/><path d="M16.96 6.585l2.123-2.12 1.414 1.414L18.375 8z"/>',
	'insert_chart' : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>',
	'insert_comment' : '<path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>',
	'insert_drive_file' : '<path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>',
	'insert_emoticon' : '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M15.5 11c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/><path d="M8.5 11c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z"/><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>',
	'insert_invitation' : '<path d="M17 12h-5v5h5v-5z"/><path d="M19 19H5V8h14v11zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2z"/>',
	'insert_link' : '<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1z"/><path d="M8 13h8v-2H8v2z"/><path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>',
	'insert_photo' : '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>',
	'linear_scale' : '<path d="M19.5 9.5c-1.03 0-1.9.62-2.29 1.5h-2.92c-.39-.88-1.26-1.5-2.29-1.5s-1.9.62-2.29 1.5H6.79c-.39-.88-1.26-1.5-2.29-1.5C3.12 9.5 2 10.62 2 12s1.12 2.5 2.5 2.5c1.03 0 1.9-.62 2.29-1.5h2.92c.39.88 1.26 1.5 2.29 1.5s1.9-.62 2.29-1.5h2.92c.39.88 1.26 1.5 2.29 1.5 1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5z"/>',
	'merge_type' : '<path d="M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41z"/><path d="M7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z"/>',
	'mode_comment' : '<path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>',
	'mode_edit' : '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
	'monetization_on' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>',
	'money_off' : '<path d="M12.5 6.9c1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-.53.12-1.03.3-1.48.54l1.47 1.47c.41-.17.91-.27 1.51-.27z"/><path d="M5.33 4.06L4.06 5.33 7.5 8.77c0 2.08 1.56 3.21 3.91 3.91l3.51 3.51c-.34.48-1.05.91-2.42.91-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c.96-.18 1.82-.55 2.45-1.12l2.22 2.22 1.27-1.27L5.33 4.06z"/>',
	'multiline_chart' : '<path d="M22 6.92l-1.41-1.41-2.85 3.21C15.68 6.4 12.83 5 9.61 5 6.72 5 4.07 6.16 2 8l1.42 1.42C5.12 7.93 7.27 7 9.61 7c2.74 0 5.09 1.26 6.77 3.24l-2.88 3.24-4-4L2 16.99l1.5 1.5 6-6.01 4 4 4.05-4.55c.75 1.35 1.25 2.9 1.44 4.55H21c-.22-2.3-.95-4.39-2.04-6.14L22 6.92z"/>',
	'pie_chart' : '<path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10z"/><path d="M13.03 2v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99z"/><path d="M13.03 13.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z"/>',
	'pie_chart_outline' : '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 2.07c3.61.45 6.48 3.33 6.93 6.93H13V4.07zM4 12c0-4.06 3.07-7.44 7-7.93v15.87c-3.93-.5-7-3.88-7-7.94zm9 7.93V13h6.93c-.45 3.61-3.32 6.48-6.93 6.93z"/>',
	'publish' : '<path d="M5 4v2h14V4H5z"/><path d="M5 14h4v6h6v-6h4l-7-7-7 7z"/>',
	'short_text' : '<path d="M4 9h16v2H4z"/><path d="M4 13h10v2H4z"/>',
	'show_chart' : '<path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>',
	'space_bar' : '<path d="M18 9v4H6V9H4v6h16V9z"/>',
	'strikethrough_s' : '<path d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-.61.13-1.16.4-1.67.26-.5.63-.93 1.11-1.29a5.73 5.73 0 0 1 1.7-.83c.66-.19 1.39-.29 2.18-.29.81 0 1.54.11 2.21.34.66.22 1.23.54 1.69.94.47.4.83.88 1.08 1.43.25.55.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85-.09-.27-.24-.49-.44-.68-.2-.19-.45-.33-.75-.44-.3-.1-.66-.16-1.06-.16-.39 0-.74.04-1.03.13-.29.09-.53.21-.72.36-.19.16-.34.34-.44.55-.1.21-.15.43-.15.66 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25z"/><path d="M21 12v-2H3v2h9.62c.18.07.4.14.55.2.37.17.66.34.87.51.21.17.35.36.43.57.07.2.11.43.11.69 0 .23-.05.45-.14.66-.09.2-.23.38-.42.53-.19.15-.42.26-.71.35-.29.08-.63.13-1.01.13-.43 0-.83-.04-1.18-.13s-.66-.23-.91-.42c-.25-.19-.45-.44-.59-.75-.14-.31-.25-.76-.25-1.21H6.4c0 .55.08 1.13.24 1.58.16.45.37.85.65 1.21.28.35.6.66.98.92.37.26.78.48 1.22.65.44.17.9.3 1.38.39.48.08.96.13 1.44.13.8 0 1.53-.09 2.18-.28.65-.19 1.21-.45 1.67-.79.46-.34.82-.77 1.07-1.27.25-.5.38-1.07.38-1.71 0-.6-.1-1.14-.31-1.61-.05-.11-.11-.23-.17-.33H21z"/>',
	'text_fields' : '<path d="M2.5 4v3h5v12h3V7h5V4h-13z"/><path d="M21.5 9h-9v3h3v7h3v-7h3V9z"/>',
	'title' : '<path d="M5 4v3h5.5v12h3V7H19V4z"/>',
	'vertical_align_bottom' : '<path d="M16 13h-3V3h-2v10H8l4 4 4-4z"/><path d="M4 19v2h16v-2H4z"/>',
	'vertical_align_center' : '<path d="M8 19h3v4h2v-4h3l-4-4-4 4z"/><path d="M16 5h-3V1h-2v4H8l4 4 4-4z"/><path d="M4 11v2h16v-2H4z"/>',
	'vertical_align_top' : '<path d="M8 11h3v10h2V11h3l-4-4-4 4z"/><path d="M4 3v2h16V3H4z"/>',
	'wrap_text' : '<path d="M4 19h6v-2H4v2z"/><path d="M20 5H4v2h16V5z"/><path d="M17 11H4v2h13.25c1.1 0 2 .9 2 2s-.9 2-2 2H15v-2l-3 3 3 3v-2h2c2.21 0 4-1.79 4-4s-1.79-4-4-4z"/>',
	//
	// file
	//
	'_title10' : 'File',
	'attachment' : '<path d="M7.5 18C4.46 18 2 15.54 2 12.5S4.46 7 7.5 7H18c2.21 0 4 1.79 4 4s-1.79 4-4 4H9.5C8.12 15 7 13.88 7 12.5S8.12 10 9.5 10H17v1.5H9.5c-.55 0-1 .45-1 1s.45 1 1 1H18c1.38 0 2.5-1.12 2.5-2.5S19.38 8.5 18 8.5H7.5c-2.21 0-4 1.79-4 4s1.79 4 4 4H17V18H7.5z"/>',
	'cloud' : '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>',
	'cloud_circle' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14H8c-1.66 0-3-1.34-3-3s1.34-3 3-3l.14.01C8.58 8.28 10.13 7 12 7c2.21 0 4 1.79 4 4h.5c1.38 0 2.5 1.12 2.5 2.5S17.88 16 16.5 16z"/>',
	'cloud_done' : '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17 15.18 9l1.41 1.41L10 17z"/>',
	'cloud_download' : '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>',
	'cloud_off' : '<path d="M19.35 10.04A7.49 7.49 0 0 0 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46a5.497 5.497 0 0 1 8.05 4.87v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96z"/><path d="M7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27z"/>',
	'cloud_queue' : '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71C7.37 7.69 9.48 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z"/>',
	'cloud_upload' : '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>',
	'create_new_folder' : '<path d="M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z"/>',
	'file_download' : '<path d="M19 9h-4V3H9v6H5l7 7 7-7z"/><path d="M5 18v2h14v-2H5z"/>',
	'file_upload' : '<path d="M9 16h6v-6h4l-7-7-7 7h4z"/><path d="M5 18h14v2H5z"/>',
	'folder' : '<path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>',
	'folder_open' : '<path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>',
	'folder_shared' : '<path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8h-8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z"/>',
	//
	// hardware
	//
	'_title11' : 'Hardware',
	'cast' : '<path d="M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M1 18v3h3c0-1.66-1.34-3-3-3z"/><path d="M1 14v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7z"/><path d="M1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z"/>',
	'cast_connected' : '<path d="M1 18v3h3c0-1.66-1.34-3-3-3z"/><path d="M1 14v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7z"/><path d="M19 7H5v1.63c3.96 1.28 7.09 4.41 8.37 8.37H19V7z"/><path d="M1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z"/><path d="M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
	'computer' : '<path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>',
	'desktop_mac' : '<path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/>',
	'desktop_windows' : '<path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"/>',
	'developer_dashboard' : '<path d="M18 19H4V5h14v14zm4-10V7h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2v-2h-2V9h2z"/><path d="M6 13h5v4H6z"/><path d="M12 7h4v3h-4z"/><path d="M6 7h5v5H6z"/><path d="M12 11h4v6h-4z"/>',
	'device_hub' : '<path d="M17 16l-4-4V8.82C14.16 8.4 15 7.3 15 6c0-1.66-1.34-3-3-3S9 4.34 9 6c0 1.3.84 2.4 2 2.82V12l-4 4H3v5h5v-3.05l4-4.2 4 4.2V21h5v-5h-4z"/>',
	'devices_other' : '<path d="M3 6h18V4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V6z"/><path d="M11 17.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2-5.5H9v1.78c-.61.55-1 1.33-1 2.22 0 .89.39 1.67 1 2.22V20h4v-1.78c.61-.55 1-1.34 1-2.22 0-.88-.39-1.67-1-2.22V12z"/><path d="M21 18h-4v-8h4v8zm1-10h-6c-.5 0-1 .5-1 1v10c0 .5.5 1 1 1h6c.5 0 1-.5 1-1V9c0-.5-.5-1-1-1z"/>',
	'dock' : '<path d="M8 23h8v-2H8v2z"/><path d="M16 15H8V5h8v10zm0-13.99L8 1c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99z"/>',
	'gamepad' : '<path d="M15 7.5V2H9v5.5l3 3 3-3z"/><path d="M7.5 9H2v6h5.5l3-3-3-3z"/><path d="M9 16.5V22h6v-5.5l-3-3-3 3z"/><path d="M16.5 9l-3 3 3 3H22V9h-5.5z"/>',
	'headset' : '<path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>',
	'headset_mic' : '<path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h4v1h-7v2h6c1.66 0 3-1.34 3-3V10c0-4.97-4.03-9-9-9z"/>',
	'keyboard' : '<path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/>',
	'keyboard_arrow_down' : '<path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"/>',
	'keyboard_arrow_left' : '<path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>',
	'keyboard_arrow_right' : '<path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>',
	'keyboard_arrow_up' : '<path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>',
	'keyboard_backspace' : '<path d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z"/>',
	'keyboard_capslock' : '<path d="M12 8.41L16.59 13 18 11.59l-6-6-6 6L7.41 13 12 8.41z"/><path d="M6 18h12v-2H6v2z"/>',
	'keyboard_hide' : '<path d="M19 8h-2V6h2v2zm0 3h-2V9h2v2zm-3-3h-2V6h2v2zm0 3h-2V9h2v2zm0 4H8v-2h8v2zM7 8H5V6h2v2zm0 3H5V9h2v2zm1-2h2v2H8V9zm0-3h2v2H8V6zm3 3h2v2h-2V9zm0-3h2v2h-2V6zm9-3H4c-1.1 0-1.99.9-1.99 2L2 15c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M12 23l4-4H8l4 4z"/>',
	'keyboard_return' : '<path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/>',
	'keyboard_tab' : '<path d="M11.59 7.41L15.17 11H1v2h14.17l-3.59 3.59L13 18l6-6-6-6-1.41 1.41z"/><path d="M20 6v12h2V6h-2z"/>',
	'keyboard_voice' : '<path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/><path d="M17.3 12c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>',
	'laptop' : '<path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>',
	'laptop_chromebook' : '<path d="M22 18V3H2v15H0v2h24v-2h-2zm-8 0h-4v-1h4v1zm6-3H4V5h16v10z"/>',
	'laptop_mac' : '<path d="M20 18c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2H0c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2h-4zM4 5h16v11H4V5zm8 14c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>',
	'laptop_windows' : '<path d="M20 18v-1c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2v1H0v2h24v-2h-4zM4 5h16v10H4V5z"/>',
	'memory' : '<path d="M13 13h-2v-2h2v2zm2-4H9v6h6V9z"/><path d="M17 17H7V7h10v10zm4-6V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2z"/>',
	'mouse' : '<path d="M13 1.07V9h7c0-4.08-3.05-7.44-7-7.93z"/><path d="M4 15c0 4.42 3.58 8 8 8s8-3.58 8-8v-4H4v4z"/><path d="M11 1.07C7.05 1.56 4 4.92 4 9h7V1.07z"/>',
	'phone_android' : '<path d="M16 1H8C6.34 1 5 2.34 5 4v16c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3zm-2 20h-4v-1h4v1zm3.25-3H6.75V4h10.5v14z"/>',
	'phone_iphone' : '<path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z"/>',
	'phonelink' : '<path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6z"/><path d="M22 17h-4v-7h4v7zm1-9h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z"/>',
	'phonelink_off' : '<path d="M22 6V4H6.82l2 2H22z"/><path d="M4 6.27L14.73 17H4V6.27zM1.92 1.65L.65 2.92l1.82 1.82C2.18 5.08 2 5.52 2 6v11H0v3h17.73l2.35 2.35 1.27-1.27L3.89 3.62 1.92 1.65z"/><path d="M23 8h-6c-.55 0-1 .45-1 1v4.18l2 2V10h4v7h-2.18l3 3H23c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z"/>',
	'power_input' : '<path d="M2 9v2h19V9H2z"/><path d="M2 15h5v-2H2v2z"/><path d="M9 15h5v-2H9v2z"/><path d="M16 15h5v-2h-5v2z"/>',
	'router' : '<path d="M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3c-1.8 0-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7z"/><path d="M19.3 6.7c-.9-.9-2.1-1.4-3.3-1.4-1.2 0-2.4.5-3.3 1.4l.8.8c.7-.7 1.6-1 2.5-1 .9 0 1.8.3 2.5 1l.8-.8z"/><path d="M15 18h-2v-2h2v2zm-3.5 0h-2v-2h2v2zM8 18H6v-2h2v2zm11-5h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2z"/>',
	'scanner' : '<path d="M19.8 10.7L4.2 5l-.7 1.9L17.6 12H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5.5c0-.8-.5-1.6-1.2-1.8zM7 17H5v-2h2v2zm12 0H9v-2h10v2z"/>',
	'security' : '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>',
	'sim_card' : '<path d="M19.99 4c0-1.1-.89-2-1.99-2h-8L4 8v12c0 1.1.9 2 2 2h12.01c1.1 0 1.99-.9 1.99-2l-.01-16zM9 19H7v-2h2v2zm8 0h-2v-2h2v2zm-8-4H7v-4h2v4zm4 4h-2v-4h2v4zm0-6h-2v-2h2v2zm4 2h-2v-4h2v4z"/>',
	'smartphone' : '<path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>',
	'speaker' : '<path d="M12 20c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-16c1.1 0 2 .9 2 2s-.9 2-2 2c-1.11 0-2-.9-2-2s.89-2 2-2zm5-2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 1.99 2 1.99L17 22c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/><path d="M12 12c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>',
	'speaker_group' : '<path d="M18.2 1H9.8C8.81 1 8 1.81 8 2.8v14.4c0 .99.81 1.79 1.8 1.79l8.4.01c.99 0 1.8-.81 1.8-1.8V2.8c0-.99-.81-1.8-1.8-1.8zM14 3c1.1 0 2 .89 2 2s-.9 2-2 2-2-.89-2-2 .9-2 2-2zm0 13.5c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/> <circle cx="14" cy="12.5" r="2.5"/> <path d="M6 5H4v16c0 1.1.89 2 2 2h10v-2H6V5z"/>',
	'tablet' : '<path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 1.99-.9 1.99-2L23 6c0-1.1-.9-2-2-2zm-2 14H5V6h14v12z"/>',
	'tablet_android' : '<path d="M18 0H6C4.34 0 3 1.34 3 3v18c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V3c0-1.66-1.34-3-3-3zm-4 22h-4v-1h4v1zm5.25-3H4.75V3h14.5v16z"/>',
	'tablet_mac' : '<path d="M18.5 0h-14C3.12 0 2 1.12 2 2.5v19C2 22.88 3.12 24 4.5 24h14c1.38 0 2.5-1.12 2.5-2.5v-19C21 1.12 19.88 0 18.5 0zm-7 23c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7.5-4H4V3h15v16z"/>',
	'toys' : '<path d="M12 12c0-3 2.5-5.5 5.5-5.5S23 9 23 12H12z"/><path d="M12 12c0 3-2.5 5.5-5.5 5.5S1 15 1 12h11z"/><path d="M12 12c-3 0-5.5-2.5-5.5-5.5S9 1 12 1v11z"/><path d="M12 12c3 0 5.5 2.5 5.5 5.5S15 23 12 23V12z"/>',
	'tv' : '<path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>',
	'vidiogame_asset' : '<path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
	'watch' : '<path d="M20 12c0-2.54-1.19-4.81-3.04-6.27L16 0H8l-.95 5.73C5.19 7.19 4 9.45 4 12s1.19 4.81 3.05 6.27L8 24h8l.96-5.73C18.81 16.81 20 14.54 20 12zM6 12c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6z"/>',
	//
	// image
	//
	'_title12' : 'Image',
	'add_a_photo' : '<path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3z"/><path d="M13 19c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-7-9V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3z"/><path d="M9.8 14c0 1.77 1.43 3.2 3.2 3.2 1.77 0 3.2-1.43 3.2-3.2 0-1.77-1.43-3.2-3.2-3.2-1.77 0-3.2 1.43-3.2 3.2z"/>',
	'add_to_photos' : '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/><path d="M19 11h-4v4h-2v-4H9V9h4V5h2v4h4v2zm1-9H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
	'adjust' : '<path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2z"/><path d="M15 12c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"/>',
	'assistant_photo' : '<path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>',
	'audiotrack' : '<path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>',
	'blur_circular' : '<path d="M10 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M10 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M7 9.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M10 16.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M7 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M10 7.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M14 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M14 7.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M17 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M17 9.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M14 16.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M14 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>',
	'blur_linear' : '<path d="M5 17.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"/><path d="M9 13c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M9 9c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M3 21h18v-2H3v2z"/><path d="M5 9.5c.83 0 1.5-.67 1.5-1.5S5.83 6.5 5 6.5 3.5 7.17 3.5 8 4.17 9.5 5 9.5z"/><path d="M5 13.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"/><path d="M9 17c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M17 16.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M3 3v2h18V3H3z"/><path d="M17 8.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M17 12.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M13 9c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M13 13c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M13 17c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>',
	'blur_off' : '<path d="M14 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M13.8 11.48l.2.02c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5l.02.2c.09.67.61 1.19 1.28 1.28z"/><path d="M14 3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M10 3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M21 10.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M10 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M18 15c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M18 11c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M18 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M14 20.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M2.5 5.27l3.78 3.78L6 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1c0-.1-.03-.19-.06-.28l2.81 2.81c-.71.11-1.25.73-1.25 1.47 0 .83.67 1.5 1.5 1.5.74 0 1.36-.54 1.47-1.25l2.81 2.81c-.09-.03-.18-.06-.28-.06-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1c0-.1-.03-.19-.06-.28l3.78 3.78L20 20.23 3.77 4 2.5 5.27z"/><path d="M10 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M21 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M6 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M3 9.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M10 20.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M6 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M3 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/>',
	'blur_on' : '<path d="M6 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M6 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M6 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M3 9.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M6 5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M21 10.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M14 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M14 3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M3 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M10 20.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M10 3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M10 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M10 12.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M18 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M18 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M18 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M18 5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M21 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M14 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M14 20.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M10 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M10 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M14 12.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M14 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>',
	'brightness_1' : '<circle cx="12" cy="12" r="10"/>',
	'brightness_2' : '<path d="M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z"/>',
	'brightness_3' : '<path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z"/>',
	'brightness_4' : '<path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-.89 0-1.74-.2-2.5-.55C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.45C10.26 6.2 11.11 6 12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6z"/>',
	'brightness_5' : '<path d="M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>',
	'brightness_6' : '<path d="M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z"/>',
	'brightness_7' : '<path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm8-9.31V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69z"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>',
	'broken_image' : '<path d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2z"/><path d="M18 11.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z"/>',
	'brush' : '<path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3z"/><path d="M20.71 4.63l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>',
	'burst_mode' : '<path d="M1 5h2v14H1z"/><path d="M5 5h2v14H5z"/><path d="M11 17l2.5-3.15L15.29 16l2.5-3.22L21 17H11zM22 5H10c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"/>',
	'camera' : '<path d="M9.4 10.5l4.77-8.26C13.47 2.09 12.75 2 12 2c-2.4 0-4.6.85-6.32 2.25l3.66 6.35.06-.1z"/><path d="M21.54 9c-.92-2.92-3.15-5.26-6-6.34L11.88 9h9.66z"/><path d="M21.8 10h-7.49l.29.5 4.76 8.25C21 16.97 22 14.61 22 12c0-.69-.07-1.35-.2-2z"/><path d="M8.54 12l-3.9-6.75C3.01 7.03 2 9.39 2 12c0 .69.07 1.35.2 2h7.49l-1.15-2z"/><path d="M2.46 15c.92 2.92 3.15 5.26 6 6.34L12.12 15H2.46z"/><path d="M13.73 15l-3.9 6.76c.7.15 1.42.24 2.17.24 2.4 0 4.6-.85 6.32-2.25l-3.66-6.35-.93 1.6z"/>',
	'camera_alt' : '<circle cx="12" cy="12" r="3.2"/><path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"/>',
	'camera_front' : '<path d="M10 20H5v2h5v2l3-3-3-3v2z"/><path d="M14 20v2h5v-2h-5z"/><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-1.99.9-1.99 2S10.9 8 12 8z"/><path d="M7 2h10v10.5c0-1.67-3.33-2.5-5-2.5s-5 .83-5 2.5V2zm10-2H7C5.9 0 5 .9 5 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z"/>',
	'camera_rear' : '<path d="M10 20H5v2h5v2l3-3-3-3v2z"/><path d="M14 20v2h5v-2h-5z"/><path d="M12 6c-1.11 0-2-.9-2-2s.89-2 1.99-2 2 .9 2 2C14 5.1 13.1 6 12 6zm5-6H7C5.9 0 5 .9 5 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z"/>',
	'camera_roll' : '<path d="M14 5c0-1.1-.9-2-2-2h-1V2c0-.55-.45-1-1-1H6c-.55 0-1 .45-1 1v1H4c-1.1 0-2 .9-2 2v15c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2h8V5h-8zm-2 13h-2v-2h2v2zm0-9h-2V7h2v2zm4 9h-2v-2h2v2zm0-9h-2V7h2v2zm4 9h-2v-2h2v2zm0-9h-2V7h2v2z"/>',
	'center_focus_strong' : '<path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/><path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4z"/><path d="M5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5z"/><path d="M19 3h-4v2h4v4h2V5c0-1.1-.9-2-2-2z"/><path d="M19 19h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/>',
	'center_focus_weak' : '<path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4z"/><path d="M5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5z"/><path d="M19 3h-4v2h4v4h2V5c0-1.1-.9-2-2-2z"/><path d="M19 19h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/><path d="M12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>',
	'collections' : '<path d="M11 12l2.03 2.71L16 11l4 5H8l3-4zm11 4V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2z"/><path d="M2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/>',
	'collections_bookmark' : '<path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 10l-2.5-1.5L15 12V4h5v8z"/>',
	'color_lens' : '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
	'colorize' : '<path d="M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z"/>',
	'compare' : '<path d="M10 18H5l5-6v6zm0-15H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2z"/><path d="M19 3h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
	'control_point' : '<path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2z"/>',
	'control_point_duplicate' : '<path d="M16 8h-2v3h-3v2h3v3h2v-3h3v-2h-3z"/><path d="M2 12c0-2.79 1.64-5.2 4.01-6.32V3.52C2.52 4.76 0 8.09 0 12s2.52 7.24 6.01 8.48v-2.16C3.64 17.2 2 14.79 2 12z"/><path d="M15 19c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm0-16c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9z"/>',
	'crop' : '<path d="M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8z"/><path d="M7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z"/>',
	'crop_16_9' : '<path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"/>',
	'crop_3_2' : '<path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v12z"/>',
	'crop_5_4' : '<path d="M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H5V7h14v10z"/>',
	'crop_7_5' : '<path d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"/>',
	'crop_din' : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>',
	'crop_free' : '<path d="M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2z"/><path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4z"/><path d="M19 19h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/><path d="M19 3h-4v2h4v4h2V5c0-1.1-.9-2-2-2z"/>',
	'crop_landscape' : '<path d="M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H5V7h14v10z"/>',
	'crop_original' : '<path d="M19 19H5V5h14v14zm0-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M13.96 12.29l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"/>',
	'crop_portrait' : '<path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z"/>',
	'crop_rotate' : '<path d="M7.47 21.49C4.2 19.93 1.86 16.76 1.5 13H0c.51 6.16 5.66 11 11.95 11 .23 0 .44-.02.66-.03L8.8 20.15l-1.33 1.34z"/><path d="M12.05 0c-.23 0-.44.02-.66.04l3.81 3.81 1.33-1.33C19.8 4.07 22.14 7.24 22.5 11H24c-.51-6.16-5.66-11-11.95-11z"/><path d="M16 14h2V8a2 2 0 0 0-2-2h-6v2h6v6z"/><path d="M8 16V4H6v2H4v2h2v8a2 2 0 0 0 2 2h8v2h2v-2h2v-2H8z"/>',
	'crop_square' : '<path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z"/>',
	'dehaze' : '<path d="M2 15.5v2h20v-2H2z"/><path d="M2 10.5v2h20v-2H2z"/><path d="M2 5.5v2h20v-2H2z"/>',
	'details' : '<path d="M3 4l9 16 9-16H3zm3.38 2h11.25L12 16 6.38 6z"/>',
	'edit' : '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
	'exposure' : '<path d="M15 17v2h2v-2h2v-2h-2v-2h-2v2h-2v2h2z"/><path d="M20 20H4L20 4v16zM5 5h6v2H5V5zm15-3H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
	'exposure_neg_1' : '<path d="M4 11v2h8v-2H4z"/><path d="M19 18h-2V7.38L14 8.4V6.7L18.7 5h.3v13z"/>',
	'exposure_neg_2' : '<path d="M15.05 16.29l2.86-3.07c.38-.39.72-.79 1.04-1.18.32-.39.59-.78.82-1.17.23-.39.41-.78.54-1.17.13-.39.19-.79.19-1.18 0-.53-.09-1.02-.27-1.46-.18-.44-.44-.81-.78-1.11-.34-.31-.77-.54-1.26-.71A5.72 5.72 0 0 0 16.47 5c-.69 0-1.31.11-1.85.32-.54.21-1 .51-1.36.88-.37.37-.65.8-.84 1.3-.18.47-.27.97-.28 1.5h2.14c.01-.31.05-.6.13-.87.09-.29.23-.54.4-.75.18-.21.41-.37.68-.49.27-.12.6-.18.96-.18.31 0 .58.05.81.15.23.1.43.25.59.43.16.18.28.4.37.65.08.25.13.52.13.81 0 .22-.03.43-.08.65-.06.22-.15.45-.29.7-.14.25-.32.53-.56.83-.23.3-.52.65-.88 1.03l-4.17 4.55V18H21v-1.71h-5.95z"/><path d="M2 11v2h8v-2H2z"/>',
	'exposure_plus_1' : '<path d="M10 7H8v4H4v2h4v4h2v-4h4v-2h-4V7z"/><path d="M20 18h-2V7.38L15 8.4V6.7L19.7 5h.3v13z"/>',
	'exposure_plus_2' : '<path d="M16.05 16.29l2.86-3.07c.38-.39.72-.79 1.04-1.18.32-.39.59-.78.82-1.17.23-.39.41-.78.54-1.17.13-.39.19-.79.19-1.18 0-.53-.09-1.02-.27-1.46-.18-.44-.44-.81-.78-1.11-.34-.31-.77-.54-1.26-.71A5.72 5.72 0 0 0 17.47 5c-.69 0-1.31.11-1.85.32-.54.21-1 .51-1.36.88-.37.37-.65.8-.84 1.3-.18.47-.27.97-.28 1.5h2.14c.01-.31.05-.6.13-.87.09-.29.23-.54.4-.75.18-.21.41-.37.68-.49.27-.12.6-.18.96-.18.31 0 .58.05.81.15.23.1.43.25.59.43.16.18.28.4.37.65.08.25.13.52.13.81 0 .22-.03.43-.08.65-.06.22-.15.45-.29.7-.14.25-.32.53-.56.83-.23.3-.52.65-.88 1.03l-4.17 4.55V18H22v-1.71h-5.95z"/><path d="M8 7H6v4H2v2h4v4h2v-4h4v-2H8V7z"/>',
	'exposure_zero' : '<path d="M16.14 12.5c0 1-.1 1.85-.3 2.55-.2.7-.48 1.27-.83 1.7-.36.44-.79.75-1.3.95-.51.2-1.07.3-1.7.3-.62 0-1.18-.1-1.69-.3-.51-.2-.95-.51-1.31-.95-.36-.44-.65-1.01-.85-1.7-.2-.7-.3-1.55-.3-2.55v-2.04c0-1 .1-1.85.3-2.55.2-.7.48-1.26.84-1.69.36-.43.8-.74 1.31-.93C10.81 5.1 11.38 5 12 5c.63 0 1.19.1 1.7.29.51.19.95.5 1.31.93.36.43.64.99.84 1.69.2.7.3 1.54.3 2.55v2.04zm-2.11-2.36c0-.64-.05-1.18-.13-1.62-.09-.44-.22-.79-.4-1.06-.17-.27-.39-.46-.64-.58-.25-.13-.54-.19-.86-.19-.32 0-.61.06-.86.18s-.47.31-.64.58c-.17.27-.31.62-.4 1.06s-.13.98-.13 1.62v2.67c0 .64.05 1.18.14 1.62.09.45.23.81.4 1.09s.39.48.64.61.54.19.87.19c.33 0 .62-.06.87-.19s.46-.33.63-.61c.17-.28.3-.64.39-1.09.09-.45.13-.99.13-1.62v-2.66z"/>',
	'filter' : '<path d="M15.96 10.29l-2.75 3.54-1.96-2.36L8.5 15h11l-3.54-4.71z"/><path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
	'filter_1' : '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M14 15h2V5h-4v2h2v8z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
	'filter_2' : '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M17 13h-4v-2h2a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4v2h4v2h-2a2 2 0 0 0-2 2v4h6v-2z"/>',
	'filter_3' : '<path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M17 13v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V7a2 2 0 0 0-2-2h-4v2h4v2h-2v2h2v2h-4v2h4a2 2 0 0 0 2-2z"/>',
	'filter_4' : '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M15 15h2V5h-2v4h-2V5h-2v6h4v4z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
	'filter_5' : '<path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M17 13v-2a2 2 0 0 0-2-2h-2V7h4V5h-6v6h4v2h-4v2h4a2 2 0 0 0 2-2z"/>',
	'filter_6' : '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M13 11h2v2h-2v-2zm0 4h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2V7h4V5h-4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z"/>',
	'filter_7' : '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M13 15l4-8V5h-6v2h4l-4 8h2z"/>',
	'filter_8' : '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M13 11h2v2h-2v-2zm0-4h2v2h-2V7zm0 8h2a2 2 0 0 0 2-2v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V7a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1.5c0 .83.67 1.5 1.5 1.5-.83 0-1.5.67-1.5 1.5V13a2 2 0 0 0 2 2z"/>',
	'filter_9' : '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M15 9h-2V7h2v2zm0-4h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v2h-4v2h4a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/>',
	'filter_9_plus' : '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M11 9V8h1v1h-1zm3 3V8a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1v1H9v2h3a2 2 0 0 0 2-2z"/><path d="M21 9h-2V7h-2v2h-2v2h2v2h2v-2h2v6H7V3h14v6zm0-8H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
	'filter_b_and_w' : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16l-7-8v8H5l7-8V5h7v14z"/>',
	'filter_center_focus' : '<path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4z"/><path d="M5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5z"/><path d="M19 3h-4v2h4v4h2V5c0-1.1-.9-2-2-2z"/><path d="M19 19h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/><path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>',
	'filter_drama' : '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.61 5.64 5.36 8.04 2.35 8.36 0 10.9 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4h2c0-2.76-1.86-5.08-4.4-5.78C8.61 6.88 10.2 6 12 6c3.03 0 5.5 2.47 5.5 5.5v.5H19c1.65 0 3 1.35 3 3s-1.35 3-3 3z"/>',
	'filter_frames' : '<path d="M20 20H4V6h4.52l3.52-3.5L15.52 6H20v14zm0-16h-4l-4-4-4 4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/><path d="M18 8H6v10h12"/>',
	'filter_hdr' : '<path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/>',
	'filter_none' : '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
	'filter_tilt_shift' : '<path d="M11 4.07V2.05c-2.01.2-3.84 1-5.32 2.21L7.1 5.69A7.941 7.941 0 0 1 11 4.07z"/><path d="M18.32 4.26A9.949 9.949 0 0 0 13 2.05v2.02c1.46.18 2.79.76 3.9 1.62l1.42-1.43z"/><path d="M19.93 11h2.02c-.2-2.01-1-3.84-2.21-5.32L18.31 7.1a7.941 7.941 0 0 1 1.62 3.9z"/><path d="M5.69 7.1L4.26 5.68A9.949 9.949 0 0 0 2.05 11h2.02c.18-1.46.76-2.79 1.62-3.9z"/><path d="M4.07 13H2.05c.2 2.01 1 3.84 2.21 5.32l1.43-1.43A7.868 7.868 0 0 1 4.07 13z"/><path d="M15 12c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3z"/><path d="M18.31 16.9l1.43 1.43a9.981 9.981 0 0 0 2.21-5.32h-2.02a7.945 7.945 0 0 1-1.62 3.89z"/><path d="M13 19.93v2.02c2.01-.2 3.84-1 5.32-2.21l-1.43-1.43c-1.1.86-2.43 1.44-3.89 1.62z"/><path d="M5.68 19.74A9.981 9.981 0 0 0 11 21.95v-2.02a7.941 7.941 0 0 1-3.9-1.62l-1.42 1.43z"/>',
	'filter_vintage' : '<path d="M18.7 12.4c-.28-.16-.57-.29-.86-.4.29-.11.58-.24.86-.4 1.92-1.11 2.99-3.12 3-5.19-1.79-1.03-4.07-1.11-6 0-.28.16-.54.35-.78.54.05-.31.08-.63.08-.95 0-2.22-1.21-4.15-3-5.19C10.21 1.85 9 3.78 9 6c0 .32.03.64.08.95-.24-.2-.5-.39-.78-.55-1.92-1.11-4.2-1.03-6 0 0 2.07 1.07 4.08 3 5.19.28.16.57.29.86.4-.29.11-.58.24-.86.4-1.92 1.11-2.99 3.12-3 5.19 1.79 1.03 4.07 1.11 6 0 .28-.16.54-.35.78-.54-.05.32-.08.64-.08.96 0 2.22 1.21 4.15 3 5.19 1.79-1.04 3-2.97 3-5.19 0-.32-.03-.64-.08-.95.24.2.5.38.78.54 1.92 1.11 4.2 1.03 6 0-.01-2.07-1.08-4.08-3-5.19zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>',
	'flare' : '<path d="M7 11H1v2h6v-2z"/><path d="M9.17 7.76L7.05 5.64 5.64 7.05l2.12 2.12 1.41-1.41z"/><path d="M13 1h-2v6h2V1z"/><path d="M18.36 7.05l-1.41-1.41-2.12 2.12 1.41 1.41 2.12-2.12z"/><path d="M17 11v2h6v-2h-6z"/><path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/><path d="M14.83 16.24l2.12 2.12 1.41-1.41-2.12-2.12-1.41 1.41z"/><path d="M5.64 16.95l1.41 1.41 2.12-2.12-1.41-1.41-2.12 2.12z"/><path d="M11 23h2v-6h-2v6z"/>',
	'flash_auto' : '<path d="M3 2v12h3v9l7-12H9l4-9H3z"/><path d="M16.85 7.65L18 4l1.15 3.65h-2.3zM19 2h-2l-3.2 9h1.9l.7-2h3.2l.7 2h1.9L19 2z"/>',
	'flash_off' : '<path d="M3.27 3L2 4.27l5 5V13h3v9l3.58-6.14L17.73 20 19 18.73 3.27 3z"/><path d="M17 10h-4l4-8H7v2.18l8.46 8.46L17 10z"/>',
	'flash_on' : '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>',
	'flip' : '<path d="M15 21h2v-2h-2v2z"/><path d="M19 9h2V7h-2v2z"/><path d="M3 5v14c0 1.1.9 2 2 2h4v-2H5V5h4V3H5c-1.1 0-2 .9-2 2z"/><path d="M19 3v2h2c0-1.1-.9-2-2-2z"/><path d="M11 23h2V1h-2v22z"/><path d="M19 17h2v-2h-2v2z"/><path d="M15 5h2V3h-2v2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 21c1.1 0 2-.9 2-2h-2v2z"/>',
	'gradient' : '<path d="M11 9h2v2h-2zm-2 2h2v2H9zm4 0h2v2h-2zm2-2h2v2h-2zM7 9h2v2H7zm12-6H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm2-7h-2v2h2v2h-2v-2h-2v2h-2v-2h-2v2H9v-2H7v2H5v-2h2v-2H5V5h14v6z"/>',
	'grain' : '<path d="M10 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M6 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M6 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M18 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/><path d="M14 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M18 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M14 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M10 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>',
	'grid_off' : '<path d="M16 4h4v4h-4V4zM8 4v1.45l2 2V4h4v4h-3.45l2 2H14v1.45l2 2V10h4v4h-3.45l2 2H20v1.45l2 2V4c0-1.1-.9-2-2-2H4.55l2 2H8z"/><path d="M16 20v-1.46L17.46 20H16zm-2 0h-4v-4h3.45l.55.54V20zm-6-6H4v-4h3.45l.55.55V14zm0 6H4v-4h4v4zM4 6.55L5.45 8H4V6.55zm6 6L11.45 14H10v-1.45zM1.27 1.27L0 2.55l2 2V20c0 1.1.9 2 2 2h15.46l2 2 1.27-1.27L1.27 1.27z"/>',
	'grid_on' : '<path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/>',
	'hdr_off' : '<path d="M13 15h-2v-2.45l2 2V15zm5 2L3.27 2.27 2 3.55l4 4V11H4V7H2v10h2v-4h2v4h2V9.55l1 1V17h4c.67 0 1.26-.33 1.62-.84l6.34 6.34 1.27-1.27L18 17z"/><path d="M18 9h2v2h-2V9zm0 4h1l.82 3.27.73.73H22l-1.19-4.17c.7-.31 1.19-1.01 1.19-1.83V9c0-1.1-.9-2-2-2h-4v5.45l2 2V13z"/><path d="M15 11.45V9c0-1.1-.9-2-2-2h-2.45L15 11.45z"/>',
	'hdr_on' : '<path d="M6 11H4V7H2v10h2v-4h2v4h2V7H6v4z"/><path d="M13 15h-2V9h2v6zm0-8H9v10h4c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"/><path d="M20 11h-2V9h2v2zm2 0V9c0-1.1-.9-2-2-2h-4v10h2v-4h1l1 4h2l-1.19-4.17c.7-.31 1.19-1.01 1.19-1.83z"/>',
	'hdr_strong' : '<path d="M17 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/><path d="M5 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>',
	'hdr_weak' : '<path d="M5 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/><path d="M17 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-10c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>',
	'healing' : '<path d="M17.73 12.02l3.98-3.98c.39-.39.39-1.02 0-1.41l-4.34-4.34c-.39-.39-1.02-.39-1.41 0l-3.98 3.98L8 2.29C7.8 2.1 7.55 2 7.29 2c-.25 0-.51.1-.7.29L2.25 6.63c-.39.39-.39 1.02 0 1.41l3.98 3.98L2.25 16c-.39.39-.39 1.02 0 1.41l4.34 4.34c.39.39 1.02.39 1.41 0l3.98-3.98 3.98 3.98c.2.2.45.29.71.29.26 0 .51-.1.71-.29l4.34-4.34c.39-.39.39-1.02 0-1.41l-3.99-3.98zM12 9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-4.71 1.96L3.66 7.34l3.63-3.63 3.62 3.62-3.62 3.63zM10 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2.66 9.34l-3.63-3.62 3.63-3.63 3.62 3.62-3.62 3.63z"/>',
	'image' : '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>',
	'image_aspect_ratio' : '<path d="M16 10h-2v2h2v-2z"/><path d="M16 14h-2v2h2v-2z"/><path d="M8 10H6v2h2v-2z"/><path d="M12 10h-2v2h2v-2z"/><path d="M20 18H4V6h16v12zm0-14H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>',
	'iso' : '<path d="M19 19H5L19 5v14zM5.5 7.5h2v-2H9v2h2V9H9v2H7.5V9h-2V7.5zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M17 17v-1.5h-5V17h5z"/>',
	'landscape' : '<path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/>',
	'leak_add' : '<path d="M6 3H3v3c1.66 0 3-1.34 3-3z"/><path d="M14 3h-2a9 9 0 0 1-9 9v2c6.08 0 11-4.93 11-11z"/><path d="M10 3H8c0 2.76-2.24 5-5 5v2c3.87 0 7-3.13 7-7z"/><path d="M10 21h2a9 9 0 0 1 9-9v-2c-6.07 0-11 4.93-11 11z"/><path d="M18 21h3v-3c-1.66 0-3 1.34-3 3z"/><path d="M14 21h2c0-2.76 2.24-5 5-5v-2c-3.87 0-7 3.13-7 7z"/>',
	'leak_remove' : '<path d="M10 3H8c0 .37-.04.72-.12 1.06l1.59 1.59C9.81 4.84 10 3.94 10 3z"/><path d="M3 4.27l2.84 2.84C5.03 7.67 4.06 8 3 8v2c1.61 0 3.09-.55 4.27-1.46L8.7 9.97A8.99 8.99 0 0 1 3 12v2c2.71 0 5.19-.99 7.11-2.62l2.5 2.5A11.044 11.044 0 0 0 10 21h2c0-2.16.76-4.14 2.03-5.69l1.43 1.43A6.922 6.922 0 0 0 14 21h2c0-1.06.33-2.03.89-2.84L19.73 21 21 19.73 4.27 3 3 4.27z"/><path d="M14 3h-2c0 1.5-.37 2.91-1.02 4.16l1.46 1.46C13.42 6.98 14 5.06 14 3z"/><path d="M19.94 16.12c.34-.08.69-.12 1.06-.12v-2c-.94 0-1.84.19-2.66.52l1.6 1.6z"/><path d="M15.38 11.56l1.46 1.46A8.98 8.98 0 0 1 21 12v-2c-2.06 0-3.98.58-5.62 1.56z"/>',
	'lens' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
	'linked_camera' : '<circle cx="12" cy="14" r="3.2"/><path d="M16 3.33c2.58 0 4.67 2.09 4.67 4.67H22c0-3.31-2.69-6-6-6v1.33M16 6c1.11 0 2 .89 2 2h1.33c0-1.84-1.49-3.33-3.33-3.33V6"/><path d="M17 9c0-1.11-.89-2-2-2V4H9L7.17 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9h-5zm-5 10c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>',
	'looks' : '<path d="M12 10c-3.86 0-7 3.14-7 7h2c0-2.76 2.24-5 5-5s5 2.24 5 5h2c0-3.86-3.14-7-7-7z"/><path d="M12 6C5.93 6 1 10.93 1 17h2c0-4.96 4.04-9 9-9s9 4.04 9 9h2c0-6.07-4.93-11-11-11z"/>',
	'looks_3' : '<path d="M19.01 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 7.5c0 .83-.67 1.5-1.5 1.5.83 0 1.5.67 1.5 1.5V15c0 1.11-.9 2-2 2h-4v-2h4v-2h-2v-2h2V9h-4V7h4c1.1 0 2 .89 2 2v1.5z"/>',
	'looks_4' : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 14h-2v-4H9V7h2v4h2V7h2v10z"/>',
	'looks_5' : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h2c1.1 0 2 .89 2 2v2c0 1.11-.9 2-2 2H9v-2h4v-2H9V7h6v2z"/>',
	'looks_6' : '<path d="M11 15h2v-2h-2v2zm8-12H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h2c1.1 0 2 .89 2 2v2c0 1.11-.9 2-2 2h-2c-1.1 0-2-.89-2-2V9c0-1.11.9-2 2-2h4v2z"/>',
	'looks_one' : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z"/>',
	'looks_two' : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 8c0 1.11-.9 2-2 2h-2v2h4v2H9v-4c0-1.11.9-2 2-2h2V9H9V7h4c1.1 0 2 .89 2 2v2z"/>',
	'loupe' : '<path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.49 2 2 6.49 2 12s4.49 10 10 10h8c1.1 0 2-.9 2-2v-8c0-5.51-4.49-10-10-10z"/>',
	'monochrome_photos' : '<path d="M20 19h-8v-1c-2.8 0-5-2.2-5-5s2.2-5 5-5V7h8v12zm0-14h-3.2L15 3H9L7.2 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/><path d="M17 13c0-2.8-2.2-5-5-5v1.8c1.8 0 3.2 1.4 3.2 3.2 0 1.8-1.4 3.2-3.2 3.2V18c2.8 0 5-2.2 5-5z"/><path d="M8.8 13c0 1.8 1.4 3.2 3.2 3.2V9.8c-1.8 0-3.2 1.4-3.2 3.2z"/>',
	'movie_creation' : '<path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>',
	'movie_filter' : '<path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4zm-6.58 11.68L10.37 18l-1.05-2.32L7 14.63l2.32-1.05 1.05-2.32 1.05 2.32 2.32 1.05-2.32 1.05zm3.69-3.47l-.53 1.16-.53-1.16-1.16-.53 1.16-.53.53-1.15.53 1.16 1.16.53-1.16.52z"/>',
	'music_note' : '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>',
	'nature' : '<path d="M13 16.12c3.47-.41 6.17-3.36 6.17-6.95 0-3.87-3.13-7-7-7s-7 3.13-7 7c0 3.47 2.52 6.34 5.83 6.89V20H5v2h14v-2h-6v-3.88z"/>',
	'nature_people' : '<path d="M22.17 9.17c0-3.87-3.13-7-7-7s-7 3.13-7 7c0 3.47 2.52 6.34 5.83 6.89V20H6v-3h1v-4c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v4h1v5h16v-2h-3v-3.88c3.47-.41 6.17-3.36 6.17-6.95zM4.5 11c.83 0 1.5-.67 1.5-1.5S5.33 8 4.5 8 3 8.67 3 9.5 3.67 11 4.5 11z"/>',
	'navigate_before' : '<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>',
	'navigate_next' : '<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>',
	'palette' : '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
	'panorama' : '<path d="M23 18V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zM8.5 12.5l2.5 3.01L14.5 11l4.5 6H5l3.5-4.5z"/>',
	'panorama_fisheye' : '<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>',
	'panorama_horizontal' : '<path d="M20 6.54v10.91c-2.6-.77-5.28-1.16-8-1.16-2.72 0-5.4.39-8 1.16V6.54c2.6.77 5.28 1.16 8 1.16 2.72.01 5.4-.38 8-1.16M21.43 4c-.1 0-.2.02-.31.06C18.18 5.16 15.09 5.7 12 5.7c-3.09 0-6.18-.55-9.12-1.64-.11-.04-.22-.06-.31-.06-.34 0-.57.23-.57.63v14.75c0 .39.23.62.57.62.1 0 .2-.02.31-.06 2.94-1.1 6.03-1.64 9.12-1.64 3.09 0 6.18.55 9.12 1.64.11.04.21.06.31.06.33 0 .57-.23.57-.63V4.63c0-.4-.24-.63-.57-.63z"/>',
	'panorama_vertical' : '<path d="M19.94 21.12c-1.1-2.94-1.64-6.03-1.64-9.12 0-3.09.55-6.18 1.64-9.12.04-.11.06-.22.06-.31 0-.34-.23-.57-.63-.57H4.63c-.4 0-.63.23-.63.57 0 .1.02.2.06.31C5.16 5.82 5.71 8.91 5.71 12c0 3.09-.55 6.18-1.64 9.12-.05.11-.07.22-.07.31 0 .33.23.57.63.57h14.75c.39 0 .63-.24.63-.57-.01-.1-.03-.2-.07-.31zM6.54 20c.77-2.6 1.16-5.28 1.16-8 0-2.72-.39-5.4-1.16-8h10.91c-.77 2.6-1.16 5.28-1.16 8 0 2.72.39 5.4 1.16 8H6.54z"/>',
	'panorama_wide_angle' : '<path d="M12 6c2.45 0 4.71.2 7.29.64.47 1.78.71 3.58.71 5.36 0 1.78-.24 3.58-.71 5.36-2.58.44-4.84.64-7.29.64s-4.71-.2-7.29-.64C4.24 15.58 4 13.78 4 12c0-1.78.24-3.58.71-5.36C7.29 6.2 9.55 6 12 6m0-2c-2.73 0-5.22.24-7.95.72l-.93.16-.25.9C2.29 7.85 2 9.93 2 12s.29 4.15.87 6.22l.25.89.93.16c2.73.49 5.22.73 7.95.73s5.22-.24 7.95-.72l.93-.16.25-.89c.58-2.08.87-4.16.87-6.23s-.29-4.15-.87-6.22l-.25-.89-.93-.16C17.22 4.24 14.73 4 12 4z"/>',
	'photo' : '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>',
	'photo_album' : '<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4zm0 15l3-3.86 2.14 2.58 3-3.86L18 19H6z"/>',
	'photo_camera' : '<circle cx="12" cy="12" r="3.2"/><path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"/>',
	'photo_filter' : '<path d="M17.13 8.9l.59-1.3 1.3-.6-1.3-.59-.59-1.3-.59 1.3-1.31.59 1.31.6z"/><path d="M12.39 6.53l-1.18 2.61-2.61 1.18 2.61 1.18 1.18 2.61 1.19-2.61 2.6-1.18-2.6-1.18z"/><path d="M19.02 10v9H5V5h9V3H5.02c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9h-2z"/>',
	'photo_library' : '<path d="M11 12l2.03 2.71L16 11l4 5H8l3-4zm11 4V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2z"/><path d="M2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/>',
	'photo_size_select_actual' : '<path d="M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3.01L14.5 11l4.5 6H5z"/>',
	'photo_size_select_large' : '<path d="M21 15h2v2h-2v-2z"/><path d="M21 11h2v2h-2v-2z"/><path d="M23 19h-2v2c1 0 2-1 2-2z"/><path d="M13 3h2v2h-2V3z"/><path d="M21 7h2v2h-2V7z"/><path d="M21 3v2h2c0-1-1-2-2-2z"/><path d="M1 7h2v2H1V7z"/><path d="M17 3h2v2h-2V3z"/><path d="M17 19h2v2h-2v-2z"/><path d="M3 3C2 3 1 4 1 5h2V3z"/><path d="M9 3h2v2H9V3z"/><path d="M5 3h2v2H5V3z"/><path d="M3 19l2.5-3.21 1.79 2.15 2.5-3.22L13 19H3zm-2-8v8c0 1.1.9 2 2 2h12V11H1z"/>',
	'photo_size_select_small' : '<path d="M23 15h-2v2h2v-2z"/><path d="M23 11h-2v2h2v-2z"/><path d="M23 19h-2v2c1 0 2-1 2-2z"/><path d="M15 3h-2v2h2V3z"/><path d="M23 7h-2v2h2V7z"/><path d="M21 3v2h2c0-1-1-2-2-2z"/><path d="M3 21h8v-6H1v4c0 1.1.9 2 2 2z"/><path d="M3 7H1v2h2V7z"/><path d="M15 19h-2v2h2v-2z"/><path d="M19 3h-2v2h2V3z"/><path d="M19 19h-2v2h2v-2z"/><path d="M3 3C2 3 1 4 1 5h2V3z"/><path d="M3 11H1v2h2v-2z"/><path d="M11 3H9v2h2V3z"/><path d="M7 3H5v2h2V3z"/>',
	'picture_as_pdf' : '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/><path d="M14 11.5h1v-3h-1v3zm-5-2h1v-1H9v1zm11.5-1H19v1h1.5V11H19v2h-1.5V7h3v1.5zm-4 3c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm-5-2c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zM20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
	'portrait' : '<path d="M16.5 16.25c0-1.5-3-2.25-4.5-2.25s-4.5.75-4.5 2.25V17h9v-.75zm-4.5-4c1.24 0 2.25-1.01 2.25-2.25S13.24 7.75 12 7.75 9.75 8.76 9.75 10s1.01 2.25 2.25 2.25z"/><path d="M19 19H5V5h14v14zm0-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
	'remove_red_eye' : '<path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/><path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>',
	'rotate_90_degrees_ccw' : '<path d="M3.69 12.9l3.66-3.66L11 12.9l-3.66 3.66-3.65-3.66zm3.65-6.49L.86 12.9l6.49 6.48 6.49-6.48-6.5-6.49z"/><path d="M19.36 6.64A8.95 8.95 0 0 0 13 4V.76L8.76 5 13 9.24V6c1.79 0 3.58.68 4.95 2.05a7.007 7.007 0 0 1 0 9.9 6.973 6.973 0 0 1-7.79 1.44l-1.49 1.49C10.02 21.62 11.51 22 13 22c2.3 0 4.61-.88 6.36-2.64a8.98 8.98 0 0 0 0-12.72z"/>',
	'rotate_left' : '<path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47z"/><path d="M6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47z"/><path d="M7.1 18.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32z"/><path d="M13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z"/>',
	'rotate_right' : '<path d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45z"/><path d="M19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02z"/><path d="M13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03z"/><path d="M16.89 15.48l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z"/>',
	'slideshow' : '<path d="M10 8v8l5-4-5-4z"/><path d="M19 19H5V5h14v14zm0-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
	'straighten' : '<path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2v8z"/>',
	'style' : '<path d="M2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41 1.02.08 2.19 1.09 2.61z"/><path d="M7.88 8.75c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm14.15 7.2L17.07 3.98a2.013 2.013 0 0 0-1.81-1.23c-.26 0-.53.04-.79.15L7.1 5.95a1.999 1.999 0 0 0-1.08 2.6l4.96 11.97a1.998 1.998 0 0 0 2.6 1.08l7.36-3.05a1.994 1.994 0 0 0 1.09-2.6z"/><path d="M5.88 19.75c0 1.1.9 2 2 2h1.45l-3.45-8.34v6.34z"/>',
	'switch_camera' : '<path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z"/>',
	'switch_video' : '<path d="M18 9.5V6c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-3.5l4 4v-13l-4 4zm-5 6V13H7v2.5L3.5 12 7 8.5V11h6V8.5l3.5 3.5-3.5 3.5z"/>',
	'tag_faces' : '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M15.5 11c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/><path d="M8.5 11c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z"/><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>',
	'texture' : '<path d="M19.51 3.08L3.08 19.51c.09.34.27.65.51.9.25.24.56.42.9.51L20.93 4.49c-.19-.69-.73-1.23-1.42-1.41z"/><path d="M11.88 3L3 11.88v2.83L14.71 3h-2.83z"/><path d="M5 3c-1.1 0-2 .9-2 2v2l4-4H5z"/><path d="M19 21c.55 0 1.05-.22 1.41-.59.37-.36.59-.86.59-1.41v-2l-4 4h2z"/><path d="M9.29 21h2.83L21 12.12V9.29L9.29 21z"/>',
	'timelapse' : '<path d="M16.24 7.76C15.07 6.59 13.54 6 12 6v6l-4.24 4.24c2.34 2.34 6.14 2.34 8.49 0 2.34-2.34 2.34-6.14-.01-8.48z"/><path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
	'timer' : '<path d="M15 1H9v2h6V1z"/><path d="M11 14h2V8h-2v6z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm7.03-12.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61z"/>',
	'timer_10' : '<path d="M0 7.72V9.4l3-1V18h2V6h-.25L0 7.72z"/><path d="M23.78 14.37c-.14-.28-.35-.53-.63-.74-.28-.21-.61-.39-1.01-.53s-.85-.27-1.35-.38a6.64 6.64 0 0 1-.87-.23 2.61 2.61 0 0 1-.55-.25.717.717 0 0 1-.28-.3.978.978 0 0 1 .01-.8c.06-.13.15-.25.27-.34.12-.1.27-.18.45-.24s.4-.09.64-.09c.25 0 .47.04.66.11.19.07.35.17.48.29.13.12.22.26.29.42.06.16.1.32.1.49h1.95a2.517 2.517 0 0 0-.93-1.97c-.3-.25-.66-.44-1.09-.59C21.49 9.07 21 9 20.46 9c-.51 0-.98.07-1.39.21-.41.14-.77.33-1.06.57-.29.24-.51.52-.67.84a2.2 2.2 0 0 0-.23 1.01c0 .36.08.69.23.96.15.28.36.52.64.73.27.21.6.38.98.53.38.14.81.26 1.27.36.39.08.71.17.95.26s.43.19.57.29c.13.1.22.22.27.34.05.12.07.25.07.39 0 .32-.13.57-.4.77-.27.2-.66.29-1.17.29-.22 0-.43-.02-.64-.08-.21-.05-.4-.13-.56-.24a1.333 1.333 0 0 1-.59-1.11h-1.89c0 .36.08.71.24 1.05.16.34.39.65.7.93.31.27.69.49 1.15.66.46.17.98.25 1.58.25.53 0 1.01-.06 1.44-.19.43-.13.8-.31 1.11-.54.31-.23.54-.51.71-.83.17-.32.25-.67.25-1.06-.02-.4-.09-.74-.24-1.02z"/><path d="M12.9 13.22c0 .6-.04 1.11-.12 1.53-.08.42-.2.76-.36 1.02-.16.26-.36.45-.59.57-.23.12-.51.18-.82.18-.3 0-.58-.06-.82-.18s-.44-.31-.6-.57c-.16-.26-.29-.6-.38-1.02-.09-.42-.13-.93-.13-1.53v-2.5c0-.6.04-1.11.13-1.52.09-.41.21-.74.38-1 .16-.25.36-.43.6-.55.24-.11.51-.17.81-.17.31 0 .58.06.81.17.24.11.44.29.6.55.16.25.29.58.37.99.08.41.13.92.13 1.52v2.51zm.92-6.17c-.34-.4-.75-.7-1.23-.88-.47-.18-1.01-.27-1.59-.27-.58 0-1.11.09-1.59.27-.48.18-.89.47-1.23.88-.34.41-.6.93-.79 1.59-.18.65-.28 1.45-.28 2.39v1.92c0 .94.09 1.74.28 2.39.19.66.45 1.19.8 1.6.34.41.75.71 1.23.89.48.18 1.01.28 1.59.28.59 0 1.12-.09 1.59-.28.48-.18.88-.48 1.22-.89.34-.41.6-.94.78-1.6.18-.65.28-1.45.28-2.39v-1.92c0-.94-.09-1.74-.28-2.39-.18-.66-.44-1.19-.78-1.59z"/>',
	'timer_3' : '<path d="M11.61 12.97c-.16-.24-.36-.46-.62-.65a3.38 3.38 0 0 0-.93-.48c.3-.14.57-.3.8-.5.23-.2.42-.41.57-.64.15-.23.27-.46.34-.71.08-.24.11-.49.11-.73 0-.55-.09-1.04-.28-1.46-.18-.42-.44-.77-.78-1.06-.33-.28-.73-.5-1.2-.64-.45-.13-.97-.2-1.53-.2-.55 0-1.06.08-1.52.24-.47.17-.87.4-1.2.69-.33.29-.6.63-.78 1.03-.2.39-.29.83-.29 1.29h1.98c0-.26.05-.49.14-.69.09-.2.22-.38.38-.52.17-.14.36-.25.58-.33.22-.08.46-.12.73-.12.61 0 1.06.16 1.36.47.3.31.44.75.44 1.32 0 .27-.04.52-.12.74-.08.22-.21.41-.38.57-.17.16-.38.28-.63.37-.25.09-.55.13-.89.13H6.72v1.57H7.9c.34 0 .64.04.91.11.27.08.5.19.69.35.19.16.34.36.44.61.1.24.16.54.16.87 0 .62-.18 1.09-.53 1.42-.35.33-.84.49-1.45.49-.29 0-.56-.04-.8-.13-.24-.08-.44-.2-.61-.36-.17-.16-.3-.34-.39-.56-.09-.22-.14-.46-.14-.72H4.19c0 .55.11 1.03.32 1.45.21.42.5.77.86 1.05s.77.49 1.24.63.96.21 1.48.21c.57 0 1.09-.08 1.58-.23.49-.15.91-.38 1.26-.68.36-.3.64-.66.84-1.1.2-.43.3-.93.3-1.48 0-.29-.04-.58-.11-.86-.08-.25-.19-.51-.35-.76z"/><path d="M20.87 14.37c-.14-.28-.35-.53-.63-.74-.28-.21-.61-.39-1.01-.53s-.85-.27-1.35-.38a6.64 6.64 0 0 1-.87-.23 2.61 2.61 0 0 1-.55-.25.717.717 0 0 1-.28-.3.935.935 0 0 1-.08-.39.946.946 0 0 1 .36-.75c.12-.1.27-.18.45-.24s.4-.09.64-.09c.25 0 .47.04.66.11.19.07.35.17.48.29.13.12.22.26.29.42.06.16.1.32.1.49h1.95a2.517 2.517 0 0 0-.93-1.97c-.3-.25-.66-.44-1.09-.59-.43-.15-.92-.22-1.46-.22-.51 0-.98.07-1.39.21-.41.14-.77.33-1.06.57-.29.24-.51.52-.67.84a2.2 2.2 0 0 0-.23 1.01c0 .36.08.68.23.96.15.28.37.52.64.73.27.21.6.38.98.53.38.14.81.26 1.27.36.39.08.71.17.95.26s.43.19.57.29c.13.1.22.22.27.34.05.12.07.25.07.39 0 .32-.13.57-.4.77-.27.2-.66.29-1.17.29-.22 0-.43-.02-.64-.08-.21-.05-.4-.13-.56-.24a1.333 1.333 0 0 1-.59-1.11h-1.89c0 .36.08.71.24 1.05.16.34.39.65.7.93.31.27.69.49 1.15.66.46.17.98.25 1.58.25.53 0 1.01-.06 1.44-.19.43-.13.8-.31 1.11-.54.31-.23.54-.51.71-.83.17-.32.25-.67.25-1.06-.02-.4-.09-.74-.24-1.02z"/>',
	'timer_off' : '<path d="M19.04 4.55l-1.42 1.42a9.012 9.012 0 0 0-10.57-.49l1.46 1.46C9.53 6.35 10.73 6 12 6c3.87 0 7 3.13 7 7 0 1.27-.35 2.47-.94 3.49l1.45 1.45A8.878 8.878 0 0 0 21 13c0-2.12-.74-4.07-1.97-5.61l1.42-1.42-1.41-1.42z"/><path d="M15 1H9v2h6V1z"/><path d="M11 9.44l2 2V8h-2v1.44z"/><path d="M12 20c-3.87 0-7-3.13-7-7 0-1.28.35-2.48.95-3.52l9.56 9.56c-1.03.61-2.23.96-3.51.96zM3.02 4L1.75 5.27 4.5 8.03A8.905 8.905 0 0 0 3 13c0 4.97 4.02 9 9 9 1.84 0 3.55-.55 4.98-1.5l2.5 2.5 1.27-1.27-7.71-7.71L3.02 4z"/>',
	'tonality' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z"/>',
	'transform' : '<path d="M22 18v-2H8V4h2L7 1 4 4h2v2H2v2h4v8c0 1.1.9 2 2 2h8v2h-2l3 3 3-3h-2v-2h4z"/><path d="M10 8h6v6h2V8c0-1.1-.9-2-2-2h-6v2z"/>',
	'tune' : '<path d="M13 21v-2h8v-2h-8v-2h-2v6h2zM3 17v2h6v-2H3z"/><path d="M21 13v-2H11v2h10zM7 9v2H3v2h4v2h2V9H7z"/><path d="M15 9h2V7h4V5h-4V3h-2v6zM3 5v2h10V5H3z"/>',
	'view_comfy' : '<path d="M3 9h4V5H3v4z"/><path d="M3 14h4v-4H3v4z"/><path d="M8 14h4v-4H8v4z"/><path d="M13 14h4v-4h-4v4z"/><path d="M8 9h4V5H8v4z"/><path d="M13 5v4h4V5h-4z"/><path d="M18 14h4v-4h-4v4z"/><path d="M3 19h4v-4H3v4z"/><path d="M8 19h4v-4H8v4z"/><path d="M13 19h4v-4h-4v4z"/><path d="M18 19h4v-4h-4v4z"/><path d="M18 5v4h4V5h-4z"/>',
	'view_compact' : '<path d="M3 19h6v-7H3v7z"/><path d="M10 19h12v-7H10v7z"/><path d="M3 5v6h19V5H3z"/>',
	'vignette' : '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 15c-4.42 0-8-2.69-8-6s3.58-6 8-6 8 2.69 8 6-3.58 6-8 6z"/>',
	'wb_auto' : '<path d="M6.85 12.65h2.3L8 9l-1.15 3.65zM22 7l-1.2 6.29L19.3 7h-1.6l-1.49 6.29L15 7h-.76C12.77 5.17 10.53 4 8 4c-4.42 0-8 3.58-8 8s3.58 8 8 8c3.13 0 5.84-1.81 7.15-4.43l.1.43H17l1.5-6.1L20 16h1.75l2.05-9H22zm-11.7 9l-.7-2H6.4l-.7 2H3.8L7 7h2l3.2 9h-1.9z"/>',
	'wb_cloudy' : '<path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"/>',
	'wb_incandescent' : '<path d="M3.55 18.54l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/><path d="M11 22.45h2V19.5h-2v2.95z"/><path d="M4 10.5H1v2h3v-2z"/><path d="M15 6.31V1.5H9v4.81C7.21 7.35 6 9.28 6 11.5c0 3.31 2.69 6 6 6s6-2.69 6-6c0-2.22-1.21-4.15-3-5.19z"/><path d="M20 10.5v2h3v-2h-3z"/><path d="M17.24 18.16l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4z"/>',
	'wb_irradescent' : '<path d="M5 14.5h14v-6H5v6z"/><path d="M11 .55V3.5h2V.55h-2z"/><path d="M19.04 3.05l-1.79 1.79 1.41 1.41 1.8-1.79-1.42-1.41z"/><path d="M13 22.45V19.5h-2v2.95h2z"/><path d="M20.45 18.54l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42z"/><path d="M3.55 4.46l1.79 1.79 1.41-1.41-1.79-1.79-1.41 1.41z"/><path d="M4.96 19.95l1.79-1.8-1.41-1.41-1.79 1.79 1.41 1.42z"/>',
	'wb_sunny' : '<path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41z"/><path d="M4 10.5H1v2h3v-2z"/><path d="M13 .55h-2V3.5h2V.55z"/><path d="M20.45 4.46l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79z"/><path d="M17.24 18.16l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4z"/><path d="M20 10.5v2h3v-2h-3z"/><path d="M12 5.5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/><path d="M11 22.45h2V19.5h-2v2.95z"/><path d="M3.55 18.54l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>',
	//
	// maps
	//
	'_title13' : 'Map',
	'add_location' : '<path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm4 8h-3v3h-2v-3H8V8h3V5h2v3h3v2z"/>',
	'beenhere' : '<path d="M19 1H5c-1.1 0-1.99.9-1.99 2L3 15.93c0 .69.35 1.3.88 1.66L12 23l8.11-5.41c.53-.36.88-.97.88-1.66L21 3c0-1.1-.9-2-2-2zm-9 15l-5-5 1.41-1.41L10 13.17l7.59-7.59L19 7l-9 9z"/>',
	'directions' : '<path d="M21.71 11.29l-9-9c-.39-.39-1.02-.39-1.41 0l-9 9c-.39.39-.39 1.02 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9c.39-.38.39-1.01 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/>',
	'directions_bike' : '<path d="M16 4.8c.99 0 1.8-.81 1.8-1.8s-.81-1.8-1.8-1.8c-1 0-1.8.81-1.8 1.8S15 4.8 16 4.8z"/><path d="M19 20.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm0-8.5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/><path d="M14.8 10H19V8.2h-3.2l-1.93-3.27c-.3-.5-.84-.83-1.46-.83-.47 0-.89.19-1.2.5l-3.7 3.7c-.32.3-.51.73-.51 1.2 0 .63.33 1.16.85 1.47L11.2 13v5H13v-6.48l-2.25-1.67 2.32-2.33L14.8 10z"/><path d="M5 20.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zM5 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>',
	'directions_bus' : '<path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>',
	'directions_car' : '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>',
	'directions_ferry' : '<path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2z"/><path d="M6 6h12v3.97L12 8 6 9.97V6zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19z"/>',
	'directions_subway' : '<path d="M12 2c-4.42 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z"/>',
	'directions_train' : '<path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8 1.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7H6V5h12v5z"/>',
	'directions_transit' : '<path d="M12 2c-4.42 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z"/>',
	'directions_walk' : '<path d="M14 3.8c.99 0 1.8-.81 1.8-1.8 0-1-.81-1.8-1.8-1.8-1 0-1.8.81-1.8 1.8S13 3.8 14 3.8z"/><path d="M14.12 10H19V8.2h-3.62l-2-3.33c-.3-.5-.84-.83-1.46-.83-.17 0-.34.03-.49.07L6 5.8V11h1.8V7.33l2.11-.66L6 22h1.8l2.87-8.11L13 17v5h1.8v-6.41l-2.49-4.54.73-2.87L14.12 10z"/>',
	'edit_location' : '<path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm-1.56 10H9v-1.44l3.35-3.34 1.43 1.43L10.44 12zm4.45-4.45l-.7.7-1.44-1.44.7-.7c.15-.15.39-.15.54 0l.9.9c.15.15.15.39 0 .54z"/>',
	'ev_station' : '<path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM18 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM8 18v-4.5H6L10 6v5h2l-4 7z"/>',
	'flight' : '<path d="M10.18 9"/><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>',
	'hotel' : '<path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3z"/><path d="M19 7h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>',
	'layers' : '<path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74z"/><path d="M12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/>',
	'layers_clear' : '<path d="M19.81 14.99l1.19-.92-1.43-1.43-1.19.92 1.43 1.43z"/><path d="M19.36 10.27L21 9l-9-7-2.91 2.27 7.87 7.88 2.4-1.88z"/><path d="M3.27 1L2 2.27l4.22 4.22L3 9l1.63 1.27L12 16l2.1-1.63 1.43 1.43L12 18.54l-7.37-5.73L3 14.07l9 7 4.95-3.85L20.73 21 22 19.73 3.27 1z"/>',
	'local_activity' : '<path d="M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2zm-4.42 4.8L12 14.5l-3.58 2.3 1.08-4.12-3.29-2.69 4.24-.25L12 5.8l1.54 3.95 4.24.25-3.29 2.69 1.09 4.11z"/>',
	'local_airport' : '<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>',
	'local_atm' : '<path d="M11 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-3v-1h4V8h-2V7h-2v1h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3v1H9v2h2v1z"/><path d="M20 18H4V6h16v12zm0-14H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2z"/>',
	'local_bar' : '<path d="M11 13v6H6v2h12v-2h-5v-6l8-8V3H3v2l8 8zM7.5 7l-2-2h13l-2 2h-9z"/>',
	'local_cafe' : '<path d="M20 8h-2V5h2v3zm0-5H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2z"/><path d="M2 21h18v-2H2v2z"/>',
	'local_car_wash' : '<path d="M17 5c.83 0 1.5-.67 1.5-1.5 0-1-1.5-2.7-1.5-2.7s-1.5 1.7-1.5 2.7c0 .83.67 1.5 1.5 1.5z"/><path d="M12 5c.83 0 1.5-.67 1.5-1.5 0-1-1.5-2.7-1.5-2.7s-1.5 1.7-1.5 2.7c0 .83.67 1.5 1.5 1.5z"/><path d="M7 5c.83 0 1.5-.67 1.5-1.5C8.5 2.5 7 .8 7 .8S5.5 2.5 5.5 3.5C5.5 4.33 6.17 5 7 5z"/><path d="M5 13l1.5-4.5h11L19 13H5zm12.5 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-11 0c-.83 0-1.5-.67-1.5-1.5S5.67 15 6.5 15s1.5.67 1.5 1.5S7.33 18 6.5 18zm12.42-9.99C18.72 7.42 18.16 7 17.5 7h-11c-.66 0-1.21.42-1.42 1.01L3 14v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>',
	'local_convenience_store' : '<path d="M19 7V4H5v3H2v13h8v-4h4v4h8V7h-3zm-8 3H9v1h2v1H8V9h2V8H8V7h3v3zm5 2h-1v-2h-2V7h1v2h1V7h1v5z"/>',
	'local_dining' : '<path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 0 0 0 5.66l4.19 4.18z"/><path d="M14.88 11.53c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>',
	'local_drink' : '<path d="M3 2l2.01 18.23C5.13 21.23 5.97 22 7 22h10c1.03 0 1.87-.77 1.99-1.77L21 2H3zm9 17c-1.66 0-3-1.34-3-3 0-2 3-5.4 3-5.4s3 3.4 3 5.4c0 1.66-1.34 3-3 3zm6.33-11H5.67l-.44-4h13.53l-.43 4z"/>',
	'local_florist' : '<path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9z"/><path d="M12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zm-6.4 4.75c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25z"/><path d="M3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z"/>',
	'local_gas_station' : '<path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>',
	'local_grocery_store' : '<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z"/><path d="M1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1z"/><path d="M17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>',
	'local_hospital' : '<path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>',
	'local_hotel' : '<path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3z"/><path d="M19 7h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>',
	'local_laundry_service' : '<path d="M9.17 16.83a4.008 4.008 0 0 0 5.66 0 4.008 4.008 0 0 0 0-5.66l-5.66 5.66z"/><path d="M12 20c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM7 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm3 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm8-1.99L6 2c-1.11 0-2 .89-2 2v16c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V4c0-1.11-.89-1.99-2-1.99z"/>',
	'local_library' : '<path d="M12 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/><path d="M12 11.55C9.64 9.35 6.48 8 3 8v11c3.48 0 6.64 1.35 9 3.55 2.36-2.19 5.52-3.55 9-3.55V8c-3.48 0-6.64 1.35-9 3.55z"/>',
	'local_mall' : '<path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"/>',
	'local_movies' : '<path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>',
	'local_offer' : '<path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>',
	'local_parking' : '<path d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z"/>',
	'local_pharmacy' : '<path d="M21 5h-2.64l1.14-3.14L17.15 1l-1.46 4H3v2l2 6-2 6v2h18v-2l-2-6 2-6V5zm-5 9h-3v3h-2v-3H8v-2h3V9h2v3h3v2z"/>',
	'local_phone' : '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>',
	'local_pizza' : '<path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2zM7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>',
	'local_play' : '<path d="M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2zm-4.42 4.8L12 14.5l-3.58 2.3 1.08-4.12-3.29-2.69 4.24-.25L12 5.8l1.54 3.95 4.24.25-3.29 2.69 1.09 4.11z"/>',
	'local_post_office' : '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
	'local_print_shop' : '<path d="M19 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-3 7H8v-5h8v5zm3-11H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3z"/><path d="M18 3H6v4h12V3z"/>',
	'local_restaurant' : '<path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 0 0 0 5.66l4.19 4.18z"/><path d="M14.88 11.53c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>',
	'local_see' : '<circle cx="12" cy="12" r="3.2"/><path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"/>',
	'local_shipping' : '<path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
	'local_taxi' : '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9v2H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>',
	'map' : '<path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>',
	'my_location' : '<path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/><path d="M12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm8.94-8c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06z"/>',
	'navigation' : '<path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>',
	'near_me' : '<path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>',
	'person_pin_circle' : '<path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 2c1.1 0 2 .9 2 2 0 1.11-.9 2-2 2s-2-.89-2-2c0-1.1.9-2 2-2zm0 10c-1.67 0-3.14-.85-4-2.15.02-1.32 2.67-2.05 4-2.05s3.98.73 4 2.05c-.86 1.3-2.33 2.15-4 2.15z"/>',
	'person_pin' : '<path d="M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 3.3c1.49 0 2.7 1.21 2.7 2.7 0 1.49-1.21 2.7-2.7 2.7-1.49 0-2.7-1.21-2.7-2.7 0-1.49 1.21-2.7 2.7-2.7zM18 16H6v-.9c0-2 4-3.1 6-3.1s6 1.1 6 3.1v.9z"/>',
	'pin_drop' : '<path d="M10 8c0-1.1.9-2 2-2s2 .9 2 2-.89 2-2 2c-1.1 0-2-.9-2-2zm8 0c0-3.31-2.69-6-6-6S6 4.69 6 8c0 4.5 6 11 6 11s6-6.5 6-11z"/><path d="M5 20v2h14v-2H5z"/>',
	'place' : '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
	'rate_review' : '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 14v-2.47l6.88-6.88c.2-.2.51-.2.71 0l1.77 1.77c.2.2.2.51 0 .71L8.47 14H6zm12 0h-7.5l2-2H18v2z"/>',
	'restaurant' : '<path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7z"/><path d="M16 6v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>',
	'restaurant_menu' : '<path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 0 0 0 5.66l4.19 4.18z"/><path d="M14.88 11.53c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>',
	'satellite' : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.99h3C8 6.65 6.66 8 5 8V4.99zM5 12v-2c2.76 0 5-2.25 5-5.01h2C12 8.86 8.87 12 5 12zm0 6l3.5-4.5 2.5 3.01L14.5 12l4.5 6H5z"/>',
	'store_mall_directory' : '<path d="M20 4H4v2h16V4z"/><path d="M12 18H6v-4h6v4zm9-4v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1z"/>',
	'streetview' : '<path d="M12.56 14.33c-.34.27-.56.7-.56 1.17V21h7c1.1 0 2-.9 2-2v-5.98c-.94-.33-1.95-.52-3-.52-2.03 0-3.93.7-5.44 1.83z"/><circle cx="18" cy="6" r="5"/><path d="M11.5 6c0-1.08.27-2.1.74-3H5c-1.1 0-2 .9-2 2v14c0 .55.23 1.05.59 1.41l9.82-9.82C12.23 9.42 11.5 7.8 11.5 6z"/>',
	'subway' : '<circle cx="15.5" cy="16" r="1"/><circle cx="8.5" cy="16" r="1"/><path d="M7.01 9h10v5h-10z"/><path d="M17.8 2.8C16 2.09 13.86 2 12 2c-1.86 0-4 .09-5.8.8C3.53 3.84 2 6.05 2 8.86V22h20V8.86c0-2.81-1.53-5.02-4.2-6.06zm.2 13.08c0 1.45-1.18 2.62-2.63 2.62l1.13 1.12V20H15l-1.5-1.5h-2.83L9.17 20H7.5v-.38l1.12-1.12C7.18 18.5 6 17.32 6 15.88V9c0-2.63 3-3 6-3 3.32 0 6 .38 6 3v6.88z"/>',
	'terrain' : '<path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/>',
	'traffic' : '<path d="M20 10h-3V8.86c1.72-.45 3-2 3-3.86h-3V4c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v1H4c0 1.86 1.28 3.41 3 3.86V10H4c0 1.86 1.28 3.41 3 3.86V15H4c0 1.86 1.28 3.41 3 3.86V20c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1.14c1.72-.45 3-2 3-3.86h-3v-1.14c1.72-.45 3-2 3-3.86zm-8 9c-1.11 0-2-.9-2-2s.89-2 2-2c1.1 0 2 .9 2 2s-.89 2-2 2zm0-5c-1.11 0-2-.9-2-2s.89-2 2-2c1.1 0 2 .9 2 2s-.89 2-2 2zm0-5c-1.11 0-2-.9-2-2 0-1.11.89-2 2-2 1.1 0 2 .89 2 2 0 1.1-.89 2-2 2z"/>',
	'train' : '<path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
	'tram' : '<path d="M19 16.94V8.5c0-2.79-2.61-3.4-6.01-3.49l.76-1.51H17V2H7v1.5h4.75l-.76 1.52C7.86 5.11 5 5.73 5 8.5v8.44c0 1.45 1.19 2.66 2.59 2.97L6 21.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 20h-.08c1.69 0 2.58-1.37 2.58-3.06zm-7 1.56c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5-4.5H7V9h10v5z"/>',
	'transfer_within_a_station' : '<path d="M16.49 15.5v-1.75L14 16.25l2.49 2.5V17H22v-1.5z"/><path d="M19.51 19.75H14v1.5h5.51V23L22 20.5 19.51 18z"/><path d="M9.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5.75 8.9L3 23h2.1l1.75-8L9 17v6h2v-7.55L8.95 13.4l.6-3C10.85 12 12.8 13 15 13v-2c-1.85 0-3.45-1-4.35-2.45l-.95-1.6C9.35 6.35 8.7 6 8 6c-.25 0-.5.05-.75.15L2 8.3V13h2V9.65l1.75-.75"/>',
	'zoom_out_map' : '<path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3z"/><path d="M3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3z"/><path d="M9 21l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6z"/><path d="M21 15l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6z"/>',
	//
	// navigation
	//
	'_title14' : 'Navigation',
	'apps' : '<path d="M4 8h4V4H4v4z"/><path d="M10 20h4v-4h-4v4z"/><path d="M4 20h4v-4H4v4z"/><path d="M4 14h4v-4H4v4z"/><path d="M10 14h4v-4h-4v4z"/><path d="M16 4v4h4V4h-4z"/><path d="M10 8h4V4h-4v4z"/><path d="M16 14h4v-4h-4v4z"/><path d="M16 20h4v-4h-4v4z"/>',
	'arrow_back' : '<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>',
	'arrow_downward' : '<path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/>',
	'arrow_drop_down' : '<path d="M7 10l5 5 5-5z"/>',
	'arrow_drop_down_circle' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 12l-4-4h8l-4 4z"/>',
	'arrow_drop_up' : '<path d="M7 14l5-5 5 5z"/>',
	'arrow_forward' : '<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>',
	'arrow_upwards' : '<path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>',
	'cancel' : '<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>',
	'check' : '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
	'chevron_left' : '<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>',
	'chevron_right' : '<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>',
	'close' : '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',
	'expand_less' : '<path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>',
	'expand_more' : '<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>',
	'first_page' : '<path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6z"/><path d="M6 6h2v12H6z"/>',
	'fullscreen' : '<path d="M7 14H5v5h5v-2H7v-3z"/><path d="M5 10h2V7h3V5H5v5z"/><path d="M17 17h-3v2h5v-5h-2v3z"/><path d="M14 5v2h3v3h2V5h-5z"/>',
	'fullscreen_exit' : '<path d="M5 16h3v3h2v-5H5v2z"/><path d="M8 8H5v2h5V5H8v3z"/><path d="M14 19h2v-3h3v-2h-5v5z"/><path d="M16 8V5h-2v5h5V8h-3z"/>',
	'last_page' : '<path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6z"/><path d="M16 6h2v12h-2z"/>',
	'menu' : '<path d="M3 18h18v-2H3v2z"/><path d="M3 13h18v-2H3v2z"/><path d="M3 6v2h18V6H3z"/>',
	'more_horiz' : '<path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M18 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>',
	'more_vert' : '<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/><path d="M12 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>',
	'refresh' : '<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>',
	'subdirectory_arrow_left' : ' <path d="M11 9l1.42 1.42L8.83 14H18V4h2v12H8.83l3.59 3.58L11 21l-6-6 6-6z"/>',
	'subdirectory_arrow_right' : '<path d="M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z"/>',
	//
	// notification
	//
	'_title15' : 'Notification',
	'adb' : '<path d="M5 16c0 3.87 3.13 7 7 7s7-3.13 7-7v-4H5v4z"/><path d="M15 9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM9 9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm7.12-4.63l2.1-2.1-.82-.83-2.3 2.31C14.16 3.28 13.12 3 12 3s-2.16.28-3.09.75L6.6 1.44l-.82.83 2.1 2.1C6.14 5.64 5 7.68 5 10v1h14v-1c0-2.32-1.14-4.36-2.88-5.63z"/>',
	'airline_seat_flat' : '<path d="M22 11v2H9V7h9c2.21 0 4 1.79 4 4z"/><path d="M2 14v2h6v2h8v-2h6v-2H2z"/><path d="M7.14 12.1a3 3 0 0 0-.04-4.24 3 3 0 0 0-4.24.04 3 3 0 0 0 .04 4.24 3 3 0 0 0 4.24-.04z"/>',
	'airline_seat_angled' : '<path d="M22.25 14.29l-.69 1.89L9.2 11.71l2.08-5.66 8.56 3.09a4 4 0 0 1 2.41 5.15z"/><path d="M1.5 12.14L8 14.48V19h8v-1.63L20.52 19l.69-1.89-19.02-6.86-.69 1.89z"/><path d="M7.3 10.2a3.01 3.01 0 0 0 1.41-4A3.005 3.005 0 0 0 4.7 4.8a2.99 2.99 0 0 0-1.4 4 2.99 2.99 0 0 0 4 1.4z"/>',
	'airline_seat_individual_suite' : '<path d="M7 13c1.65 0 3-1.35 3-3S8.65 7 7 7s-3 1.35-3 3 1.35 3 3 3z"/><path d="M19 7h-8v7H3V7H1v10h22v-6c0-2.21-1.79-4-4-4z"/>',
	'airline_seat_legroom_extra' : '<path d="M4 12V3H2v9c0 2.76 2.24 5 5 5h6v-2H7c-1.66 0-3-1.34-3-3z"/><path d="M22.83 17.24c-.38-.72-1.29-.97-2.03-.63l-1.09.5-3.41-6.98a2.01 2.01 0 0 0-1.79-1.12L11 9V3H5v8c0 1.66 1.34 3 3 3h7l3.41 7 3.72-1.7c.77-.36 1.1-1.3.7-2.06z"/>',
	'airline_seat_legroom_normal' : '<path d="M5 12V3H3v9c0 2.76 2.24 5 5 5h6v-2H8c-1.66 0-3-1.34-3-3z"/><path d="M20.5 18H19v-7c0-1.1-.9-2-2-2h-5V3H6v8c0 1.65 1.35 3 3 3h7v7h4.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>',
	'airline_seat_legroom_reduced' : '<path d="M19.97 19.2c.18.96-.55 1.8-1.47 1.8H14v-3l1-4H9c-1.65 0-3-1.35-3-3V3h6v6h5c1.1 0 2 .9 2 2l-2 7h1.44c.73 0 1.39.49 1.53 1.2z"/><path d="M5 12V3H3v9c0 2.76 2.24 5 5 5h4v-2H8c-1.66 0-3-1.34-3-3z"/>',
	'airline_seat_recline_extra' : '<path d="M5.35 5.64c-.9-.64-1.12-1.88-.49-2.79.63-.9 1.88-1.12 2.79-.49.9.64 1.12 1.88.49 2.79-.64.9-1.88 1.12-2.79.49z"/><path d="M16 19H8.93c-1.48 0-2.74-1.08-2.96-2.54L4 7H2l1.99 9.76A5.01 5.01 0 0 0 8.94 21H16v-2z"/><path d="M16.23 15h-4.88l-1.03-4.1c1.58.89 3.28 1.54 5.15 1.22V9.99c-1.63.31-3.44-.27-4.69-1.25L9.14 7.47c-.23-.18-.49-.3-.76-.38a2.21 2.21 0 0 0-.99-.06h-.02a2.268 2.268 0 0 0-1.84 2.61l1.35 5.92A3.008 3.008 0 0 0 9.83 18h6.85l3.82 3 1.5-1.5-5.77-4.5z"/>',
	'airline_seat_recline_normal' : '<path d="M7.59 5.41c-.78-.78-.78-2.05 0-2.83.78-.78 2.05-.78 2.83 0 .78.78.78 2.05 0 2.83-.79.79-2.05.79-2.83 0z"/><path d="M6 16V7H4v9c0 2.76 2.24 5 5 5h6v-2H9c-1.66 0-3-1.34-3-3z"/><path d="M20 20.07L14.93 15H11.5v-3.68c1.4 1.15 3.6 2.16 5.5 2.16v-2.16c-1.66.02-3.61-.87-4.67-2.04l-1.4-1.55c-.19-.21-.43-.38-.69-.5-.29-.14-.62-.23-.96-.23h-.03C8.01 7 7 8.01 7 9.25V15c0 1.66 1.34 3 3 3h5.07l3.5 3.5L20 20.07z"/>',
	'bluetooth_audio' : '<path d="M19.53 6.71l-1.26 1.26c.63 1.21.98 2.57.98 4.02 0 1.45-.36 2.82-.98 4.02l1.2 1.2c.97-1.54 1.54-3.36 1.54-5.31-.01-1.89-.55-3.67-1.48-5.19zm-5.29 5.3l2.32 2.32c.28-.72.44-1.51.44-2.33 0-.82-.16-1.59-.43-2.31l-2.33 2.32z"/><path d="M12.88 16.29L11 18.17v-3.76l1.88 1.88zM11 5.83l1.88 1.88L11 9.59V5.83zm4.71 1.88L10 2H9v7.59L4.41 5 3 6.41 8.59 12 3 17.59 4.41 19 9 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29z"/>',
	'confirmation_number' : '<path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z"/>',
	'disc_full' : '<path d="M20 7v5h2V7h-2zm0 9h2v-2h-2v2z"/><path d="M10 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-10c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z"/>',
	'do_not_disturb' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>',
	'do_not_disturb_alt' : '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM4 12c0-4.4 3.6-8 8-8 1.8 0 3.5.6 4.9 1.7L5.7 16.9C4.6 15.5 4 13.8 4 12zm8 8c-1.8 0-3.5-.6-4.9-1.7L18.3 7.1C19.4 8.5 20 10.2 20 12c0 4.4-3.6 8-8 8z"/>',
	'do_not_disturb_off' : '<path d="M17 11v2h-1.46l4.68 4.68A9.92 9.92 0 0 0 22 12c0-5.52-4.48-10-10-10-2.11 0-4.07.66-5.68 1.78L13.54 11H17z"/><path d="M7 13v-2h1.46l2 2H7zM2.27 2.27L1 3.54l2.78 2.78A9.92 9.92 0 0 0 2 12c0 5.52 4.48 10 10 10 2.11 0 4.07-.66 5.68-1.78L20.46 23l1.27-1.27L11 11 2.27 2.27z"/>',
	'do_not_disturb_on' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>',
	'drive_eta' : '<path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.5-4.5h11L19 10H5z"/>',
	'enhanced_encryption' : '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6zM16 16h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z"/>',
	'event_available' : '<path d="M16.53 11.06L15.47 10l-4.88 4.88-2.12-2.12-1.06 1.06L10.59 17l5.94-5.94z"/><path d="M19 19H5V8h14v11zm0-16h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
	'event_busy' : '<path d="M9.31 17l2.44-2.44L14.19 17l1.06-1.06-2.44-2.44 2.44-2.44L14.19 10l-2.44 2.44L9.31 10l-1.06 1.06 2.44 2.44-2.44 2.44L9.31 17z"/><path d="M19 19H5V8h14v11zm0-16h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
	'event_note' : '<path d="M19 19H5V8h14v11zm0-16h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M14 14H7v2h7v-2zm3-4H7v2h10v-2z"/>',
	'folder_special' : '<path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6.42 12L10 15.9 6.42 18l.95-4.07-3.16-2.74 4.16-.36L10 7l1.63 3.84 4.16.36-3.16 2.74.95 4.06z"/>',
	'live_tv' : '<path d="M21 20H3V8h18v12zm0-14h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8a2 2 0 0 0-2-2z"/><path d="M9 10v8l7-4z"/>',
	'mms' : '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM5 14l3.5-4.5 2.5 3.01L14.5 8l4.5 6H5z"/>',
	'more' : '<path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.97.89 1.66.89H22c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
	'network_check' : '<path d="M15.9 5c-.17 0-.32.09-.41.23l-.07.15-5.18 11.65c-.16.29-.26.61-.26.96 0 1.11.9 2.01 2.01 2.01.96 0 1.77-.68 1.96-1.59l.01-.03L16.4 5.5c0-.28-.22-.5-.5-.5z"/><path d="M21 11l2-2a15.367 15.367 0 0 0-5.59-3.57l-.53 2.82c1.5.62 2.9 1.53 4.12 2.75zM1 9l2 2c2.88-2.88 6.79-4.08 10.53-3.62l1.19-2.68C9.89 3.84 4.74 5.27 1 9z"/><path d="M5 13l2 2a7.1 7.1 0 0 1 4.03-2l1.28-2.88c-2.63-.08-5.3.87-7.31 2.88zm12 2l2-2c-.8-.8-1.7-1.42-2.66-1.89l-.55 2.92c.42.27.83.59 1.21.97z"/>',
	'network_locked' : '<path d="M19.5 10c.17 0 .33.03.5.05V1L1 20h13v-3c0-.89.39-1.68 1-2.23v-.27c0-2.48 2.02-4.5 4.5-4.5z"/><path d="M21 16h-3v-1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V16zm1 0v-1.5c0-1.38-1.12-2.5-2.5-2.5S17 13.12 17 14.5V16c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1z"/>',
	'no_encryption' : '<path d="M21 21.78L4.22 5 3 6.22l2.04 2.04C4.42 8.6 4 9.25 4 10v10c0 1.1.9 2 2 2h12c.23 0 .45-.05.66-.12L19.78 23 21 21.78z"/><path d="M8.9 6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H9.66L20 18.34V10c0-1.1-.9-2-2-2h-1V6c0-2.76-2.24-5-5-5-2.56 0-4.64 1.93-4.94 4.4L8.9 7.24V6z"/>',
	'ondemand_video' : '<path d="M21 17H3V5h18v12zm0-14H3c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2z"/><path d="M16 11l-7 4V7z"/>',
	'personal_video' : '<path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12z"/>',
	'phone_bluetooth_speaker' : '<path d="M18 7.21l.94.94-.94.94V7.21zm0-4.3l.94.94-.94.94V2.91zM14.71 9.5L17 7.21V11h.5l2.85-2.85L18.21 6l2.15-2.15L17.5 1H17v3.79L14.71 2.5l-.71.71L16.79 6 14 8.79l.71.71z"/><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>',
	'phone_forwarded' : '<path d="M18 11l5-5-5-5v3h-4v4h4v3z"/><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>',
	'phone_in_talk' : '<path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/><path d="M19 12h2c0-4.97-4.03-9-9-9v2c3.87 0 7 3.13 7 7z"/><path d="M15 12h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"/>',
	'phone_locked' : '<path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/><path d="M19.2 4h-3.4v-.5c0-.94.76-1.7 1.7-1.7s1.7.76 1.7 1.7V4zm.8 0v-.5C20 2.12 18.88 1 17.5 1S15 2.12 15 3.5V4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1z"/>',
	'phone_missed' : '<path d="M6.5 5.5L12 11l7-7-1-1-6 6-4.5-4.5H11V3H5v6h1.5V5.5z"/><path d="M23.71 16.67C20.66 13.78 16.54 12 12 12 7.46 12 3.34 13.78.29 16.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2.48 2.48c.18.18.43.29.71.29.27 0 .52-.11.7-.28.79-.74 1.69-1.36 2.66-1.85.33-.16.56-.5.56-.9v-3.1c1.45-.48 3-.73 4.6-.73 1.6 0 3.15.25 4.6.72v3.1c0 .39.23.74.56.9.98.49 1.87 1.12 2.67 1.85.18.18.43.28.7.28.28 0 .53-.11.71-.29l2.48-2.48c.18-.18.29-.43.29-.71 0-.28-.12-.52-.3-.7z"/>',
	'phone_paused' : '<path d="M17 3h-2v7h2V3z"/><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/><path d="M19 3v7h2V3h-2z"/>',
	'power' : '<path d="M16.01 7L16 3h-2v4h-4V3H8v4h-.01C7 6.99 6 7.99 6 8.99v5.49L9.5 18v3h5v-3l3.5-3.51v-5.5c0-1-1-2-1.99-1.99z"/>',
	'priority_high' : '<circle cx="12" cy="19" r="2"/><path d="M10 3h4v12h-4z"/>',
	'sd_card' : '<path d="M18 2h-8L4.02 8 4 20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 6h-2V4h2v4zm3 0h-2V4h2v4zm3 0h-2V4h2v4z"/>',
	'sim_card_alert' : '<path d="M18 2h-8L4.02 8 4 20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 15h-2v-2h2v2zm0-4h-2V8h2v5z"/>',
	'sms' : '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>',
	'sms_failed' : '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>',
	'sync' : '<path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8z"/><path d="M12 18c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>',
	'sync_disabled' : '<path d="M10 6.35V4.26c-.8.21-1.55.54-2.23.96l1.46 1.46c.25-.12.5-.24.77-.33z"/><path d="M2.86 5.41l2.36 2.36a7.925 7.925 0 0 0 1.14 9.87L4 20h6v-6l-2.24 2.24A6.003 6.003 0 0 1 6 12c0-1 .25-1.94.68-2.77l8.08 8.08c-.25.13-.5.25-.77.34v2.09c.8-.21 1.55-.54 2.23-.96l2.36 2.36 1.27-1.27L4.14 4.14 2.86 5.41z"/><path d="M20 4h-6v6l2.24-2.24A6.003 6.003 0 0 1 18 12c0 1-.25 1.94-.68 2.77l1.46 1.46a7.925 7.925 0 0 0-1.14-9.87L20 4z"/>',
	'sync_problem' : '<path d="M3 12c0 2.21.91 4.2 2.36 5.64L3 20h6v-6l-2.24 2.24C5.68 15.15 5 13.66 5 12c0-2.61 1.67-4.83 4-5.65V4.26C5.55 5.15 3 8.27 3 12z"/><path d="M21 4h-6v6l2.24-2.24C18.32 8.85 19 10.34 19 12c0 2.61-1.67 4.83-4 5.65v2.09c3.45-.89 6-4.01 6-7.74 0-2.21-.91-4.2-2.36-5.64L21 4z"/><path d="M11 13h2V7h-2v6zm0 4h2v-2h-2v2z"/>',
	'system_update' : '<path d="M17 19H7V5h10v14zm0-17.99L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99z"/><path d="M16 13h-3V8h-2v5H8l4 4 4-4z"/>',
	'tap_and_play' : '<path d="M2 16v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7z"/><path d="M2 20v3h3c0-1.66-1.34-3-3-3z"/><path d="M2 12v2a9 9 0 0 1 9 9h2c0-6.08-4.92-11-11-11z"/><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v7.37c.69.16 1.36.37 2 .64V5h10v13h-3.03c.52 1.25.84 2.59.95 4H17c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99z"/>',
	'time_to_leave' : '<path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.5-4.5h11L19 10H5z"/>',
	'vibration' : '<path d="M0 15h2V9H0v6z"/><path d="M3 17h2V7H3v10z"/><path d="M22 9v6h2V9h-2z"/><path d="M19 17h2V7h-2v10z"/><path d="M16 19H8V5h8v14zm.5-16h-9C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5z"/>',
	'voice_chat' : '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12l-4-3.2V14H6V6h8v3.2L18 6v8z"/>',
	'vpn_lock' : '<path d="M21.2 4h-3.4v-.5c0-.94.76-1.7 1.7-1.7s1.7.76 1.7 1.7V4zm.8 0v-.5a2.5 2.5 0 0 0-5 0V4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1z"/><path d="M10 20.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L8 16v1c0 1.1.9 2 2 2v1.93zM18.92 12c.04.33.08.66.08 1 0 2.08-.8 3.97-2.1 5.39-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H7v-2h2c.55 0 1-.45 1-1V8h2c1.1 0 2-.9 2-2V3.46c-.95-.3-1.95-.46-3-.46C5.48 3 1 7.48 1 13s4.48 10 10 10 10-4.48 10-10c0-.34-.02-.67-.05-1h-2.03z"/>',
	'wc' : '<path d="M5.5 22v-7.5H4V9c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v5.5H9.5V22h-4z"/><path d="M18 22v-6h3l-2.54-7.63A2.01 2.01 0 0 0 16.56 7h-.12a2 2 0 0 0-1.9 1.37L12 16h3v6h3z"/><path d="M7.5 6c1.11 0 2-.89 2-2 0-1.11-.89-2-2-2-1.11 0-2 .89-2 2 0 1.11.89 2 2 2z"/><path d="M16.5 6c1.11 0 2-.89 2-2 0-1.11-.89-2-2-2-1.11 0-2 .89-2 2 0 1.11.89 2 2 2z"/>',
	'wifi' : '<path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9z"/><path d="M9 17l3 3 3-3a4.237 4.237 0 0 0-6 0z"/><path d="M5 13l2 2a7.074 7.074 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>',
	//
	// places
	//
	'_title16' : 'Place',
	'ac_unit' : '<path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z"/>',
	'airport_shuttle' : '<path d="M17 5H3c-1.1 0-2 .89-2 2v9h2c0 1.65 1.34 3 3 3s3-1.35 3-3h5.5c0 1.65 1.34 3 3 3s3-1.35 3-3H23v-5l-6-6zM3 11V7h4v4H3zm3 6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7-6.5H9V7h4v4zm4.5 6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM15 11V7h1l4 4h-5z"/>',
	'all_inclusive' : '<path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 10.48 12h.01L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l2.83-2.5.01.01L13.52 12h-.01l2.69-2.39c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12c1.02 1.01 2.37 1.57 3.82 1.57 2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z"/>',
	'beach_access' : '<path d="M13.127 14.56l1.43-1.43 6.44 6.443L19.57 21z"/><path d="M17.42 8.83l2.86-2.86c-3.95-3.95-10.35-3.96-14.3-.02 3.93-1.3 8.31-.25 11.44 2.88z"/><path d="M5.95 5.98c-3.94 3.95-3.93 10.35.02 14.3l2.86-2.86C5.7 14.29 4.65 9.91 5.95 5.98z"/><path d="M5.97 5.96l-.01.01c-.38 3.01 1.17 6.88 4.3 10.02l5.73-5.73c-3.13-3.13-7.01-4.68-10.02-4.3z"/>',
	'business_center' : '<path d="M10 16v-1H3.01L3 19c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2v-4h-7v1h-4z"/><path d="M14 7h-4V5h4v2zm6 0h-4.01V5l-2-2h-4l-2 2v2H4c-1.1 0-2 .9-2 2v3c0 1.11.89 2 2 2h6v-2h4v2h6c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"/>',
	'casino' : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z"/>',
	'child_care' : '<circle cx="14.5" cy="10.5" r="1.25"/> <circle cx="9.5" cy="10.5" r="1.25"/> <path d="M22.94 12.66c.04-.21.06-.43.06-.66s-.02-.45-.06-.66c-.25-1.51-1.36-2.74-2.81-3.17-.53-1.12-1.28-2.1-2.19-2.91C16.36 3.85 14.28 3 12 3s-4.36.85-5.94 2.26c-.92.81-1.67 1.8-2.19 2.91-1.45.43-2.56 1.65-2.81 3.17-.04.21-.06.43-.06.66s.02.45.06.66c.25 1.51 1.36 2.74 2.81 3.17.52 1.11 1.27 2.09 2.17 2.89C7.62 20.14 9.71 21 12 21s4.38-.86 5.97-2.28c.9-.8 1.65-1.79 2.17-2.89 1.44-.43 2.55-1.65 2.8-3.17zM19 14c-.1 0-.19-.02-.29-.03-.2.67-.49 1.29-.86 1.86C16.6 17.74 14.45 19 12 19s-4.6-1.26-5.85-3.17c-.37-.57-.66-1.19-.86-1.86-.1.01-.19.03-.29.03-1.1 0-2-.9-2-2s.9-2 2-2c.1 0 .19.02.29.03.2-.67.49-1.29.86-1.86C7.4 6.26 9.55 5 12 5s4.6 1.26 5.85 3.17c.37.57.66 1.19.86 1.86.1-.01.19-.03.29-.03 1.1 0 2 .9 2 2s-.9 2-2 2zM7.5 14c.76 1.77 2.49 3 4.5 3s3.74-1.23 4.5-3h-9z"/>',
	'child_friedly' : '<path d="M13 2v8h8c0-4.42-3.58-8-8-8z"/><path d="M17 20c-.83 0-1.5-.67-1.5-1.5S16.17 17 17 17s1.5.67 1.5 1.5S17.83 20 17 20zm-9 0c-.83 0-1.5-.67-1.5-1.5S7.17 17 8 17s1.5.67 1.5 1.5S8.83 20 8 20zm11.32-4.11A7.948 7.948 0 0 0 21 11H6.44l-.95-2H2v2h2.22s1.89 4.07 2.12 4.42c-1.1.59-1.84 1.75-1.84 3.08C4.5 20.43 6.07 22 8 22c1.76 0 3.22-1.3 3.46-3h2.08c.24 1.7 1.7 3 3.46 3 1.93 0 3.5-1.57 3.5-3.5 0-1.04-.46-1.97-1.18-2.61z"/>',
	'fitness_center' : '<path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>',
	'free_breakfast' : '<path d="M20 8h-2V5h2v3zm0-5H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2a2 2 0 0 0 2-2V5c0-1.11-.89-2-2-2z"/><path d="M4 19h16v2H4z"/>',
	'golf_course' : '<circle cx="19.5" cy="19.5" r="1.5"/><path d="M17 5.92L9 2v18H7v-1.73c-1.79.35-3 .99-3 1.73 0 1.1 2.69 2 6 2s6-.9 6-2c0-.99-2.16-1.81-5-1.97V8.98l6-3.06z"/>',
	'hot_tub' : '<circle cx="7" cy="6" r="2"/><path d="M11.15 12c-.31-.22-.59-.46-.82-.72l-1.4-1.55c-.19-.21-.43-.38-.69-.5-.29-.14-.62-.23-.96-.23h-.03C6.01 9 5 10.01 5 11.25V12H2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8H11.15zM7 20H5v-6h2v6zm4 0H9v-6h2v6zm4 0h-2v-6h2v6zm4 0h-2v-6h2v6zm-.35-14.14l-.07-.07c-.57-.62-.82-1.41-.67-2.2L18 3h-1.89l-.06.43c-.2 1.36.27 2.71 1.3 3.72l.07.06c.57.62.82 1.41.67 2.2l-.11.59h1.91l.06-.43c.21-1.36-.27-2.71-1.3-3.71zm-4 0l-.07-.07c-.57-.62-.82-1.41-.67-2.2L14 3h-1.89l-.06.43c-.2 1.36.27 2.71 1.3 3.72l.07.06c.57.62.82 1.41.67 2.2l-.11.59h1.91l.06-.43c.21-1.36-.27-2.71-1.3-3.71z"/>',
	'kitchen' : '<path d="M18 9H6V4h12v5zm0 11H6v-9.02h12V20zm0-17.99L6 2a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.11-.9-1.99-2-1.99z"/><path d="M8 5h2v3H8z"/><path d="M8 12h2v5H8z"/>',
	'pool' : '<path d="M22 21c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.08.64-2.19.64-1.11 0-1.73-.37-2.18-.64-.37-.23-.6-.36-1.15-.36s-.78.13-1.15.36c-.46.27-1.08.64-2.19.64v-2c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36v2zm0-4.5c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36s-.78.13-1.15.36c-.47.27-1.09.64-2.2.64v-2c.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36v2zM8.67 12c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.12-.07.26-.15.41-.23L10.48 5C8.93 3.45 7.5 2.99 5 3v2.5c1.82-.01 2.89.39 4 1.5l1 1-3.25 3.25c.31.12.56.27.77.39.37.23.59.36 1.15.36z"/> <circle cx="16.5" cy="5.5" r="2.5"/>',
	'room_service' : '<path d="M2 17h20v2H2z"/><path d="M13.84 7.79A2.006 2.006 0 0 0 12 5a2.006 2.006 0 0 0-1.84 2.79C6.25 8.6 3.27 11.93 3 16h18c-.27-4.07-3.25-7.4-7.16-8.21z"/>',
	'rv_hookup' : '<path d="M18 14h-4v-3h4v3zm-7 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm9-3v-6c0-1.1-.9-2-2-2H7V7l-3 3 3 3v-2h4v3H4v3c0 1.1.9 2 2 2h2c0 1.66 1.34 3 3 3s3-1.34 3-3h8v-2h-2z"/><path d="M17 2v2H9v2h8v2l3-3z"/>',
	'smoke_free' : '<path d="M2 6l6.99 7H2v3h9.99l7 7 1.26-1.25-17-17z"/><path d="M20.5 13H22v3h-1.5z"/><path d="M18 13h1.5v3H18z"/><path d="M18.85 4.88c.62-.61 1-1.45 1-2.38h-1.5c0 1.02-.83 1.85-1.85 1.85v1.5c2.24 0 4 1.83 4 4.07V12H22V9.92c0-2.23-1.28-4.15-3.15-5.04z"/><path d="M14.5 8.7h1.53c1.05 0 1.97.74 1.97 2.05V12h1.5v-1.59c0-1.8-1.6-3.16-3.47-3.16H14.5c-1.02 0-1.85-.98-1.85-2s.83-1.75 1.85-1.75V2a3.35 3.35 0 0 0 0 6.7z"/><path d="M17 15.93V13h-2.93z"/>',
	'smoke_rooms' : '<path d="M2 16h15v3H2z"/><path d="M20.5 16H22v3h-1.5z"/><path d="M18 16h1.5v3H18z"/><path d="M18.85 7.73c.62-.61 1-1.45 1-2.38C19.85 3.5 18.35 2 16.5 2v1.5c1.02 0 1.85.83 1.85 1.85S17.52 7.2 16.5 7.2v1.5c2.24 0 4 1.83 4 4.07V15H22v-2.24c0-2.22-1.28-4.14-3.15-5.03z"/><path d="M16.03 10.2H14.5c-1.02 0-1.85-.98-1.85-2s.83-1.75 1.85-1.75v-1.5a3.35 3.35 0 0 0 0 6.7h1.53c1.05 0 1.97.74 1.97 2.05V15h1.5v-1.64c0-1.81-1.6-3.16-3.47-3.16z"/>',
	'spa' : '<path d="M8.55 12c-1.07-.71-2.25-1.27-3.53-1.61 1.28.34 2.46.9 3.53 1.61zm10.43-1.61c-1.29.34-2.49.91-3.57 1.64 1.08-.73 2.28-1.3 3.57-1.64z"/> <path d="M15.49 9.63c-.18-2.79-1.31-5.51-3.43-7.63-2.14 2.14-3.32 4.86-3.55 7.63 1.28.68 2.46 1.56 3.49 2.63 1.03-1.06 2.21-1.94 3.49-2.63zm-6.5 2.65c-.14-.1-.3-.19-.45-.29.15.11.31.19.45.29zm6.42-.25c-.13.09-.27.16-.4.26.13-.1.27-.17.4-.26zM12 15.45C9.85 12.17 6.18 10 2 10c0 5.32 3.36 9.82 8.03 11.49.63.23 1.29.4 1.97.51.68-.12 1.33-.29 1.97-.51C18.64 19.82 22 15.32 22 10c-4.18 0-7.85 2.17-10 5.45z"/>',
	//
	// social
	//
	'_title17' : 'Social',
	'cake' : '<path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2z"/><path d="M16.6 15.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01z"/><path d="M18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12C21 10.34 19.66 9 18 9z"/>',
	'domain' : '<path d="M20 19h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zM10 7H8V5h2v2zm0 4H8V9h2v2zm0 4H8v-2h2v2zm0 4H8v-2h2v2zM6 7H4V5h2v2zm0 4H4V9h2v2zm0 4H4v-2h2v2zm0 4H4v-2h2v2zm6-12V3H2v18h20V7H12z"/><path d="M18 11h-2v2h2v-2z"/><path d="M18 15h-2v2h2v-2z"/>',
	'group' : '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3z"/><path d="M8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/><path d="M8 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/><path d="M16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
	'group_add' : '<path d="M8 10H5V7H3v3H0v2h3v3h2v-3h3v-2z"/><path d="M18 11c1.66 0 2.99-1.34 2.99-3S19.66 5 18 5c-.32 0-.63.05-.91.14.57.81.9 1.79.9 2.86 0 1.07-.34 2.04-.9 2.86.28.09.59.14.91.14z"/><path d="M13 11c1.66 0 2.99-1.34 2.99-3S14.66 5 13 5c-1.66 0-3 1.34-3 3s1.34 3 3 3z"/><path d="M19.62 13.16c.83.73 1.38 1.66 1.38 2.84v2h3v-2c0-1.54-2.37-2.49-4.38-2.84z"/><path d="M13 13c-2 0-6 1-6 3v2h12v-2c0-2-4-3-6-3z"/>',
	'location_city' : '<path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/>',
	'mood' : '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M15.5 11c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/><path d="M8.5 11c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z"/><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>',
	'mood_bad' : '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M15.5 11c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/><path d="M8.5 11c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z"/><path d="M12 14c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z"/>',
	'notifications' : '<path d="M11.5 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/><path d="M18 16v-5.5c0-3.07-2.13-5.64-5-6.32V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v.68c-2.87.68-5 3.25-5 6.32V16l-2 2v1h17v-1l-2-2z"/>',
	'notifications_none' : '<path d="M11.5 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/><path d="M16 17H7v-6.5C7 8.01 9.01 6 11.5 6S16 8.01 16 10.5V17zm2-1v-5.5c0-3.07-2.13-5.64-5-6.32V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v.68c-2.87.68-5 3.25-5 6.32V16l-2 2v1h17v-1l-2-2z"/>',
	'notifications_off' : '<path d="M11.5 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/><path d="M18 10.5c0-3.07-2.13-5.64-5-6.32V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v.68c-.51.12-.99.32-1.45.56L18 14.18V10.5z"/><path d="M17.73 19l2 2L21 19.73 4.27 3 3 4.27l2.92 2.92C5.34 8.16 5 9.29 5 10.5V16l-2 2v1h14.73z"/>',
	'notifications_active' : '<path d="M6.58 3.58L5.15 2.15C2.76 3.97 1.18 6.8 1.03 10h2c.15-2.65 1.51-4.97 3.55-6.42z"/><path d="M19.97 10h2c-.15-3.2-1.73-6.03-4.13-7.85l-1.43 1.43c2.05 1.45 3.41 3.77 3.56 6.42z"/><path d="M18 10.5c0-3.07-2.13-5.64-5-6.32V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v.68c-2.87.68-5 3.25-5 6.32V16l-2 2v1h17v-1l-2-2v-5.5z"/><path d="M11.5 22c.14 0 .27-.01.4-.04.65-.13 1.19-.58 1.44-1.18.1-.24.16-.5.16-.78h-4c0 1.1.9 2 2 2z"/>',
	'notifications_paused' : '<path d="M11.5 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/><path d="M14 9.8l-2.8 3.4H14V15H9v-1.8l2.8-3.4H9V8h5v1.8zm4 6.2v-5.5c0-3.07-2.13-5.64-5-6.32V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v.68c-2.87.68-5 3.25-5 6.32V16l-2 2v1h17v-1l-2-2z"/>',
	'pages' : '<path d="M3 5v6h5L7 7l4 1V3H5c-1.1 0-2 .9-2 2z"/><path d="M8 13H3v6c0 1.1.9 2 2 2h6v-5l-4 1 1-4z"/><path d="M17 17l-4-1v5h6c1.1 0 2-.9 2-2v-6h-5l1 4z"/><path d="M19 3h-6v5l4-1-1 4h5V5c0-1.1-.9-2-2-2z"/>',
	'party_mode' : '<path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 3c1.63 0 3.06.79 3.98 2H12c-1.66 0-3 1.34-3 3 0 .35.07.69.18 1H7.1c-.06-.32-.1-.66-.1-1 0-2.76 2.24-5 5-5zm0 10c-1.63 0-3.06-.79-3.98-2H12c1.66 0 3-1.34 3-3 0-.35-.07-.69-.18-1h2.08c.07.32.1.66.1 1 0 2.76-2.24 5-5 5z"/>',
	'people' : '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3z"/><path d="M8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/><path d="M8 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/><path d="M16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
	'people_outline' : '<path d="M21.5 17.5H14v-1.25c0-.46-.2-.86-.52-1.22.88-.3 1.96-.53 3.02-.53 2.44 0 5 1.21 5 1.75v1.25zm-9 0h-10v-1.25c0-.54 2.56-1.75 5-1.75s5 1.21 5 1.75v1.25zm4-4.5c-1.2 0-3.07.34-4.5 1-1.43-.67-3.3-1-4.5-1C5.33 13 1 14.08 1 16.25V19h22v-2.75c0-2.17-4.33-3.25-6.5-3.25z"/><path d="M7.5 6.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 5.5c1.93 0 3.5-1.57 3.5-3.5S9.43 5 7.5 5 4 6.57 4 8.5 5.57 12 7.5 12z"/><path d="M16.5 6.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 5.5c1.93 0 3.5-1.57 3.5-3.5S18.43 5 16.5 5 13 6.57 13 8.5s1.57 3.5 3.5 3.5z"/>',
	'person' : '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/><path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
	'person_add' : '<path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/><path d="M6 10V7H4v3H1v2h3v3h2v-3h3v-2H6z"/><path d="M15 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
	'person_outline' : '<path d="M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 1.9c1.16 0 2.1.94 2.1 2.1 0 1.16-.94 2.1-2.1 2.1-1.16 0-2.1-.94-2.1-2.1 0-1.16.94-2.1 2.1-2.1"/><path d="M12 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm0 1.9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1"/>',
	'plus_one' : '<path d="M10 8H8v4H4v2h4v4h2v-4h4v-2h-4z"/><path d="M14.5 6.08V7.9l2.5-.5V18h2V5z"/>',
	'poll' : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>',
	'public' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>',
	'school' : '<path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>',
	'sentiment_dissatisfied' : '<circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-6c-2.33 0-4.32 1.45-5.12 3.5h1.67c.69-1.19 1.97-2 3.45-2s2.75.81 3.45 2h1.67c-.8-2.05-2.79-3.5-5.12-3.5z"/>',
	'sentiment_neutral' : '<path d="M9 14h6v1.5H9z"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>',
	'sentiment_satisfied' : '<circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-4c-1.48 0-2.75-.81-3.45-2H6.88c.8 2.05 2.79 3.5 5.12 3.5s4.32-1.45 5.12-3.5h-1.67c-.7 1.19-1.97 2-3.45 2z"/>',
	'sentiment_very_dissatisfied' : '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.47 2 12s4.47 10 9.99 10C17.51 22 22 17.53 22 12S17.52 2 11.99 2z"/><path d="M16.18 7.76l-1.06 1.06-1.06-1.06L13 8.82l1.06 1.06L13 10.94 14.06 12l1.06-1.06L16.18 12l1.06-1.06-1.06-1.06 1.06-1.06z"/><path d="M7.82 12l1.06-1.06L9.94 12 11 10.94 9.94 9.88 11 8.82 9.94 7.76 8.88 8.82 7.82 7.76 6.76 8.82l1.06 1.06-1.06 1.06z"/><path d="M12 14c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z"/>',
	'sentiment_very_satisfied' : '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.47 2 12s4.47 10 9.99 10C17.51 22 22 17.53 22 12S17.52 2 11.99 2z"/><path d="M13 9.94L14.06 11l1.06-1.06L16.18 11l1.06-1.06-2.12-2.12z"/><path d="M8.88 9.94L9.94 11 11 9.94 8.88 7.82 6.76 9.94 7.82 11z"/><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>',
	'share' : '<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>',
	'whatshot' : '<path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>',
	//
	// toggle
	//
	'_title18' : 'Toggle',
	'check_box' : '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
	'check_box_outline_blank' : '<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
	'indeterminate_check_box' : '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/>',
	'radio_button_unchecked' : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>',
	'radio_button_checked' : '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/><path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
	'star' : '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
	'star_half' : '<path d="M22 9.74l-7.19-.62L12 2.5 9.19 9.13 2 9.74l5.46 4.73-1.64 7.03L12 17.77l6.18 3.73-1.63-7.03L22 9.74zM12 15.9V6.6l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.9z"/>',
	'star_border' : '<path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/>',
};
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
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

TEMP_FILE = "__postfile__.tmp";

//
// animate.css
//

ar.css = {};
ar.css.rule = {};
ar.css._rules = {};
ar.css._aniTime = 0.3;

Object.defineProperty(ar.css, 'aniTime', {
	get : function() {
		var This = this;
		return ar.css._aniTime * 1000;
	},

	set : function(millisecons) {
		var This = this;
		ar.css._aniTime = millisecons / 1000;
		ar.css.rule.set('.animated', 'animation-duration', ar.css._aniTime + 's');
		ar.css.rule.set('.animated', '$WD', ar.css._aniTime + 's');
		ar.css.rule.set('.animated.hinge', 'animation-duration', ar.css._aniTime + 's');
		ar.css.rule.set('.animated.hinge', '$WD', ar.css._aniTime + 's');
	}
});

ar.css.init = function() {
	ar.css._css_ = '';
	ar.css._css_ += '.animated{$WD:' + ar.css._aniTime + 's;animation-duration:' + ar.css._aniTime + 's;-webkit-animation-fill-mode:both;animation-fill-mode:both}';
	ar.css._css_ += '.animated.infinite{-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite}';
	ar.css._css_ += '.animated.hinge{$WD:' + ar.css._aniTime + 's;animation-duration:' + ar.css._aniTime + 's}';
	ar.css._css_ += '.animated.bounceIn,.animated.bounceOut,.animated.flipOutX,.animated.flipOutY{$WD:.75s;animation-duration:.75s}';
	ar.css._css_ += '$WK bounce{0%,20%,53%,80%,to{$WF:#CB(.215,.61,.355,1);$AT:#CB(.215,.61,.355,1);$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '40%,43%{$WT:$T3(0,-30px,0);$TF:$T3(0,-30px,0)}';
	ar.css._css_ += '40%,43%,70%{$WF:#CB(.755,.05,.855,.06);$AT:#CB(.755,.05,.855,.06)}';
	ar.css._css_ += '70%{$WT:$T3(0,-15px,0);$TF:$T3(0,-15px,0)}';
	ar.css._css_ += '90%{$WT:$T3(0,-4px,0);$TF:$T3(0,-4px,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF bounce{0%,20%,53%,80%,to{$WF:#CB(.215,.61,.355,1);$AT:#CB(.215,.61,.355,1);$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '40%,43%{$WT:$T3(0,-30px,0);$TF:$T3(0,-30px,0)}';
	ar.css._css_ += '40%,43%,70%{$WF:#CB(.755,.05,.855,.06);$AT:#CB(.755,.05,.855,.06)}';
	ar.css._css_ += '70%{$WT:$T3(0,-15px,0);$TF:$T3(0,-15px,0)}';
	ar.css._css_ += '90%{$WT:$T3(0,-4px,0);$TF:$T3(0,-4px,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.bounce{$WA:bounce;$AN:bounce;$WTO:center bottom;$TFO:center bottom}';
	ar.css._css_ += '$WK flash{0%,50%,to{opacity:1}';
	ar.css._css_ += '25%,75%{opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF flash{0%,50%,to{opacity:1}';
	ar.css._css_ += '25%,75%{opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '.flash{$WA:flash;$AN:flash}';
	ar.css._css_ += '$WK pulse{0%{$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '50%{$WT:$S3(1.05,1.05,1.05);$TF:$S3(1.05,1.05,1.05)}';
	ar.css._css_ += 'to{$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF pulse{0%{$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '50%{$WT:$S3(1.05,1.05,1.05);$TF:$S3(1.05,1.05,1.05)}';
	ar.css._css_ += 'to{$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.pulse{$WA:pulse;$AN:pulse}';
	ar.css._css_ += '$WK rubberBand{0%{$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '30%{$WT:$S3(1.25,.75,1);$TF:$S3(1.25,.75,1)}';
	ar.css._css_ += '40%{$WT:$S3(.75,1.25,1);$TF:$S3(.75,1.25,1)}';
	ar.css._css_ += '50%{$WT:$S3(1.15,.85,1);$TF:$S3(1.15,.85,1)}';
	ar.css._css_ += '65%{$WT:$S3(.95,1.05,1);$TF:$S3(.95,1.05,1)}';
	ar.css._css_ += '75%{$WT:$S3(1.05,.95,1);$TF:$S3(1.05,.95,1)}';
	ar.css._css_ += 'to{$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF rubberBand{0%{$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '30%{$WT:$S3(1.25,.75,1);$TF:$S3(1.25,.75,1)}';
	ar.css._css_ += '40%{$WT:$S3(.75,1.25,1);$TF:$S3(.75,1.25,1)}';
	ar.css._css_ += '50%{$WT:$S3(1.15,.85,1);$TF:$S3(1.15,.85,1)}';
	ar.css._css_ += '65%{$WT:$S3(.95,1.05,1);$TF:$S3(.95,1.05,1)}';
	ar.css._css_ += '75%{$WT:$S3(1.05,.95,1);$TF:$S3(1.05,.95,1)}';
	ar.css._css_ += 'to{$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.rubberBand{$WA:rubberBand;$AN:rubberBand}';
	ar.css._css_ += '$WK shake{0%,to{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '10%,30%,50%,70%,90%{$WT:$T3(-10px,0,0);$TF:$T3(-10px,0,0)}';
	ar.css._css_ += '20%,40%,60%,80%{$WT:$T3(10px,0,0);$TF:$T3(10px,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF shake{0%,to{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '10%,30%,50%,70%,90%{$WT:$T3(-10px,0,0);$TF:$T3(-10px,0,0)}';
	ar.css._css_ += '20%,40%,60%,80%{$WT:$T3(10px,0,0);$TF:$T3(10px,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.shake{$WA:shake;$AN:shake}';
	ar.css._css_ += '$WK headShake{0%{$WT:$TX(0);$TF:$TX(0)}';
	ar.css._css_ += '6.5%{$WT:$TX(-6px) #RY(-9deg);$TF:$TX(-6px) #RY(-9deg)}';
	ar.css._css_ += '18.5%{$WT:$TX(5px) #RY(7deg);$TF:$TX(5px) #RY(7deg)}';
	ar.css._css_ += '31.5%{$WT:$TX(-3px) #RY(-5deg);$TF:$TX(-3px) #RY(-5deg)}';
	ar.css._css_ += '43.5%{$WT:$TX(2px) #RY(3deg);$TF:$TX(2px) #RY(3deg)}';
	ar.css._css_ += '50%{$WT:$TX(0);$TF:$TX(0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF headShake{0%{$WT:$TX(0);$TF:$TX(0)}';
	ar.css._css_ += '6.5%{$WT:$TX(-6px) #RY(-9deg);$TF:$TX(-6px) #RY(-9deg)}';
	ar.css._css_ += '18.5%{$WT:$TX(5px) #RY(7deg);$TF:$TX(5px) #RY(7deg)}';
	ar.css._css_ += '31.5%{$WT:$TX(-3px) #RY(-5deg);$TF:$TX(-3px) #RY(-5deg)}';
	ar.css._css_ += '43.5%{$WT:$TX(2px) #RY(3deg);$TF:$TX(2px) #RY(3deg)}';
	ar.css._css_ += '50%{$WT:$TX(0);$TF:$TX(0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.headShake{$WF:ease-in-out;$AT:ease-in-out;$WA:headShake;$AN:headShake}';
	ar.css._css_ += '$WK swing{20%{$WT:#R(15deg);$TF:#R(15deg)}';
	ar.css._css_ += '40%{$WT:#R(-10deg);$TF:#R(-10deg)}';
	ar.css._css_ += '60%{$WT:#R(5deg);$TF:#R(5deg)}';
	ar.css._css_ += '80%{$WT:#R(-5deg);$TF:#R(-5deg)}';
	ar.css._css_ += 'to{$WT:#R(0deg);$TF:#R(0deg)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF swing{20%{$WT:#R(15deg);$TF:#R(15deg)}';
	ar.css._css_ += '40%{$WT:#R(-10deg);$TF:#R(-10deg)}';
	ar.css._css_ += '60%{$WT:#R(5deg);$TF:#R(5deg)}';
	ar.css._css_ += '80%{$WT:#R(-5deg);$TF:#R(-5deg)}';
	ar.css._css_ += 'to{$WT:#R(0deg);$TF:#R(0deg)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.swing{$WTO:top center;$TFO:top center;$WA:swing;$AN:swing}';
	ar.css._css_ += '$WK tada{0%{$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '10%,20%{$WT:$S3(.9,.9,.9) #R(-3deg);$TF:$S3(.9,.9,.9) #R(-3deg)}';
	ar.css._css_ += '30%,50%,70%,90%{$WT:$S3(1.1,1.1,1.1) #R(3deg);$TF:$S3(1.1,1.1,1.1) #R(3deg)}';
	ar.css._css_ += '40%,60%,80%{$WT:$S3(1.1,1.1,1.1) #R(-3deg);$TF:$S3(1.1,1.1,1.1) #R(-3deg)}';
	ar.css._css_ += 'to{$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF tada{0%{$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '10%,20%{$WT:$S3(.9,.9,.9) #R(-3deg);$TF:$S3(.9,.9,.9) #R(-3deg)}';
	ar.css._css_ += '30%,50%,70%,90%{$WT:$S3(1.1,1.1,1.1) #R(3deg);$TF:$S3(1.1,1.1,1.1) #R(3deg)}';
	ar.css._css_ += '40%,60%,80%{$WT:$S3(1.1,1.1,1.1) #R(-3deg);$TF:$S3(1.1,1.1,1.1) #R(-3deg)}';
	ar.css._css_ += 'to{$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.tada{$WA:tada;$AN:tada}';
	ar.css._css_ += '$WK wobble{0%{$WT:none;$TF:none}';
	ar.css._css_ += '15%{$WT:$T3(-25%,0,0) #R(-5deg);$TF:$T3(-25%,0,0) #R(-5deg)}';
	ar.css._css_ += '30%{$WT:$T3(20%,0,0) #R(3deg);$TF:$T3(20%,0,0) #R(3deg)}';
	ar.css._css_ += '45%{$WT:$T3(-15%,0,0) #R(-3deg);$TF:$T3(-15%,0,0) #R(-3deg)}';
	ar.css._css_ += '60%{$WT:$T3(10%,0,0) #R(2deg);$TF:$T3(10%,0,0) #R(2deg)}';
	ar.css._css_ += '75%{$WT:$T3(-5%,0,0) #R(-1deg);$TF:$T3(-5%,0,0) #R(-1deg)}';
	ar.css._css_ += 'to{$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF wobble{0%{$WT:none;$TF:none}';
	ar.css._css_ += '15%{$WT:$T3(-25%,0,0) #R(-5deg);$TF:$T3(-25%,0,0) #R(-5deg)}';
	ar.css._css_ += '30%{$WT:$T3(20%,0,0) #R(3deg);$TF:$T3(20%,0,0) #R(3deg)}';
	ar.css._css_ += '45%{$WT:$T3(-15%,0,0) #R(-3deg);$TF:$T3(-15%,0,0) #R(-3deg)}';
	ar.css._css_ += '60%{$WT:$T3(10%,0,0) #R(2deg);$TF:$T3(10%,0,0) #R(2deg)}';
	ar.css._css_ += '75%{$WT:$T3(-5%,0,0) #R(-1deg);$TF:$T3(-5%,0,0) #R(-1deg)}';
	ar.css._css_ += 'to{$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '.wobble{$WA:wobble;$AN:wobble}';
	ar.css._css_ += '$WK jello{0%,11.1%,to{$WT:none;$TF:none}';
	ar.css._css_ += '22.2%{$WT:#SX(-12.5deg) #SY(-12.5deg);$TF:#SX(-12.5deg) #SY(-12.5deg)}';
	ar.css._css_ += '33.3%{$WT:#SX(6.25deg) #SY(6.25deg);$TF:#SX(6.25deg) #SY(6.25deg)}';
	ar.css._css_ += '44.4%{$WT:#SX(-3.125deg) #SY(-3.125deg);$TF:#SX(-3.125deg) #SY(-3.125deg)}';
	ar.css._css_ += '55.5%{$WT:#SX(1.5625deg) #SY(1.5625deg);$TF:#SX(1.5625deg) #SY(1.5625deg)}';
	ar.css._css_ += '66.6%{$WT:#SX(-.78125deg) #SY(-.78125deg);$TF:#SX(-.78125deg) #SY(-.78125deg)}';
	ar.css._css_ += '77.7%{$WT:#SX(.390625deg) #SY(.390625deg);$TF:#SX(.390625deg) #SY(.390625deg)}';
	ar.css._css_ += '88.8%{$WT:#SX(-.1953125deg) #SY(-.1953125deg);$TF:#SX(-.1953125deg) #SY(-.1953125deg)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF jello{0%,11.1%,to{$WT:none;$TF:none}';
	ar.css._css_ += '22.2%{$WT:#SX(-12.5deg) #SY(-12.5deg);$TF:#SX(-12.5deg) #SY(-12.5deg)}';
	ar.css._css_ += '33.3%{$WT:#SX(6.25deg) #SY(6.25deg);$TF:#SX(6.25deg) #SY(6.25deg)}';
	ar.css._css_ += '44.4%{$WT:#SX(-3.125deg) #SY(-3.125deg);$TF:#SX(-3.125deg) #SY(-3.125deg)}';
	ar.css._css_ += '55.5%{$WT:#SX(1.5625deg) #SY(1.5625deg);$TF:#SX(1.5625deg) #SY(1.5625deg)}';
	ar.css._css_ += '66.6%{$WT:#SX(-.78125deg) #SY(-.78125deg);$TF:#SX(-.78125deg) #SY(-.78125deg)}';
	ar.css._css_ += '77.7%{$WT:#SX(.390625deg) #SY(.390625deg);$TF:#SX(.390625deg) #SY(.390625deg)}';
	ar.css._css_ += '88.8%{$WT:#SX(-.1953125deg) #SY(-.1953125deg);$TF:#SX(-.1953125deg) #SY(-.1953125deg)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.jello{$WA:jello;$AN:jello;$WTO:center;$TFO:center}';
	ar.css._css_ += '$WK bounceIn{0%,20%,40%,60%,80%,to{$WF:#CB(.215,.61,.355,1);$AT:#CB(.215,.61,.355,1)}';
	ar.css._css_ += '0%{opacity:0;$WT:$S3(.3,.3,.3);$TF:$S3(.3,.3,.3)}';
	ar.css._css_ += '20%{$WT:$S3(1.1,1.1,1.1);$TF:$S3(1.1,1.1,1.1)}';
	ar.css._css_ += '40%{$WT:$S3(.9,.9,.9);$TF:$S3(.9,.9,.9)}';
	ar.css._css_ += '60%{opacity:1;$WT:$S3(1.03,1.03,1.03);$TF:$S3(1.03,1.03,1.03)}';
	ar.css._css_ += '80%{$WT:$S3(.97,.97,.97);$TF:$S3(.97,.97,.97)}';
	ar.css._css_ += 'to{opacity:1;$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF bounceIn{0%,20%,40%,60%,80%,to{$WF:#CB(.215,.61,.355,1);$AT:#CB(.215,.61,.355,1)}';
	ar.css._css_ += '0%{opacity:0;$WT:$S3(.3,.3,.3);$TF:$S3(.3,.3,.3)}';
	ar.css._css_ += '20%{$WT:$S3(1.1,1.1,1.1);$TF:$S3(1.1,1.1,1.1)}';
	ar.css._css_ += '40%{$WT:$S3(.9,.9,.9);$TF:$S3(.9,.9,.9)}';
	ar.css._css_ += '60%{opacity:1;$WT:$S3(1.03,1.03,1.03);$TF:$S3(1.03,1.03,1.03)}';
	ar.css._css_ += '80%{$WT:$S3(.97,.97,.97);$TF:$S3(.97,.97,.97)}';
	ar.css._css_ += 'to{opacity:1;$WT:scaleX(1);$TF:scaleX(1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.bounceIn{$WA:bounceIn;$AN:bounceIn}';
	ar.css._css_ += '$WK bounceInDown{0%,60%,75%,90%,to{$WF:#CB(.215,.61,.355,1);$AT:#CB(.215,.61,.355,1)}';
	ar.css._css_ += '0%{opacity:0;$WT:$T3(0,-3000px,0);$TF:$T3(0,-3000px,0)}';
	ar.css._css_ += '60%{opacity:1;$WT:$T3(0,25px,0);$TF:$T3(0,25px,0)}';
	ar.css._css_ += '75%{$WT:$T3(0,-10px,0);$TF:$T3(0,-10px,0)}';
	ar.css._css_ += '90%{$WT:$T3(0,5px,0);$TF:$T3(0,5px,0)}';
	ar.css._css_ += 'to{$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF bounceInDown{0%,60%,75%,90%,to{$WF:#CB(.215,.61,.355,1);$AT:#CB(.215,.61,.355,1)}';
	ar.css._css_ += '0%{opacity:0;$WT:$T3(0,-3000px,0);$TF:$T3(0,-3000px,0)}';
	ar.css._css_ += '60%{opacity:1;$WT:$T3(0,25px,0);$TF:$T3(0,25px,0)}';
	ar.css._css_ += '75%{$WT:$T3(0,-10px,0);$TF:$T3(0,-10px,0)}';
	ar.css._css_ += '90%{$WT:$T3(0,5px,0);$TF:$T3(0,5px,0)}';
	ar.css._css_ += 'to{$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '.bounceInDown{$WA:bounceInDown;$AN:bounceInDown}';
	ar.css._css_ += '$WK bounceInLeft{0%,60%,75%,90%,to{$WF:#CB(.215,.61,.355,1);$AT:#CB(.215,.61,.355,1)}';
	ar.css._css_ += '0%{opacity:0;$WT:$T3(-3000px,0,0);$TF:$T3(-3000px,0,0)}';
	ar.css._css_ += '60%{opacity:1;$WT:$T3(25px,0,0);$TF:$T3(25px,0,0)}';
	ar.css._css_ += '75%{$WT:$T3(-10px,0,0);$TF:$T3(-10px,0,0)}';
	ar.css._css_ += '90%{$WT:$T3(5px,0,0);$TF:$T3(5px,0,0)}';
	ar.css._css_ += 'to{$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF bounceInLeft{0%,60%,75%,90%,to{$WF:#CB(.215,.61,.355,1);$AT:#CB(.215,.61,.355,1)}';
	ar.css._css_ += '0%{opacity:0;$WT:$T3(-3000px,0,0);$TF:$T3(-3000px,0,0)}';
	ar.css._css_ += '60%{opacity:1;$WT:$T3(25px,0,0);$TF:$T3(25px,0,0)}';
	ar.css._css_ += '75%{$WT:$T3(-10px,0,0);$TF:$T3(-10px,0,0)}';
	ar.css._css_ += '90%{$WT:$T3(5px,0,0);$TF:$T3(5px,0,0)}';
	ar.css._css_ += 'to{$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '.bounceInLeft{$WA:bounceInLeft;$AN:bounceInLeft}';
	ar.css._css_ += '$WK bounceInRight{0%,60%,75%,90%,to{$WF:#CB(.215,.61,.355,1);$AT:#CB(.215,.61,.355,1)}';
	ar.css._css_ += '0%{opacity:0;$WT:$T3(3000px,0,0);$TF:$T3(3000px,0,0)}';
	ar.css._css_ += '60%{opacity:1;$WT:$T3(-25px,0,0);$TF:$T3(-25px,0,0)}';
	ar.css._css_ += '75%{$WT:$T3(10px,0,0);$TF:$T3(10px,0,0)}';
	ar.css._css_ += '90%{$WT:$T3(-5px,0,0);$TF:$T3(-5px,0,0)}';
	ar.css._css_ += 'to{$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF bounceInRight{0%,60%,75%,90%,to{$WF:#CB(.215,.61,.355,1);$AT:#CB(.215,.61,.355,1)}';
	ar.css._css_ += '0%{opacity:0;$WT:$T3(3000px,0,0);$TF:$T3(3000px,0,0)}';
	ar.css._css_ += '60%{opacity:1;$WT:$T3(-25px,0,0);$TF:$T3(-25px,0,0)}';
	ar.css._css_ += '75%{$WT:$T3(10px,0,0);$TF:$T3(10px,0,0)}';
	ar.css._css_ += '90%{$WT:$T3(-5px,0,0);$TF:$T3(-5px,0,0)}';
	ar.css._css_ += 'to{$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '.bounceInRight{$WA:bounceInRight;$AN:bounceInRight}';
	ar.css._css_ += '$WK bounceInUp{0%,60%,75%,90%,to{$WF:#CB(.215,.61,.355,1);$AT:#CB(.215,.61,.355,1)}';
	ar.css._css_ += '0%{opacity:0;$WT:$T3(0,3000px,0);$TF:$T3(0,3000px,0)}';
	ar.css._css_ += '60%{opacity:1;$WT:$T3(0,-20px,0);$TF:$T3(0,-20px,0)}';
	ar.css._css_ += '75%{$WT:$T3(0,10px,0);$TF:$T3(0,10px,0)}';
	ar.css._css_ += '90%{$WT:$T3(0,-5px,0);$TF:$T3(0,-5px,0)}';
	ar.css._css_ += 'to{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF bounceInUp{0%,60%,75%,90%,to{$WF:#CB(.215,.61,.355,1);$AT:#CB(.215,.61,.355,1)}';
	ar.css._css_ += '0%{opacity:0;$WT:$T3(0,3000px,0);$TF:$T3(0,3000px,0)}';
	ar.css._css_ += '60%{opacity:1;$WT:$T3(0,-20px,0);$TF:$T3(0,-20px,0)}';
	ar.css._css_ += '75%{$WT:$T3(0,10px,0);$TF:$T3(0,10px,0)}';
	ar.css._css_ += '90%{$WT:$T3(0,-5px,0);$TF:$T3(0,-5px,0)}';
	ar.css._css_ += 'to{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.bounceInUp{$WA:bounceInUp;$AN:bounceInUp}';
	ar.css._css_ += '$WK bounceOut{20%{$WT:$S3(.9,.9,.9);$TF:$S3(.9,.9,.9)}';
	ar.css._css_ += '50%,55%{opacity:1;$WT:$S3(1.1,1.1,1.1);$TF:$S3(1.1,1.1,1.1)}';
	ar.css._css_ += 'to{opacity:0;$WT:$S3(.3,.3,.3);$TF:$S3(.3,.3,.3)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF bounceOut{20%{$WT:$S3(.9,.9,.9);$TF:$S3(.9,.9,.9)}';
	ar.css._css_ += '50%,55%{opacity:1;$WT:$S3(1.1,1.1,1.1);$TF:$S3(1.1,1.1,1.1)}';
	ar.css._css_ += 'to{opacity:0;$WT:$S3(.3,.3,.3);$TF:$S3(.3,.3,.3)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.bounceOut{$WA:bounceOut;$AN:bounceOut}';
	ar.css._css_ += '$WK bounceOutDown{20%{$WT:$T3(0,10px,0);$TF:$T3(0,10px,0)}';
	ar.css._css_ += '40%,45%{opacity:1;$WT:$T3(0,-20px,0);$TF:$T3(0,-20px,0)}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(0,2000px,0);$TF:$T3(0,2000px,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF bounceOutDown{20%{$WT:$T3(0,10px,0);$TF:$T3(0,10px,0)}';
	ar.css._css_ += '40%,45%{opacity:1;$WT:$T3(0,-20px,0);$TF:$T3(0,-20px,0)}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(0,2000px,0);$TF:$T3(0,2000px,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.bounceOutDown{$WA:bounceOutDown;$AN:bounceOutDown}';
	ar.css._css_ += '$WK bounceOutLeft{20%{opacity:1;$WT:$T3(20px,0,0);$TF:$T3(20px,0,0)}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(-2000px,0,0);$TF:$T3(-2000px,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF bounceOutLeft{20%{opacity:1;$WT:$T3(20px,0,0);$TF:$T3(20px,0,0)}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(-2000px,0,0);$TF:$T3(-2000px,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.bounceOutLeft{$WA:bounceOutLeft;$AN:bounceOutLeft}';
	ar.css._css_ += '$WK bounceOutRight{20%{opacity:1;$WT:$T3(-20px,0,0);$TF:$T3(-20px,0,0)}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(2000px,0,0);$TF:$T3(2000px,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF bounceOutRight{20%{opacity:1;$WT:$T3(-20px,0,0);$TF:$T3(-20px,0,0)}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(2000px,0,0);$TF:$T3(2000px,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.bounceOutRight{$WA:bounceOutRight;$AN:bounceOutRight}';
	ar.css._css_ += '$WK bounceOutUp{20%{$WT:$T3(0,-10px,0);$TF:$T3(0,-10px,0)}';
	ar.css._css_ += '40%,45%{opacity:1;$WT:$T3(0,20px,0);$TF:$T3(0,20px,0)}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(0,-2000px,0);$TF:$T3(0,-2000px,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF bounceOutUp{20%{$WT:$T3(0,-10px,0);$TF:$T3(0,-10px,0)}';
	ar.css._css_ += '40%,45%{opacity:1;$WT:$T3(0,20px,0);$TF:$T3(0,20px,0)}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(0,-2000px,0);$TF:$T3(0,-2000px,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.bounceOutUp{$WA:bounceOutUp;$AN:bounceOutUp}';
	ar.css._css_ += '$WK fadeIn{0%{opacity:0}';
	ar.css._css_ += 'to{opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeIn{0%{opacity:0}';
	ar.css._css_ += 'to{opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeIn{$WA:fadeIn;$AN:fadeIn}';
	ar.css._css_ += '$WK fadeInDown{0%{opacity:0;$WT:$T3(0,-100%,0);$TF:$T3(0,-100%,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeInDown{0%{opacity:0;$WT:$T3(0,-100%,0);$TF:$T3(0,-100%,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeInDown{$WA:fadeInDown;$AN:fadeInDown}';
	ar.css._css_ += '$WK fadeInDownBig{0%{opacity:0;$WT:$T3(0,-2000px,0);$TF:$T3(0,-2000px,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeInDownBig{0%{opacity:0;$WT:$T3(0,-2000px,0);$TF:$T3(0,-2000px,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeInDownBig{$WA:fadeInDownBig;$AN:fadeInDownBig}';
	ar.css._css_ += '$WK fadeInLeft{0%{opacity:0;$WT:$T3(-100%,0,0);$TF:$T3(-100%,0,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeInLeft{0%{opacity:0;$WT:$T3(-100%,0,0);$TF:$T3(-100%,0,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeInLeft{$WA:fadeInLeft;$AN:fadeInLeft}';
	ar.css._css_ += '$WK fadeInLeftBig{0%{opacity:0;$WT:$T3(-2000px,0,0);$TF:$T3(-2000px,0,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeInLeftBig{0%{opacity:0;$WT:$T3(-2000px,0,0);$TF:$T3(-2000px,0,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeInLeftBig{$WA:fadeInLeftBig;$AN:fadeInLeftBig}';
	ar.css._css_ += '$WK fadeInRight{0%{opacity:0;$WT:$T3(100%,0,0);$TF:$T3(100%,0,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeInRight{0%{opacity:0;$WT:$T3(100%,0,0);$TF:$T3(100%,0,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeInRight{$WA:fadeInRight;$AN:fadeInRight}';
	ar.css._css_ += '$WK fadeInRightBig{0%{opacity:0;$WT:$T3(2000px,0,0);$TF:$T3(2000px,0,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeInRightBig{0%{opacity:0;$WT:$T3(2000px,0,0);$TF:$T3(2000px,0,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeInRightBig{$WA:fadeInRightBig;$AN:fadeInRightBig}';
	ar.css._css_ += '$WK fadeInUp{0%{opacity:0;$WT:$T3(0,100%,0);$TF:$T3(0,100%,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeInUp{0%{opacity:0;$WT:$T3(0,100%,0);$TF:$T3(0,100%,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeInUp{$WA:fadeInUp;$AN:fadeInUp}';
	ar.css._css_ += '$WK fadeInUpBig{0%{opacity:0;$WT:$T3(0,2000px,0);$TF:$T3(0,2000px,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeInUpBig{0%{opacity:0;$WT:$T3(0,2000px,0);$TF:$T3(0,2000px,0)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeInUpBig{$WA:fadeInUpBig;$AN:fadeInUpBig}';
	ar.css._css_ += '$WK fadeOut{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeOut{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeOut{$WA:fadeOut;$AN:fadeOut}';
	ar.css._css_ += '$WK fadeOutDown{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(0,100%,0);$TF:$T3(0,100%,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeOutDown{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(0,100%,0);$TF:$T3(0,100%,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeOutDown{$WA:fadeOutDown;$AN:fadeOutDown}';
	ar.css._css_ += '$WK fadeOutDownBig{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(0,2000px,0);$TF:$T3(0,2000px,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeOutDownBig{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(0,2000px,0);$TF:$T3(0,2000px,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeOutDownBig{$WA:fadeOutDownBig;$AN:fadeOutDownBig}';
	ar.css._css_ += '$WK fadeOutLeft{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(-100%,0,0);$TF:$T3(-100%,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeOutLeft{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(-100%,0,0);$TF:$T3(-100%,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeOutLeft{$WA:fadeOutLeft;$AN:fadeOutLeft}';
	ar.css._css_ += '$WK fadeOutLeftBig{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(-2000px,0,0);$TF:$T3(-2000px,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeOutLeftBig{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(-2000px,0,0);$TF:$T3(-2000px,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeOutLeftBig{$WA:fadeOutLeftBig;$AN:fadeOutLeftBig}';
	ar.css._css_ += '$WK fadeOutRight{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(100%,0,0);$TF:$T3(100%,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeOutRight{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(100%,0,0);$TF:$T3(100%,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeOutRight{$WA:fadeOutRight;$AN:fadeOutRight}';
	ar.css._css_ += '$WK fadeOutRightBig{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(2000px,0,0);$TF:$T3(2000px,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeOutRightBig{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(2000px,0,0);$TF:$T3(2000px,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeOutRightBig{$WA:fadeOutRightBig;$AN:fadeOutRightBig}';
	ar.css._css_ += '$WK fadeOutUp{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(0,-100%,0);$TF:$T3(0,-100%,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeOutUp{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(0,-100%,0);$TF:$T3(0,-100%,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeOutUp{$WA:fadeOutUp;$AN:fadeOutUp}';
	ar.css._css_ += '$WK fadeOutUpBig{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(0,-2000px,0);$TF:$T3(0,-2000px,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF fadeOutUpBig{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(0,-2000px,0);$TF:$T3(0,-2000px,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.fadeOutUpBig{$WA:fadeOutUpBig;$AN:fadeOutUpBig}';
	ar.css._css_ += '$WK flip{0%{$WT:$PS(400px) #RY(-1turn);$TF:$PS(400px) #RY(-1turn)}';
	ar.css._css_ += '0%,40%{$WF:ease-out;$AT:ease-out}';
	ar.css._css_ += '40%{$WT:$PS(400px) $TZ(150px) #RY(-190deg);$TF:$PS(400px) $TZ(150px) #RY(-190deg)}';
	ar.css._css_ += '50%{$WT:$PS(400px) $TZ(150px) #RY(-170deg);$TF:$PS(400px) $TZ(150px) #RY(-170deg)}';
	ar.css._css_ += '50%,80%{$WF:ease-in;$AT:ease-in}';
	ar.css._css_ += '80%{$WT:$PS(400px) $S3(.95,.95,.95);$TF:$PS(400px) $S3(.95,.95,.95)}';
	ar.css._css_ += 'to{$WT:$PS(400px);$TF:$PS(400px);$WF:ease-in;$AT:ease-in}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF flip{0%{$WT:$PS(400px) #RY(-1turn);$TF:$PS(400px) #RY(-1turn)}';
	ar.css._css_ += '0%,40%{$WF:ease-out;$AT:ease-out}';
	ar.css._css_ += '40%{$WT:$PS(400px) $TZ(150px) #RY(-190deg);$TF:$PS(400px) $TZ(150px) #RY(-190deg)}';
	ar.css._css_ += '50%{$WT:$PS(400px) $TZ(150px) #RY(-170deg);$TF:$PS(400px) $TZ(150px) #RY(-170deg)}';
	ar.css._css_ += '50%,80%{$WF:ease-in;$AT:ease-in}';
	ar.css._css_ += '80%{$WT:$PS(400px) $S3(.95,.95,.95);$TF:$PS(400px) $S3(.95,.95,.95)}';
	ar.css._css_ += 'to{$WT:$PS(400px);$TF:$PS(400px);$WF:ease-in;$AT:ease-in}';
	ar.css._css_ += '}';
	ar.css._css_ += '.animated.flip{-webkit-backface-visibility:visible;backface-visibility:visible;$WA:flip;$AN:flip}';
	ar.css._css_ += '$WK flipInX{0%{$WT:$PS(400px) #RX(90deg);$TF:$PS(400px) #RX(90deg);opacity:0}';
	ar.css._css_ += '0%,40%{$WF:ease-in;$AT:ease-in}';
	ar.css._css_ += '40%{$WT:$PS(400px) #RX(-20deg);$TF:$PS(400px) #RX(-20deg)}';
	ar.css._css_ += '60%{$WT:$PS(400px) #RX(10deg);$TF:$PS(400px) #RX(10deg);opacity:1}';
	ar.css._css_ += '80%{$WT:$PS(400px) #RX(-5deg);$TF:$PS(400px) #RX(-5deg)}';
	ar.css._css_ += 'to{$WT:$PS(400px);$TF:$PS(400px)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF flipInX{0%{$WT:$PS(400px) #RX(90deg);$TF:$PS(400px) #RX(90deg);opacity:0}';
	ar.css._css_ += '0%,40%{$WF:ease-in;$AT:ease-in}';
	ar.css._css_ += '40%{$WT:$PS(400px) #RX(-20deg);$TF:$PS(400px) #RX(-20deg)}';
	ar.css._css_ += '60%{$WT:$PS(400px) #RX(10deg);$TF:$PS(400px) #RX(10deg);opacity:1}';
	ar.css._css_ += '80%{$WT:$PS(400px) #RX(-5deg);$TF:$PS(400px) #RX(-5deg)}';
	ar.css._css_ += 'to{$WT:$PS(400px);$TF:$PS(400px)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.flipInX{-webkit-backface-visibility:visible!important;backface-visibility:visible!important;$WA:flipInX;$AN:flipInX}';
	ar.css._css_ += '$WK flipInY{0%{$WT:$PS(400px) #RY(90deg);$TF:$PS(400px) #RY(90deg);opacity:0}';
	ar.css._css_ += '0%,40%{$WF:ease-in;$AT:ease-in}';
	ar.css._css_ += '40%{$WT:$PS(400px) #RY(-20deg);$TF:$PS(400px) #RY(-20deg)}';
	ar.css._css_ += '60%{$WT:$PS(400px) #RY(10deg);$TF:$PS(400px) #RY(10deg);opacity:1}';
	ar.css._css_ += '80%{$WT:$PS(400px) #RY(-5deg);$TF:$PS(400px) #RY(-5deg)}';
	ar.css._css_ += 'to{$WT:$PS(400px);$TF:$PS(400px)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF flipInY{0%{$WT:$PS(400px) #RY(90deg);$TF:$PS(400px) #RY(90deg);opacity:0}';
	ar.css._css_ += '0%,40%{$WF:ease-in;$AT:ease-in}';
	ar.css._css_ += '40%{$WT:$PS(400px) #RY(-20deg);$TF:$PS(400px) #RY(-20deg)}';
	ar.css._css_ += '60%{$WT:$PS(400px) #RY(10deg);$TF:$PS(400px) #RY(10deg);opacity:1}';
	ar.css._css_ += '80%{$WT:$PS(400px) #RY(-5deg);$TF:$PS(400px) #RY(-5deg)}';
	ar.css._css_ += 'to{$WT:$PS(400px);$TF:$PS(400px)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.flipInY{-webkit-backface-visibility:visible!important;backface-visibility:visible!important;$WA:flipInY;$AN:flipInY}';
	ar.css._css_ += '$WK flipOutX{0%{$WT:$PS(400px);$TF:$PS(400px)}';
	ar.css._css_ += '30%{$WT:$PS(400px) #RX(-20deg);$TF:$PS(400px) #RX(-20deg);opacity:1}';
	ar.css._css_ += 'to{$WT:$PS(400px) #RX(90deg);$TF:$PS(400px) #RX(90deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF flipOutX{0%{$WT:$PS(400px);$TF:$PS(400px)}';
	ar.css._css_ += '30%{$WT:$PS(400px) #RX(-20deg);$TF:$PS(400px) #RX(-20deg);opacity:1}';
	ar.css._css_ += 'to{$WT:$PS(400px) #RX(90deg);$TF:$PS(400px) #RX(90deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '.flipOutX{$WA:flipOutX;$AN:flipOutX;-webkit-backface-visibility:visible!important;backface-visibility:visible!important}';
	ar.css._css_ += '$WK flipOutY{0%{$WT:$PS(400px);$TF:$PS(400px)}';
	ar.css._css_ += '30%{$WT:$PS(400px) #RY(-15deg);$TF:$PS(400px) #RY(-15deg);opacity:1}';
	ar.css._css_ += 'to{$WT:$PS(400px) #RY(90deg);$TF:$PS(400px) #RY(90deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF flipOutY{0%{$WT:$PS(400px);$TF:$PS(400px)}';
	ar.css._css_ += '30%{$WT:$PS(400px) #RY(-15deg);$TF:$PS(400px) #RY(-15deg);opacity:1}';
	ar.css._css_ += 'to{$WT:$PS(400px) #RY(90deg);$TF:$PS(400px) #RY(90deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '.flipOutY{-webkit-backface-visibility:visible!important;backface-visibility:visible!important;$WA:flipOutY;$AN:flipOutY}';
	ar.css._css_ += '$WK lightSpeedIn{0%{$WT:$T3(100%,0,0) #SX(-30deg);$TF:$T3(100%,0,0) #SX(-30deg);opacity:0}';
	ar.css._css_ += '60%{$WT:#SX(20deg);$TF:#SX(20deg)}';
	ar.css._css_ += '60%,80%{opacity:1}';
	ar.css._css_ += '80%{$WT:#SX(-5deg);$TF:#SX(-5deg)}';
	ar.css._css_ += 'to{$WT:none;$TF:none;opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF lightSpeedIn{0%{$WT:$T3(100%,0,0) #SX(-30deg);$TF:$T3(100%,0,0) #SX(-30deg);opacity:0}';
	ar.css._css_ += '60%{$WT:#SX(20deg);$TF:#SX(20deg)}';
	ar.css._css_ += '60%,80%{opacity:1}';
	ar.css._css_ += '80%{$WT:#SX(-5deg);$TF:#SX(-5deg)}';
	ar.css._css_ += 'to{$WT:none;$TF:none;opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '.lightSpeedIn{$WA:lightSpeedIn;$AN:lightSpeedIn;$WF:ease-out;$AT:ease-out}';
	ar.css._css_ += '$WK lightSpeedOut{0%{opacity:1}';
	ar.css._css_ += 'to{$WT:$T3(100%,0,0) #SX(30deg);$TF:$T3(100%,0,0) #SX(30deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF lightSpeedOut{0%{opacity:1}';
	ar.css._css_ += 'to{$WT:$T3(100%,0,0) #SX(30deg);$TF:$T3(100%,0,0) #SX(30deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '.lightSpeedOut{$WA:lightSpeedOut;$AN:lightSpeedOut;$WF:ease-in;$AT:ease-in}';
	ar.css._css_ += '$WK #RIn{0%{$TFO:center;$WT:#R(-200deg);$TF:#R(-200deg);opacity:0}';
	ar.css._css_ += '0%,to{$WTO:center}';
	ar.css._css_ += 'to{$TFO:center;$WT:none;$TF:none;opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF #RIn{0%{$TFO:center;$WT:#R(-200deg);$TF:#R(-200deg);opacity:0}';
	ar.css._css_ += '0%,to{$WTO:center}';
	ar.css._css_ += 'to{$TFO:center;$WT:none;$TF:none;opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '.#RIn{$WA:#RIn;$AN:#RIn}';
	ar.css._css_ += '$WK #RInDownLeft{0%{$TFO:left bottom;$WT:#R(-45deg);$TF:#R(-45deg);opacity:0}';
	ar.css._css_ += '0%,to{$WTO:left bottom}';
	ar.css._css_ += 'to{$TFO:left bottom;$WT:none;$TF:none;opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF #RInDownLeft{0%{$TFO:left bottom;$WT:#R(-45deg);$TF:#R(-45deg);opacity:0}';
	ar.css._css_ += '0%,to{$WTO:left bottom}';
	ar.css._css_ += 'to{$TFO:left bottom;$WT:none;$TF:none;opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '.#RInDownLeft{$WA:#RInDownLeft;$AN:#RInDownLeft}';
	ar.css._css_ += '$WK #RInDownRight{0%{$TFO:right bottom;$WT:#R(45deg);$TF:#R(45deg);opacity:0}';
	ar.css._css_ += '0%,to{$WTO:right bottom}';
	ar.css._css_ += 'to{$TFO:right bottom;$WT:none;$TF:none;opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF #RInDownRight{0%{$TFO:right bottom;$WT:#R(45deg);$TF:#R(45deg);opacity:0}';
	ar.css._css_ += '0%,to{$WTO:right bottom}';
	ar.css._css_ += 'to{$TFO:right bottom;$WT:none;$TF:none;opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '.#RInDownRight{$WA:#RInDownRight;$AN:#RInDownRight}';
	ar.css._css_ += '$WK #RInUpLeft{0%{$TFO:left bottom;$WT:#R(45deg);$TF:#R(45deg);opacity:0}';
	ar.css._css_ += '0%,to{$WTO:left bottom}';
	ar.css._css_ += 'to{$TFO:left bottom;$WT:none;$TF:none;opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF #RInUpLeft{0%{$TFO:left bottom;$WT:#R(45deg);$TF:#R(45deg);opacity:0}';
	ar.css._css_ += '0%,to{$WTO:left bottom}';
	ar.css._css_ += 'to{$TFO:left bottom;$WT:none;$TF:none;opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '.#RInUpLeft{$WA:#RInUpLeft;$AN:#RInUpLeft}';
	ar.css._css_ += '$WK #RInUpRight{0%{$TFO:right bottom;$WT:#R(-90deg);$TF:#R(-90deg);opacity:0}';
	ar.css._css_ += '0%,to{$WTO:right bottom}';
	ar.css._css_ += 'to{$TFO:right bottom;$WT:none;$TF:none;opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF #RInUpRight{0%{$TFO:right bottom;$WT:#R(-90deg);$TF:#R(-90deg);opacity:0}';
	ar.css._css_ += '0%,to{$WTO:right bottom}';
	ar.css._css_ += 'to{$TFO:right bottom;$WT:none;$TF:none;opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '.#RInUpRight{$WA:#RInUpRight;$AN:#RInUpRight}';
	ar.css._css_ += '$WK #ROut{0%{$TFO:center;opacity:1}';
	ar.css._css_ += '0%,to{$WTO:center}';
	ar.css._css_ += 'to{$TFO:center;$WT:#R(200deg);$TF:#R(200deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF #ROut{0%{$TFO:center;opacity:1}';
	ar.css._css_ += '0%,to{$WTO:center}';
	ar.css._css_ += 'to{$TFO:center;$WT:#R(200deg);$TF:#R(200deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '.#ROut{$WA:#ROut;$AN:#ROut}';
	ar.css._css_ += '$WK #ROutDownLeft{0%{$TFO:left bottom;opacity:1}';
	ar.css._css_ += '0%,to{$WTO:left bottom}';
	ar.css._css_ += 'to{$TFO:left bottom;$WT:#R(45deg);$TF:#R(45deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF #ROutDownLeft{0%{$TFO:left bottom;opacity:1}';
	ar.css._css_ += '0%,to{$WTO:left bottom}';
	ar.css._css_ += 'to{$TFO:left bottom;$WT:#R(45deg);$TF:#R(45deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '.#ROutDownLeft{$WA:#ROutDownLeft;$AN:#ROutDownLeft}';
	ar.css._css_ += '$WK #ROutDownRight{0%{$TFO:right bottom;opacity:1}';
	ar.css._css_ += '0%,to{$WTO:right bottom}';
	ar.css._css_ += 'to{$TFO:right bottom;$WT:#R(-45deg);$TF:#R(-45deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF #ROutDownRight{0%{$TFO:right bottom;opacity:1}';
	ar.css._css_ += '0%,to{$WTO:right bottom}';
	ar.css._css_ += 'to{$TFO:right bottom;$WT:#R(-45deg);$TF:#R(-45deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '.#ROutDownRight{$WA:#ROutDownRight;$AN:#ROutDownRight}';
	ar.css._css_ += '$WK #ROutUpLeft{0%{$TFO:left bottom;opacity:1}';
	ar.css._css_ += '0%,to{$WTO:left bottom}';
	ar.css._css_ += 'to{$TFO:left bottom;$WT:#R(-45deg);$TF:#R(-45deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF #ROutUpLeft{0%{$TFO:left bottom;opacity:1}';
	ar.css._css_ += '0%,to{$WTO:left bottom}';
	ar.css._css_ += 'to{$TFO:left bottom;$WT:#R(-45deg);$TF:#R(-45deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '.#ROutUpLeft{$WA:#ROutUpLeft;$AN:#ROutUpLeft}';
	ar.css._css_ += '$WK #ROutUpRight{0%{$TFO:right bottom;opacity:1}';
	ar.css._css_ += '0%,to{$WTO:right bottom}';
	ar.css._css_ += 'to{$TFO:right bottom;$WT:#R(90deg);$TF:#R(90deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF #ROutUpRight{0%{$TFO:right bottom;opacity:1}';
	ar.css._css_ += '0%,to{$WTO:right bottom}';
	ar.css._css_ += 'to{$TFO:right bottom;$WT:#R(90deg);$TF:#R(90deg);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '.#ROutUpRight{$WA:#ROutUpRight;$AN:#ROutUpRight}';
	ar.css._css_ += '$WK hinge{0%{$TFO:top left}';
	ar.css._css_ += '0%,20%,60%{$WTO:top left;$WF:ease-in-out;$AT:ease-in-out}';
	ar.css._css_ += '20%,60%{$WT:#R(80deg);$TF:#R(80deg);$TFO:top left}';
	ar.css._css_ += '40%,80%{$WT:#R(60deg);$TF:#R(60deg);$WTO:top left;$TFO:top left;$WF:ease-in-out;$AT:ease-in-out;opacity:1}';
	ar.css._css_ += 'to{$WT:$T3(0,700px,0);$TF:$T3(0,700px,0);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF hinge{0%{$TFO:top left}';
	ar.css._css_ += '0%,20%,60%{$WTO:top left;$WF:ease-in-out;$AT:ease-in-out}';
	ar.css._css_ += '20%,60%{$WT:#R(80deg);$TF:#R(80deg);$TFO:top left}';
	ar.css._css_ += '40%,80%{$WT:#R(60deg);$TF:#R(60deg);$WTO:top left;$TFO:top left;$WF:ease-in-out;$AT:ease-in-out;opacity:1}';
	ar.css._css_ += 'to{$WT:$T3(0,700px,0);$TF:$T3(0,700px,0);opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '.hinge{$WA:hinge;$AN:hinge}';
	ar.css._css_ += '$WK rollIn{0%{opacity:0;$WT:$T3(-100%,0,0) #R(-120deg);$TF:$T3(-100%,0,0) #R(-120deg)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF rollIn{0%{opacity:0;$WT:$T3(-100%,0,0) #R(-120deg);$TF:$T3(-100%,0,0) #R(-120deg)}';
	ar.css._css_ += 'to{opacity:1;$WT:none;$TF:none}';
	ar.css._css_ += '}';
	ar.css._css_ += '.rollIn{$WA:rollIn;$AN:rollIn}';
	ar.css._css_ += '$WK rollOut{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(100%,0,0) #R(120deg);$TF:$T3(100%,0,0) #R(120deg)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF rollOut{0%{opacity:1}';
	ar.css._css_ += 'to{opacity:0;$WT:$T3(100%,0,0) #R(120deg);$TF:$T3(100%,0,0) #R(120deg)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.rollOut{$WA:rollOut;$AN:rollOut}';
	ar.css._css_ += '$WK zoomIn{0%{opacity:0;$WT:$S3(.3,.3,.3);$TF:$S3(.3,.3,.3)}';
	ar.css._css_ += '50%{opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF zoomIn{0%{opacity:0;$WT:$S3(.3,.3,.3);$TF:$S3(.3,.3,.3)}';
	ar.css._css_ += '50%{opacity:1}';
	ar.css._css_ += '}';
	ar.css._css_ += '.zoomIn{$WA:zoomIn;$AN:zoomIn}';
	ar.css._css_ += '$WK zoomInDown{0%{opacity:0;$WT:$S3(.1,.1,.1) $T3(0,-1000px,0);$TF:$S3(.1,.1,.1) $T3(0,-1000px,0);$WF:#CB(.55,.055,.675,.19);$AT:#CB(.55,.055,.675,.19)}';
	ar.css._css_ += '60%{opacity:1;$WT:$S3(.475,.475,.475) $T3(0,60px,0);$TF:$S3(.475,.475,.475) $T3(0,60px,0);$WF:#CB(.175,.885,.32,1);$AT:#CB(.175,.885,.32,1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF zoomInDown{0%{opacity:0;$WT:$S3(.1,.1,.1) $T3(0,-1000px,0);$TF:$S3(.1,.1,.1) $T3(0,-1000px,0);$WF:#CB(.55,.055,.675,.19);$AT:#CB(.55,.055,.675,.19)}';
	ar.css._css_ += '60%{opacity:1;$WT:$S3(.475,.475,.475) $T3(0,60px,0);$TF:$S3(.475,.475,.475) $T3(0,60px,0);$WF:#CB(.175,.885,.32,1);$AT:#CB(.175,.885,.32,1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.zoomInDown{$WA:zoomInDown;$AN:zoomInDown}';
	ar.css._css_ += '$WK zoomInLeft{0%{opacity:0;$WT:$S3(.1,.1,.1) $T3(-1000px,0,0);$TF:$S3(.1,.1,.1) $T3(-1000px,0,0);$WF:#CB(.55,.055,.675,.19);$AT:#CB(.55,.055,.675,.19)}';
	ar.css._css_ += '60%{opacity:1;$WT:$S3(.475,.475,.475) $T3(10px,0,0);$TF:$S3(.475,.475,.475) $T3(10px,0,0);$WF:#CB(.175,.885,.32,1);$AT:#CB(.175,.885,.32,1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF zoomInLeft{0%{opacity:0;$WT:$S3(.1,.1,.1) $T3(-1000px,0,0);$TF:$S3(.1,.1,.1) $T3(-1000px,0,0);$WF:#CB(.55,.055,.675,.19);$AT:#CB(.55,.055,.675,.19)}';
	ar.css._css_ += '60%{opacity:1;$WT:$S3(.475,.475,.475) $T3(10px,0,0);$TF:$S3(.475,.475,.475) $T3(10px,0,0);$WF:#CB(.175,.885,.32,1);$AT:#CB(.175,.885,.32,1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.zoomInLeft{$WA:zoomInLeft;$AN:zoomInLeft}';
	ar.css._css_ += '$WK zoomInRight{0%{opacity:0;$WT:$S3(.1,.1,.1) $T3(1000px,0,0);$TF:$S3(.1,.1,.1) $T3(1000px,0,0);$WF:#CB(.55,.055,.675,.19);$AT:#CB(.55,.055,.675,.19)}';
	ar.css._css_ += '60%{opacity:1;$WT:$S3(.475,.475,.475) $T3(-10px,0,0);$TF:$S3(.475,.475,.475) $T3(-10px,0,0);$WF:#CB(.175,.885,.32,1);$AT:#CB(.175,.885,.32,1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF zoomInRight{0%{opacity:0;$WT:$S3(.1,.1,.1) $T3(1000px,0,0);$TF:$S3(.1,.1,.1) $T3(1000px,0,0);$WF:#CB(.55,.055,.675,.19);$AT:#CB(.55,.055,.675,.19)}';
	ar.css._css_ += '60%{opacity:1;$WT:$S3(.475,.475,.475) $T3(-10px,0,0);$TF:$S3(.475,.475,.475) $T3(-10px,0,0);$WF:#CB(.175,.885,.32,1);$AT:#CB(.175,.885,.32,1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.zoomInRight{$WA:zoomInRight;$AN:zoomInRight}';
	ar.css._css_ += '$WK zoomInUp{0%{opacity:0;$WT:$S3(.1,.1,.1) $T3(0,1000px,0);$TF:$S3(.1,.1,.1) $T3(0,1000px,0);$WF:#CB(.55,.055,.675,.19);$AT:#CB(.55,.055,.675,.19)}';
	ar.css._css_ += '60%{opacity:1;$WT:$S3(.475,.475,.475) $T3(0,-60px,0);$TF:$S3(.475,.475,.475) $T3(0,-60px,0);$WF:#CB(.175,.885,.32,1);$AT:#CB(.175,.885,.32,1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF zoomInUp{0%{opacity:0;$WT:$S3(.1,.1,.1) $T3(0,1000px,0);$TF:$S3(.1,.1,.1) $T3(0,1000px,0);$WF:#CB(.55,.055,.675,.19);$AT:#CB(.55,.055,.675,.19)}';
	ar.css._css_ += '60%{opacity:1;$WT:$S3(.475,.475,.475) $T3(0,-60px,0);$TF:$S3(.475,.475,.475) $T3(0,-60px,0);$WF:#CB(.175,.885,.32,1);$AT:#CB(.175,.885,.32,1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.zoomInUp{$WA:zoomInUp;$AN:zoomInUp}';
	ar.css._css_ += '$WK zoomOut{0%{opacity:1}';
	ar.css._css_ += '50%{$WT:$S3(.3,.3,.3);$TF:$S3(.3,.3,.3)}';
	ar.css._css_ += '50%,to{opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF zoomOut{0%{opacity:1}';
	ar.css._css_ += '50%{$WT:$S3(.3,.3,.3);$TF:$S3(.3,.3,.3)}';
	ar.css._css_ += '50%,to{opacity:0}';
	ar.css._css_ += '}';
	ar.css._css_ += '.zoomOut{$WA:zoomOut;$AN:zoomOut}';
	ar.css._css_ += '$WK zoomOutDown{40%{opacity:1;$WT:$S3(.475,.475,.475) $T3(0,-60px,0);$TF:$S3(.475,.475,.475) $T3(0,-60px,0);$WF:#CB(.55,.055,.675,.19);$AT:#CB(.55,.055,.675,.19)}';
	ar.css._css_ += 'to{opacity:0;$WT:$S3(.1,.1,.1) $T3(0,2000px,0);$TF:$S3(.1,.1,.1) $T3(0,2000px,0);$WTO:center bottom;$TFO:center bottom;$WF:#CB(.175,.885,.32,1);$AT:#CB(.175,.885,.32,1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF zoomOutDown{40%{opacity:1;$WT:$S3(.475,.475,.475) $T3(0,-60px,0);$TF:$S3(.475,.475,.475) $T3(0,-60px,0);$WF:#CB(.55,.055,.675,.19);$AT:#CB(.55,.055,.675,.19)}';
	ar.css._css_ += 'to{opacity:0;$WT:$S3(.1,.1,.1) $T3(0,2000px,0);$TF:$S3(.1,.1,.1) $T3(0,2000px,0);$WTO:center bottom;$TFO:center bottom;$WF:#CB(.175,.885,.32,1);$AT:#CB(.175,.885,.32,1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.zoomOutDown{$WA:zoomOutDown;$AN:zoomOutDown}';
	ar.css._css_ += '$WK zoomOutLeft{40%{opacity:1;$WT:$S3(.475,.475,.475) $T3(42px,0,0);$TF:$S3(.475,.475,.475) $T3(42px,0,0)}';
	ar.css._css_ += 'to{opacity:0;$WT:scale(.1) $T3(-2000px,0,0);$TF:scale(.1) $T3(-2000px,0,0);$WTO:left center;$TFO:left center}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF zoomOutLeft{40%{opacity:1;$WT:$S3(.475,.475,.475) $T3(42px,0,0);$TF:$S3(.475,.475,.475) $T3(42px,0,0)}';
	ar.css._css_ += 'to{opacity:0;$WT:scale(.1) $T3(-2000px,0,0);$TF:scale(.1) $T3(-2000px,0,0);$WTO:left center;$TFO:left center}';
	ar.css._css_ += '}';
	ar.css._css_ += '.zoomOutLeft{$WA:zoomOutLeft;$AN:zoomOutLeft}';
	ar.css._css_ += '$WK zoomOutRight{40%{opacity:1;$WT:$S3(.475,.475,.475) $T3(-42px,0,0);$TF:$S3(.475,.475,.475) $T3(-42px,0,0)}';
	ar.css._css_ += 'to{opacity:0;$WT:scale(.1) $T3(2000px,0,0);$TF:scale(.1) $T3(2000px,0,0);$WTO:right center;$TFO:right center}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF zoomOutRight{40%{opacity:1;$WT:$S3(.475,.475,.475) $T3(-42px,0,0);$TF:$S3(.475,.475,.475) $T3(-42px,0,0)}';
	ar.css._css_ += 'to{opacity:0;$WT:scale(.1) $T3(2000px,0,0);$TF:scale(.1) $T3(2000px,0,0);$WTO:right center;$TFO:right center}';
	ar.css._css_ += '}';
	ar.css._css_ += '.zoomOutRight{$WA:zoomOutRight;$AN:zoomOutRight}';
	ar.css._css_ += '$WK zoomOutUp{40%{opacity:1;$WT:$S3(.475,.475,.475) $T3(0,60px,0);$TF:$S3(.475,.475,.475) $T3(0,60px,0);$WF:#CB(.55,.055,.675,.19);$AT:#CB(.55,.055,.675,.19)}';
	ar.css._css_ += 'to{opacity:0;$WT:$S3(.1,.1,.1) $T3(0,-2000px,0);$TF:$S3(.1,.1,.1) $T3(0,-2000px,0);$WTO:center bottom;$TFO:center bottom;$WF:#CB(.175,.885,.32,1);$AT:#CB(.175,.885,.32,1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF zoomOutUp{40%{opacity:1;$WT:$S3(.475,.475,.475) $T3(0,60px,0);$TF:$S3(.475,.475,.475) $T3(0,60px,0);$WF:#CB(.55,.055,.675,.19);$AT:#CB(.55,.055,.675,.19)}';
	ar.css._css_ += 'to{opacity:0;$WT:$S3(.1,.1,.1) $T3(0,-2000px,0);$TF:$S3(.1,.1,.1) $T3(0,-2000px,0);$WTO:center bottom;$TFO:center bottom;$WF:#CB(.175,.885,.32,1);$AT:#CB(.175,.885,.32,1)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.zoomOutUp{$WA:zoomOutUp;$AN:zoomOutUp}';
	ar.css._css_ += '$WK slideInDown{0%{$WT:$T3(0,-100%,0);$TF:$T3(0,-100%,0);visibility:visible}';
	ar.css._css_ += 'to{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF slideInDown{0%{$WT:$T3(0,-100%,0);$TF:$T3(0,-100%,0);visibility:visible}';
	ar.css._css_ += 'to{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.slideInDown{$WA:slideInDown;$AN:slideInDown}';
	ar.css._css_ += '$WK slideInLeft{0%{$WT:$T3(-100%,0,0);$TF:$T3(-100%,0,0);visibility:visible}';
	ar.css._css_ += 'to{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF slideInLeft{0%{$WT:$T3(-100%,0,0);$TF:$T3(-100%,0,0);visibility:visible}';
	ar.css._css_ += 'to{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.slideInLeft{$WA:slideInLeft;$AN:slideInLeft}';
	ar.css._css_ += '$WK slideInRight{0%{$WT:$T3(100%,0,0);$TF:$T3(100%,0,0);visibility:visible}';
	ar.css._css_ += 'to{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF slideInRight{0%{$WT:$T3(100%,0,0);$TF:$T3(100%,0,0);visibility:visible}';
	ar.css._css_ += 'to{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.slideInRight{$WA:slideInRight;$AN:slideInRight}';
	ar.css._css_ += '$WK slideInUp{0%{$WT:$T3(0,100%,0);$TF:$T3(0,100%,0);visibility:visible}';
	ar.css._css_ += 'to{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF slideInUp{0%{$WT:$T3(0,100%,0);$TF:$T3(0,100%,0);visibility:visible}';
	ar.css._css_ += 'to{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.slideInUp{$WA:slideInUp;$AN:slideInUp}';
	ar.css._css_ += '$WK slideOutDown{0%{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += 'to{visibility:hidden;$WT:$T3(0,100%,0);$TF:$T3(0,100%,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF slideOutDown{0%{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += 'to{visibility:hidden;$WT:$T3(0,100%,0);$TF:$T3(0,100%,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.slideOutDown{$WA:slideOutDown;$AN:slideOutDown}';
	ar.css._css_ += '$WK slideOutLeft{0%{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += 'to{visibility:hidden;$WT:$T3(-100%,0,0);$TF:$T3(-100%,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF slideOutLeft{0%{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += 'to{visibility:hidden;$WT:$T3(-100%,0,0);$TF:$T3(-100%,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.slideOutLeft{$WA:slideOutLeft;$AN:slideOutLeft}';
	ar.css._css_ += '$WK slideOutRight{0%{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += 'to{visibility:hidden;$WT:$T3(100%,0,0);$TF:$T3(100%,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF slideOutRight{0%{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += 'to{visibility:hidden;$WT:$T3(100%,0,0);$TF:$T3(100%,0,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.slideOutRight{$WA:slideOutRight;$AN:slideOutRight}';
	ar.css._css_ += '$WK slideOutUp{0%{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += 'to{visibility:hidden;$WT:$T3(0,-100%,0);$TF:$T3(0,-100%,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '$KF slideOutUp{0%{$WT:$TZ(0);$TF:$TZ(0)}';
	ar.css._css_ += 'to{visibility:hidden;$WT:$T3(0,-100%,0);$TF:$T3(0,-100%,0)}';
	ar.css._css_ += '}';
	ar.css._css_ += '.slideOutUp{$WA:slideOutUp;$AN:slideOutUp}';

	//
	// arques css
	//

	// Ani
	ar.css._css_ += '$WK spin { from { $WT: #R(0deg); } to { $WT: #R(360deg); }  }';
	ar.css._css_ += '.ani-spin {	-webkit-animation: spin 1s infinite linear; }';

	// Dialog

	ar.css._css_ += '.ar-dlg-cover { position:fixed;left:0;top:0;width:100%;height:100%;background-color:rgba(0,0,0,0.8);user-drag:none;user-select:none; }';
	ar.css._css_ += '.ar-dlg-inner { position:absolute;left:0;top:0;width:100%;height:100%;background-color:none; overflow:hidden;}';
	ar.css._css_ += '.ar-dlg-win { width:280px;height:auto;left:calc((100% - 280px) / 2);top:calc((100% - 160px) / 2);position:absolute;border:0px solid;border-radius:0px;padding:0;overflow:hidden;background-color:white; }';
	ar.css._css_ += '.ar-dlg-title { background-color:#3f51b5;color:white;height:25px;padding-top:10px;font-weight:200;font-size:14px;white-space:nowrap;text-align:center;overflow:hidden;font-family:sans-serif; line-height:16px; box-sizing:content-box; }';
	ar.css._css_ += '.ar-dlg-msg { padding:20px;width:calc(100% - 40px);height:65px;overflow-x:hidden;overflow-y:auto;font-weight:200;font-size:14px;font-family:sans-serif;color:black;user-drag:auto;user-select:auto; line-height:16px; box-sizing:content-box; }';
	ar.css._css_ += '.ar-dlg-btm { background-color:#eee;text-align:center;width:100%;height:35px;padding-bottom:5px; line-height:16px; box-sizing:content-box; }';
	ar.css._css_ += '.ar-dlg-list { width:100%;max-height:200px; overflow:hidden; overflow-y:scroll; line-height:16px; box-sizing:content-box; }';
	ar.css._css_ += '.ar-dlg-list-item { width:100%;padding-top:10px;height:25px;font-weight:100;font-size:14px;white-space:nowrap;text-align:center;overflow:hidden;font-family:sans-serif; line-height:16px; box-sizing:content-box; }';
	ar.css._css_ += '.ar-dlg-list-item:hover { background-color:#ddf; transition:0.7s all; }';
	ar.css._css_ += '.ar-dlg-btn-close { fill:gray; width:60px; box-sizing:content-box; }';
	ar.css._css_ += '.ar-dlg-btn-done { fill:blue; width:60px; box-sizing:content-box; }';
	ar.css._css_ += '.ar-dlg-wait	{ position:absolute;left:calc((100% - 30px) / 2);top:calc((100% - 30px) / 2);box-sizing:content-box; }';
	ar.css._css_ += '.ar-dlg-wait-spin { fill:white;user-drag:none;box-sizing:content-box; }';

	// Splitter
	
	ar.css._css_ += '.ar-split-box { white-space:nowrap;overflow:hidden; }';
	ar.css._css_ += '.ar-split-bar { background-color:#ddd; box-shadow:inset 0px 0px 0px 1px #bbb; }';
	ar.css._css_ += '.ar-split-col { display:inline-block;height:100%;overflow:hidden; }';
	ar.css._css_ += '.ar-split-row { width:100%;overflow:hidden; }';

	//Etc for Convenient
	ar.css._css_ += '.clear {	clear:both;}';
	ar.css._css_ += '.left {	float:left;}';
	ar.css._css_ += '.right {	float:right;}';
	ar.css._css_ += '.center-x {	text-align:center;}';
	ar.css._css_ += '.center-y {	vertical-align:middle;}';
	ar.css._css_ += '.round-3 {	border-radius:3px;}';
	ar.css._css_ += '.round-5 {	border-radius:5px;}';
	ar.css._css_ += '.round-10 {	border-radius:10px;}';
	ar.css._css_ += '.round-15 {	border-radius:15px;}';
	ar.css._css_ += '.round-20 {	border-radius:20px;}';
	ar.css._css_ += '.show {	display:block;}';
	ar.css._css_ += '.hide {	display:none;}';

	ar.css._css_ = ar.css._css_.replace(/\$WTO/g, '-webkit-transform-origin');
	ar.css._css_ = ar.css._css_.replace(/\$WT/g, '-webkit-transform');
	ar.css._css_ = ar.css._css_.replace(/\$WA/g, '-webkit-animatin-name');
	ar.css._css_ = ar.css._css_.replace(/\$WF/g, '-webkit-animation-timing-function');
	ar.css._css_ = ar.css._css_.replace(/\$WD/g, '-webkit-animation-duration');
	ar.css._css_ = ar.css._css_.replace(/\$WK/g, '@-webkit-keyframes');

	ar.css._css_ = ar.css._css_.replace(/\$KF/g, '@keyframes');
	ar.css._css_ = ar.css._css_.replace(/\$PS/g, 'perspective');
	ar.css._css_ = ar.css._css_.replace(/\$TFO/g, 'transform-origin');
	ar.css._css_ = ar.css._css_.replace(/\$TF/g, 'transform');
	ar.css._css_ = ar.css._css_.replace(/\$TX/g, 'translateX');
	ar.css._css_ = ar.css._css_.replace(/\$TY/g, 'translateY');
	ar.css._css_ = ar.css._css_.replace(/\$TZ/g, 'translateZ');
	ar.css._css_ = ar.css._css_.replace(/\$T3/g, 'translate3d');
	ar.css._css_ = ar.css._css_.replace(/\$AN/g, 'animation-name');
	ar.css._css_ = ar.css._css_.replace(/\$AT/g, 'animation-timing-function');
	ar.css._css_ = ar.css._css_.replace(/\$S3/g, 'scale3d');
	ar.css._css_ = ar.css._css_.replace(/\#R/g, 'rotate');
	ar.css._css_ = ar.css._css_.replace(/\#S/g, 'skew');
	ar.css._css_ = ar.css._css_.replace(/\#CB/g, 'cubic-bezier');

	//ar.log(ar.css._css_);

	var _head_ = '';
	var _style_ = '';

	if (typeof document != 'undefined') {
		_head_ = document.head || document.getElementsByTagName('head')[0];
		_style_ = document.createElement('style');

		_style_.type = 'text/css';
		_style_.appendChild(document.createTextNode(ar.css._css_));
		_head_.appendChild(_style_);
	}

	ar.css.rule.update();
}

ar.css.get = function() {
	return ar.css._css_;
}

ar.css.rule.update = function() {
	if (ar.isNodeJS())
		return;

	for (var i = 0; i < document.styleSheets.length; i++) {
		try {
			var sheet = document.styleSheets[i];
			var classes = sheet.rules || sheet.cssRules;

			for (var j = 0; j < classes.length; j++)
				ar.css._rules[classes[j].selectorText] = classes[j].style;
		}
		catch (e) {
		}
	}
}

ar.css.rule.set = function(className, styleField, styleValue) {
	if (ar.css._rules[className])
		ar.css._rules[className][styleField] = styleValue;
}

ar.css.rule.get = function(className) {
	return ar.css._rules[className];
}
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

/**
 * @namespace pref
 * @memberOf ar
 * @desc Preference singleton to manage the user preferences by using cookie.
 */

ar.pref = {};

ar.pref.db = null;
ar.pref.cache = {};

ar.pref.init = function(dbPath, cb) {
	var This = this;
	if (ar.isCordova()) {
		try {
			This.db = window.sqlitePlugin.openDatabase({
				name : dbPath,
				createFromLocation : true
			});

			This.db.transaction(function(tx) {
				//tx.executeSql("drop table pref"); // for testing
				//tx.executeSql("drop index pref_idx"); // for testing

				tx.executeSql("CREATE TABLE IF NOT EXISTS pref(pref_key text primary key, pref_val text)", [], function(tx, res) {
					This._cacheAll('', cb);
				}, function(e) {
					ar.log('ar.pref.init: ' + e);
					if (cb)
						cb();
				});

				tx.executeSql("commit", []);
			});

			//ar.log('==> db path: ' + dbPath);
			//ar.log('==> db loaded');
		}
		catch (e) {
			ar.log('pref:open_db: ' + e);
		}
	}
	else {
		This._cacheAll('');

		if (cb)
			cb();
	}
}

/**
 * @func set
 * @memberOf ar.pref
 * @desc Sets the value for the key. 
 * @param {string} key - Key.
 * @param {any} val - Value.
 */

ar.pref.set = function(key, val) {
	var This = this;
	This.cache[key] = val;
	This._set(key, val);
}

ar.pref.setInt = function(key, val) {
	var This = this;
	This.set(key, val);
}

ar.pref.setFloat = function(key, val) {
	var This = this;
	This.set(key, val);
}

ar.pref.setStr = function(key, val) {
	var This = this;
	This.set(key, val);
}

/**
 * @func get
 * @memberOf ar.pref
 * @desc Returns the value for the key. 
 * @param {string} key - Key.
 * @return {any} Returns the value for the key. 
 */

ar.pref.get = function(key) {
	var This = this;
	var r = null;

	try {
		r = This.cache[key];
	}
	catch (e) {
		ar.log('ar.pref.get: ' + e);
	}

	return r;
}

/**
 * @func getInt
 * @memberOf ar.pref
 * @desc Returns the integer value for the key. 
 * @param {string} key - Key.
 * @return {integer}
 */

ar.pref.getInt = function(key) {
	var This = this;
	var r = 0;

	try {
		r = parseInt('' + This.cache[key]);

		if (isNaN(r))
			r = 0;
	}
	catch (e) {
		ar.log('ar.pref.getInt: ' + e);
	}

	return r;
}

/**
 * @func getFloat
 * @memberOf ar.pref
 * @desc Returns the float value for the key. 
 * @param {string} key - Key.
 * @return {float}
 */

ar.pref.getFloat = function(key) {
	var This = this;
	var r = 0;

	try {
		r = parseFloat('' + This.cache[key]);

		if (isNaN(r))
			r = 0;
	}
	catch (e) {
		ar.log('ar.pref.getFloat: ' + e);
	}

	return r;
}

/**
 * @func getStr
 * @memberOf ar.pref
 * @desc Returns the string value for the key. 
 * @param {string} key - Key.
 * @return {string}
 */

ar.pref.getStr = function(key) {
	var This = this;
	var r = undefined;

	try {
		r = This.cache[key];

		if (typeof r == 'undefined')
			r = undefined;
		else
			r = '' + r;
	}
	catch (e) {
		ar.log('ar.pref.getStr: ' + e);
	}

	return r;
}

/**
 * @func del
 * @memberOf ar.pref
 * @desc Deletes the key. 
 * @param {string} key - Key.
 */

ar.pref.del = function(key, cb) {
	var This = this;
	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("delete from pref where pref_key = ?", [
				key
			], function(tx, res) {
				if (cb)
					cb(true);
			}, function(e) {
				ar.log('ar.pref.del: ' + e);
				if (cb)
					cb(false);
			});

			tx.executeSql("commit", []);
		});
	}
	else {
		document.cookie = key + '=; Max-Age=0';
		delete This.cache[key];

		if (cb)
			cb(true);
	}
}

/**
 * @func clear
 * @memberOf ar.pref
 * @desc Clears all keys.
 */

ar.pref.clear = function(prefix, cb) {
	var This = this;
	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("delete from pref where pref_key like '" + prefix + "%'", [], function(tx, res) {
				This.cache = {};
				if (cb)
					cb(true);
			}, function(e) {
				ar.log('ar.pref.clear: ' + e);
				if (cb)
					cb(false);
			});

			tx.executeSql("commit", []);
		});
	}
	else {
		for ( var key in This.cache)
			document.cookie = key + '=; Max-Age=0';

		This.cache = {};

		if (cb)
			cb(true);
	}
}

/**
 * @func isHaving
 * @memberOf ar.pref
 * @desc Tells if the key is existing.
 * @param {string} key - Key.
 * @param {func} cb(isHaving) - Callback. <b>isHaving</b> is true if the key exists.
 */

ar.pref.isHaving = function(key, cb) {
	var This = this;
	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("select count(*) as cnt from pref where pref_key = ?", [
				key
			], function(tx, res) {
				var r = res && res.rows && res.rows.length > 0 && res.rows.item(0).cnt > 0;
				if (cb)
					cb(r);
			}, function(e) {
				ar.log('ar.pref.isHaving: ' + e);
				if (cb)
					cb(false);
			});
		});
	}
	else {
		This._cookieLoop(function(_key, _val) {
			if (_key == key && _val) {
				if (cb)
					cb(true);
				return false;
			}
		});

		if (cb)
			cb(false);
	}
}

//
// implementations (don't call these methods directly) 
//

ar.pref._cacheAll = function(prefix, cb) {
	var This = this;
	This.cache = {};

	if (ar.isCordova()) {
		This._getKeyVals(prefix, function(keyVals) {
			This.cache = keyVals;
			if (cb)
				cb();
		});
	}
	else {
		This._cookieLoop(function(key, val) {
			This.cache[key] = val;
		});

		if (cb)
			cb();
	}
}

ar.pref._set = function(key, val, cb) {
	var This = this;
	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("INSERT OR IGNORE INTO pref(pref_key, pref_val) values(?, ?)", [
					key, val
			]);

			tx.executeSql("update pref set pref_val = ? where pref_key = ?", [
					val, key
			], function(tx, res) {
				if (cb)
					cb(true);
			}, function(e) {
				ar.log('ar.pref._set: ' + e);
				if (cb)
					cb(false);
			});

			tx.executeSql("commit", []);
		});
	}
	else {
		var days = 10000;
		var date = new Date();
		date.setTime(date.getTime() + (days * 86400000));
		document.cookie = key + '=' + val + ';expires=' + date.toGMTString() + ";path=/";

		if (cb)
			cb(true);
	}
}

ar.pref._setBulk = function(data, cb) {
	var This = this;
	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			for ( var key in data) {
				var val = data[key];

				tx.executeSql("INSERT OR IGNORE INTO pref(pref_key, pref_val) values(?, ?)", [
						key, val
				]);

				tx.executeSql("update pref set pref_val = ? where pref_key = ?", [
						val, key
				]);
			}

			tx.executeSql("commit", []);

			if (cb)
				cb(true);
		});
	}
	else {
		var days = 10000;
		var date = new Date();
		date.setTime(date.getTime() + (days * 86400000));

		for ( var key in data)
			document.cookie = key + '=' + data[key] + ';expires=' + date.toGMTString() + ";path=/";
	}
}

ar.pref._get = function(key, cb) {
	var This = this;
	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("select pref_val from pref where pref_key = ?", [
				key
			], function(tx, res) {
				if (cb) {
					if (res && res.rows && res.rows.length > 0)
						cb(res.rows.item(0).pref_val);
					else
						cb(null);
				}
			}, function(e) {
				ar.log('ar.pref._get: ' + e);
				if (cb)
					cb(null);
			});
		});
	}
	else {
		This._cookieLoop(function(_key, _val) {
			if (_key == key) {
				if (cb)
					cb(val);
				return false;
			}
		});
	}
}

ar.pref._getKeys = function(prefix, cb) {
	var This = this;
	var result = [];

	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("select pref_key from pref where pref_key like '" + prefix + "%' ", [], function(tx, res) {
				for (var i = 0; i < res.rows.length; i++)
					result.push(res.rows.item(i).pref_key);

				if (cb)
					cb(result);
			}, function(e) {
				ar.log('ar.pref._getKeys: ' + e);
				if (cb)
					cb(null);
			});
		});
	}
	else {
		This._cookieLoop(function(key, val) {
			if (prefix == undefined || prefix == null || prefix == '' || ar.isPrefix(key, prefix))
				result.push(key);
		});

		if (cb)
			cb(result);
	}
}

ar.pref._getKeyVals = function(prefix, cb) {
	var This = this;
	var result = {};

	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("select pref_key, pref_val from pref where pref_key like '" + prefix + "%' ", [], function(tx, res) {
				for (var i = 0; i < res.rows.length; i++) {
					var key = res.rows.item(i).pref_key;
					var val = res.rows.item(i).pref_val;

					result[key] = val;
				}

				if (cb)
					cb(result);
			}, function(e) {
				ar.log('ar.pref._getKeyVals: ' + e);
				if (cb)
					cb(null);
			});
		});
	}
	else {
		This._cookieLoop(function(key, val) {
			if (prefix == undefined || prefix == null || prefix == '' || ar.isPrefix(key, prefix))
				result[key] = val;
		});

		if (cb)
			cb(result);
	}
}

ar.pref._cookieLoop = function(cb) {
	var This = this;
	var cookies = document.cookie.split(';');

	for (var i = 0; i < cookies.length; i++)
		try {
			cookies[i] = cookies[i].trim();
			var keyval = cookies[i].split('=');
			var b = cb(keyval[0], keyval[1]);

			if (b == false)
				break;
		}
		catch (e) {
			ar.log('ar.pref._cookieLoop: ' + e);
		}
}
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

/**
 * @namespace valid
 * @memberOf ar
 * @desc Validation singleton to check the validation of a string.
 */

ar.valid = function() {
	var This = this;
}

ar.valid.country = function(str) {
	var isValid = str == '' ? false : true;
	return isValid;
}

/**
 * @func email
 * @memberOf ar.valid
 * @desc Tells if the specified string is valid email format.
 * @param {string} str - Email string.
 * @return {boolean}
 */

ar.valid.email = function(str) {
	var pattern = new RegExp(/^([A-Za-z0-9\-\_\.]+@([A-Za-z0-9\-\_\.]+\.)+[A-Za-z0-9\-\_\.]{2,4})?$/);
	var isValid = str && pattern.test(str) && str.length >= 6 ? true : false;

	return isValid;
}

/**
 * @func domain
 * @memberOf ar.valid
 * @desc Tells if the specified string is valid domain format.
 * @param {string} str - Domain string.
 * @return {boolean}
 */

ar.valid.domain = function(str) {
	var isValid = /[A-Za-z0-9\-\_]+$/.test(str) == 0 ? false : true;
	return isValid;
}

/**
 * @func password
 * @memberOf ar.valid
 * @desc Tells if the specified string is valid password format. It must be at least 8 characters and must have at least one upper alphabet, one lower alphabet, and one number.
 * @param {string} str - Password string.
 * @return {boolean}
 */

ar.valid.password = function(str) {
	var err = 0;

	if (str.length < 8)
		err++;

	var regx = /[A-Za-z0-9\`\~\!\@\#\$\^\*\(\)\:\;\"\'\<\>\?\,\.\/\-\_\=\+\|]*$/i;

	if (!regx.test(str))
		err++;

	err += (str.search(/[a-z]/) == -1 ? 1 : 0);
	err += (str.search(/[A-Z]/) == -1 ? 1 : 0);
	err += (str.search(/[0-9]/) == -1 ? 1 : 0);

	return err > 0 ? false : true;
}

/**
 * @func phone
 * @memberOf ar.valid
 * @desc Tells if the specified string is valid international phone number format. 
 * @param {string} str - Phone number string.
 * @return {boolean}
 */

ar.valid.phone = function(str) {
	var err = /^\+[0-9]+\-[0-9]+\-[0-9]+\-[0-9]+$/.test(str) == 0 ? 1 : 0;

	if (str.length < 11)
		err++;

	return err > 0 ? false : true;
}

/**
 * @func zip
 * @memberOf ar.valid
 * @desc Tells if the specified string is valid the US zip code(5) format. 
 * @param {string} str - Zip code string.
 * @return {boolean}
 */

ar.valid.zip = function(str) {
	var isValid = /[0-9\-]+$/.test(str) == 0 || str.length < 5 ? false : true;
	return isValid;
}

ar.valid.text = function(str) {
	var isValid = str.length == 0 ? false : true;
	return isValid;
}

/**
 * @func uuid
 * @memberOf ar.valid
 * @desc Tells if the specified string is valid uuid format. 
 * @param {string} str - Uuid string.
 * @return {boolean}
 */

ar.valid.uuid = function(uuid) {
	// http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
	return uuid && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
}
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

/**
 * @namespace net
 * @memberOf ar
 * @desc Net singleton to manage the network methods.
 */

ar.net = {}

/**
 * @func html
 * @memberOf ar.net
 * @desc Loads raw html string of specified url.
 * @param {string} url - Relative url of the default domain. Set the default domain first with <b>ar.setDomain(url);</b>.
 * @param {func} cb(html) - Callback. <b>html</b> will be the string when it's sucessful, otherwise it's null.
 */

ar.net.html = function(url, cb) {
	if (url[0] == '/')
		url = url.substring(1);

	if (ar._isCordova) {
		ar.fileReadAsText(ar.pathApp + '/www/' + url, null, function(content) {
			cb(content);
		});
	}
	else {
		var xhr = new XMLHttpRequest();
		xhr.timeout = 5000;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200)
					cb(xhr.responseText);
				else if (xhr.status == 0)
					cb(null);
			}
		}
		xhr.open("GET", ar._domain + '/' + url, true);
		xhr.send(null);
	}
}

/**
 * @func get
 * @memberOf ar.net
 * @desc Gets json data from the url by GET method.
 * @param {string} url - Relative url of the default domain. Set the default domain first with <b>ar.setDomain(url);</b>.
 * @param {object} params - Json object of parameters.
 * @param {func} cb(isSucc, data) - Callback. <b>isSucc</b> will be true when it's successful. <b>data</b> is json object of the result.
 */

ar.net.get = function(q, params, cb) {
	ar.net.req(q, params, false, cb);
};

/**
 * @func get
 * @memberOf ar.net
 * @desc Gets json data from the url by POST method.
 * @param {string} url - Relative url of the default domain. Set the default domain first with <b>ar.setDomain(url);</b>.
 * @param {object} params - Json object of parameters.
 * @param {func} cb(isSucc, data) - Callback. <b>isSucc</b> will be true when it's successful. <b>data</b> is json object of the result.
 */

ar.net.post = function(q, params, cb) {
	ar.net.req(q, params, true, cb);
};

ar.net.req = function(q, params, isPost, cb) { // request
	if (q[0] == '/')
		q = q.substring(1);

	var url = ar._domain + '/' + q;
	//ar.log(url);

	var body = '';

	if (typeof params == 'function') {
		cb = params;
	}
	else {
		var i = 0;
		for ( var k in params) {
			body += ((i == 0 ? '' : '&') + k + '=' + params[k]);
			i++;
		}
	}

	//			if (ar.isCordova()) {
	//				NoblicUtils.act('req', {
	//					url : ar._domain + '/' + q,
	//					params : body
	//				}, function(r) {
	//					fin(true, r);
	//				}, function(r) {
	//					fin(false, r);
	//				});
	//				return;
	//			}
	//			else {
	var xhr = new XMLHttpRequest();
	xhr.timeout = 15000;
	xhr.onreadystatechange = function() {
		//ar.log('xhr.status = ' + xhr.status);
		//ar.log('xhr.readyState = ' + xhr.readyState);

		if (cb && xhr.readyState == 4) {
			var data = null;

			try {
				data = JSON.parse(xhr.responseText);
			}
			catch (e) {
				ar.log('ar.net.req: err: parsing json failed: xhr.responseText = ' + xhr.responseText);
			}

			try {
				//ar.log(document.cookie);
				//ar.log('response = ' + r);
				cb(xhr.status == 200 && data != null, data);
			}
			catch (e) {
				ar.log('ar.net.req: err: ' + q + ',' + e + ',' + e.stack);
			}
		}
	};

	xhr.getResponseHeader('Set-Cookie');
	//xhr.withCredentials = true;
	xhr.crossDomain = true;
	xhr.open(isPost ? "POST" : "GET", url, true);
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'); // 
	//xhr.setRequestHeader('Cache-Control', 'no-cache');
	//xhr.setRequestHeader("X-CSRFToken", csrftoken);
	//xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
	//xhr.setRequestHeader("x-requested-with", '');
	xhr.send(body);
	//ar.log(body);
	//			}
}

/**
 * @func upload
 * @memberOf ar.net
 * @desc Uploads files to the server.
 * @param {object} opt - Options as below:<br>
 * {<br>
 * url: '/customer.picture', // Relative url of the default domain.<br>
 * params: [{ key1: val1 }, { key2: val2 }, ... ], // Query parameters array.<br>
 * files: [ path1, path2, ... ], // Local file path string array specified by 'input' tag.<br>
 * onProgress: function(oEvent) { ... }, // &lt;Optional&gt;. Please refer to https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest.<br>
 * onError: function(evt) { ... }, // &lt;Optional&gt;<br>
 * onCancel: function(evt) { ... }, // &lt;Optional&gt;<br>
 * onDone: function(isSucc, json) { ... }, // &lt;Optional&gt;. <b>isSucc</b> is true when the query is successful. <b>json</b> is the json structure of the result<br>
 * }<br>
 */

ar.net.upload = function(opt) {
	var fd = new FormData();
	var xhr = new XMLHttpRequest();
	xhr.timeout = 60 * 60 * 1000;

	for ( var k in opt.params) {
		//ar.log(k + ',' + opt.params[k]);
		fd.append(k, opt.params[k]);
	}

	for ( var i in opt.files) {
		fd.append('id_file_' + i, opt.files[i]);
		ar.log('form file: ' + opt.files[i]);
	}

	//ar.log(opt.params);
	//ar.log(opt.files);
	//ar.log(fd);

	if (opt.onProgress)
		xhr.addEventListener("progress", opt.onProgress, false);

	if (opt.onError)
		xhr.addEventListener("error", opt.onError, false);

	if (opt.onCancel)
		xhr.addEventListener("abort", opt.onCancel, false);

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var data = null;

			try {
				data = JSON.parse(xhr.responseText);
			}
			catch (e) {
				ar.log('ar.net.upload: err: parsing json failed: xhr.responseText = ' + xhr.responseText);
			}

			try {
				//ar.log('response = ' + xhr.responseText);
				if (opt.onDone)
					opt.onDone(xhr.status == 200 && data != null, data);
			}
			catch (e) {
				ar.log('ar.net.upload: err: ' + e + ',' + e.stack);
			}
		}
	}

	//	for (var [key, value] of fd.entries()) { 
	//	  console.log(key, value);
	//	}	

	xhr.withCredentials = true;
	xhr.crossDomain = true;
	xhr.open("POST", ar._domain + '/' + opt.url, true);

	if (opt.onPrepareXhr)
		opt.onPrepareXhr(xhr);

	//var oundary = "---------------------------" + Date.now().toString(16);	
	//xhr.setRequestHeader('Content-type', 'multipart/form-data'); //
	xhr.send(fd);
}

/*
> run chrome with unsafe mode for testing.
open -a /Applications/Google\ Chrome.app --args --disable-web-security --user-data-dir="" 
 
ar.net.upload = function(opt) {
	//
	
//			ar.log(fd);

	//xhr.setRequestHeader("X-File-Type", file.type);
	xhr.send(null);
} */
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

/**
 * @namespace dlg
 * @memberOf ar
 * @desc Dialog singleton for alert, confirm, select and etc.
 */

ar.dlg = {};

/**
 * @func alert
 * @memberOf ar.dlg
 * @desc Shows alert dialog. 
 * @param {object} opt - Specify object as below:<br>
 * 	{<br>
 * 	title: string, // title<br>
 *  msg: string, // &lt;optional&gt;. Message.<br>
 *  cb: function() { ... }, // &lt;optional&gt;. Callback is called after ok button is clicked.<br>
 * 	x: integer | string, // &lt;optional&gt;<br>
 *  y: integer | string, // &lt;optional&gt;<br>
 *  w: integer | string, // &lt;optional&gt;<br>
 *  h: integer | string // &lt;optional&gt;<br>
 * 	}<br>
 */

ar.dlg.alert = function(opt) {
	var d = null;
	var scope = Scope();
	var html = '';

	if (!opt.title)
		opt.title = ar.title;

	if (!opt.msg)
		opt.msg = '';

	html += '<div class="ar-dlg-win">';
	html += '	<div id="id-title" class="ar-dlg-title"></div>';
	html += '	<div class="ar-dlg-msg" id="id-msg"></div>';
	html += '	<div class="ar-dlg-btm" click="onAct(1)">';
	html += '		<icon class="ar-dlg-btn-done" shape="done" size="30" ty="6"></icon>';
	html += '	</div>';
	html += '</div>';

	scope.onAct = function() {
		if (opt.cb)
			opt.cb();

		d.hide();
		d = null;
		scope.free();
	}

	Dialog({
		scope : scope,
		parent : document.body,
		html : html,
		cb : function(_dlg) {
			d = _dlg;
			_dlg.show(function() {
				scope.div = _dlg[0];
				var eTitle = scope.E('id-title');
				var eMsg = scope.E('id-msg');

				eTitle.html = opt.title;
				eMsg.html = opt.msg;
			});
		}
	});
}

/**
 * @func confirm
 * @memberOf ar.dlg
 * @desc Shows confirm dialog. 
 * @param {object} opt - Specify object as below:<br>
 * 	{<br>
 * 	title: string, // title<br>
 * 	msg: string, // &lt;optional&gt;. Message.<br>
 * 	cb: function(act) { ... }, // &lt;optional&gt;. Callback is called after ok button is clicked. <b>act</b> will be 1 if 'yes' is clicked.<br>
 * 	x: integer | string, // &lt;optional&gt;<br>
 *  y: integer | string, // &lt;optional&gt;<br>
 *  w: integer | string, // &lt;optional&gt;<br>
 *  h: integer | string // &lt;optional&gt;<br>
 * 	}<br>
 */

ar.dlg.confirm = function(opt) {
	var d = null;
	var scope = Scope();
	var html = '';

	if (!opt.title)
		opt.title = ar.title;

	if (!opt.msg)
		opt.msg = '';

	html += '<div class="ar-dlg-win">';
	html += '	<div id="id-title" class="ar-dlg-title"></div>';
	html += '	<div class="ar-dlg-msg" id="id-msg"></div>';
	html += '	<div class="ar-dlg-btm">';
	html += ' 		<icon class="ar-dlg-btn-close" shape="close" size="30" ty="6" style="float:left;margin-left:3px;" click="onAct(0)"></icon>';
	html += '		<icon class="ar-dlg-btn-done" shape="done" size="30" ty="6" style="float:right;margin-right:3px;" click="onAct(1)"></icon>';
	html += '		<div class="clear"></div>';
	html += '	</div>';
	html += '</div>';

	scope.onAct = function(act) {
		if (opt.cb)
			opt.cb(act == 1);

		d.hide();
		d = null;
		scope.free();
	}

	d = Dialog({
		scope : scope,
		parent : document.body,
		html : html,
		cb : function(_dlg) {
			_dlg.show(function() {
				scope.div = _dlg[0];
				var eTitle = scope.E('id-title');
				var eMsg = scope.E('id-msg');
				eTitle.html = opt.title;
				eMsg.html = opt.msg;
			});
		}
	});
}

/**
 * @func toast
 * @memberOf ar.dlg
 * @desc Shows toast dialog. 
 * @param {object} opt - Specify object as below:<br>
 * 	{<br>
 * 	title: string, // title<br>
 *  delay: integer, // &lt;optional&gt;. Milliseconds to be kept.<br>
 * 	cb: function(act) { ... }, // &lt;optional&gt;. Callback will be called after the delay time.<br>
 * 	x: integer | string, // &lt;optional&gt;<br>
 *  y: integer | string, // &lt;optional&gt;<br>
 *  w: integer | string, // &lt;optional&gt;<br>
 *  h: integer | string // &lt;optional&gt;<br>
 * 	}<br>
 */

ar.dlg.toast = function(opt) {
	var d = null;
	var scope = Scope();
	var html = '';

	if (!opt.title)
		opt.title = ar.title;

	if (!opt.msg)
		opt.msg = '';

	html += '<div class="ar-dlg-win">';
	html += '	<div id="id-title" class="ar-dlg-title"></div>';
	html += '	<div class="ar-dlg-msg" id="id-msg"></div>';
	html += '</div>';
	
	d = Dialog({
		scope : scope,
		parent : document.body,
		html : html,
		cb : function(_dlg) {
			_dlg.show(function() {
				scope.div = _dlg[0];

				var eTitle = scope.E('id-title');
				var eMsg = scope.E('id-msg');

				eTitle.html = opt.title;
				eMsg.html = opt.msg;

				ar.run(opt.delay ? opt.delay : 1000, function() {
					_dlg.hide();

					if (opt.cb)
						opt.cb();
				});
			});
		}
	});
}

/**
 * @func select
 * @memberOf ar.dlg
 * @desc Shows select dialog. 
 * @param {object} opt - Specify object as below:<br>
 * 	{<br>
 * 	title: string, // title<br>
 *  list: array, // string list<br>
 * 	cb: function(act) { ... }, // &lt;optional&gt;. Callback will be called after an item is clicked. the first item is 0, cancel is -1. The dialog will not be hidden if cb returns false.<br>
 * 	x: integer | string, // &lt;optional&gt;<br>
 *  y: integer | string, // &lt;optional&gt;<br>
 *  w: integer | string, // &lt;optional&gt;<br>
 *  h: integer | string // &lt;optional&gt;<br>
 * 	}<br>
 */

ar.dlg.select = function(opt) {
	var d = null;
	var scope = Scope();
	var html = '';

	if (!opt.title)
		opt.title = ar.title;

	html += '<div id="id_win" class="ar-dlg-win">';
	html += '	<div id="id-title" class="ar-dlg-title"></div>';

	html += '	<div id="id_list" class="ar-dlg-list">';
	for (var i = 0; i < opt.list.length; i++) {
		html += '<div class="ar-dlg-list-item" click="onAct(' + i + ')">';
		html += opt.list[i];
		html += '</div> ';
	}
	
	html += '	</div>';
	html += '	<div class="ar-dlg-btm" click="onAct(-1)">';
	html += '		<icon class="ar-dlg-btn-close" shape="done" size="30" ty="6"></icon>';
	html += '	</div>';
	html += '</div>';

	scope.onAct = function(act) {
		var isClose = false;

		if (opt.cb)
			isClose = opt.cb(act);

		if (isClose || act == -1) {
			d.hide();
			d = null;
			scope.free();
		}
	}

	d = Dialog({
		scope : scope,
		parent : document.body,
		isHideByBackTouch : opt.isHideByBackTouch,
		html : html,
		cb : function(_dlg) {
			_dlg.show(function() {
				scope.div = _dlg[0]; // = dlg cover

				var win = scope.E('id_win');
				var list = scope.E('id_list');
				var title = scope.E('id-title');
				
				list.h = win.h < ar.h ? list.h : ar.h - 140;
				win.y = 'calc((100% - ' + win.h + 'px) / 2)';
				
				title.html = opt.title;
			});
		}
	});
}

/**
 * @namespace wait
 * @memberOf ar.dlg
 * @desc Wait dialog singleton.
 */

ar.dlg.wait = function() {
	var This = this;
	This.dlg = null;
	This.scope = null;
	This.isShowing = false;
}

/**
 * @func show
 * @memberOf ar.dlg.wait
 * @desc Shows wait dialog. 
 * @param {object} [opt] - Specify object as below:<br>
 * 	{<br>
 * 	cb: function() { ... }, // &lt;optional&gt;. Callback is called after the wait dialog is shown.<br>
 * 	}<br>
 */

ar.dlg.wait.show = function(opt) {
	var This = this;

	if (This.isShowing)
		return;

	This.isShowing = true;
	This.scope = Scope();

	if (!opt) 
		opt = {};
	
	var d = null;
	var html = '';
	var shape = opt.shape ? opt.shape : 'casino';
	var size = opt.shape_size ? opt.shape_size : 30;
	var tx = opt.tx ? opt.tx : 0;
	var ty = opt.ty ? opt.ty : 0;
	var style = '';
	
	if (tx || ty) {
		if (typeof tx == 'number')
			tx += 'px';
		if (typeof ty == 'number')
			ty += 'px';
		
		style = 'transform:translate(' + tx + ', ' + ty + ')';
	}

	html += '<div class="ar-dlg-wait" style="' + style + '">';
	html += '  <div id="id_spin" class="ani-spin ar-dlg-wait-spin"><icon shape="' + shape + '" size="' + size + '"></icon></div>';
	html += '</div>';
	
	This.dlg = Dialog({
		scope : This.scope,
		parent : document.body,
		html : html,
		cb : function(_dlg) {
			_dlg.show(function() {
				This.scope.div = _dlg[0];

				var spin = This.scope.E('id_spin');
				spin.h = spin.w;

				if (opt && opt.cb)
					opt.cb();
			});
		}
	});
}

/**
 * @func hide
 * @memberOf ar.dlg.wait
 * @desc Hides wait dialog. 
 * @param {object} [opt] - Specify object as below:<br>
 * 	{<br>
 * 	cb: function() { ... }, // &lt;optional&gt;. Callback is called after the wait dialog is hidden.<br>
 * 	}<br>
 */

ar.dlg.wait.hide = function(opt) {
	var This = this;

	if (This.dlg == null) {
		if (opt.cb)
			opt.cb();
		return;
	}

	var _opt = {};
	_opt.cb = function(_dlg) {
		if (opt && opt.cb)
			opt.cb();
	}

	This.dlg.hide(_opt.cb);
	This.dlg = null;
	This.scope.free();
	This.scope = null;
	This.isShowing = false;
}
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
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// db singletone
//
ar.db = {};
ar.db.path = '';

ar.db.setPath = function(v) {
	ar.db.path = path;
};
ar.file = {};
ar.dir = {};

ar.file.readAsText = function(filePath, bypass, cb) {
	window.resolveLocalFileSystemURL(ar.safePath(filePath), function(fileEntry) {
		//alert(JSON.stringify(fileEntry));
		fileEntry.file(function(file) {
			var reader = new FileReader();

			reader.onloadend = function(e) {
				//alert(cb);
				var result = this.result;

				if (cb)
					cb(result, bypass);
				//delete reader;
			}

			reader.readAsText(file);
		});
	}, function(e) {
		ar.log('File read failed: ' + JSON.stringify(e));
		//alert('File read failed: ' + filePath + ', ' + JSON.stringify(e));

		if (cb)
			cb(null, bypass);
	});
}

ar.file.readAsBase64 = function(path, cb) {
	window.resolveLocalFileSystemURL(path, function(fileEntry) {
		fileEntry.file(function(file) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
				var content = this.result;
				content = content.match(/,(.*)$/)[1];
				cb(content);
			};
			reader.readAsDataURL(file);
		});
	}, function(e) {
		alert(path + " file doesn't exist.");
		cb(null);
	});
}

ar.file.writeAsText = function(path, fileName, text, bypass, cb) {
	window.resolveLocalFileSystemURL(ar.safePath(path), function(fileSystem) {
		fileSystem.getFile(fileName, {
			create : true,
			exclusive : false
		}, function(fileEntry) {
			fileEntry.createWriter(function(writer) {
				writer.onwriteend = function(e) {
					if (cb)
						cb(true, bypass);
				}
				writer.write(text);
			}, function(e) {
				ar.log('File createWriter failed: ' + JSON.stringify(e));
				alert('File createWriter failed: ' + path + ',' + fileName + ', ' + JSON.stringify(e));

				if (cb)
					cb(false, bypass);
			});
		}, function(e) {
			ar.log('Writing: getFile failed: ' + JSON.stringify(e));
			alert('Writing: getFile failed: ' + path + ',' + fileName + ', ' + JSON.stringify(e));

			if (cb)
				cb(false, bypass);
		});
	}, function(e) {
		ar.log('File write failed: ' + JSON.stringify(e));
		alert('File write failed: ' + path + ',' + fileName + ', ' + JSON.stringify(e));

		if (cb)
			cb(false, bypass);
	});
}

ar.safePath = function(path) {
	if (ar.isAndroid()) {
		path = ar.isPrefix(path, 'file://') ? path : 'file://' + path;
	}
	else {
		// nothing to do
	}

	return path;
}

ar.file.extractBase = function(path) {
	var filename = path.replace(/^.*[\\\/]/, '');
	path = path.substring(0, path.length - filename.length - 1);
	return path;
}

ar.file.extractName = function(path) {
	var filename = path.replace(/^.*[\\\/]/, '');
	return filename;
}

ar.file.isExisting = function(path, cb) {
	path = ar.safePath(path);

	window.resolveLocalFileSystemURL(path, function(file) {
		//alert(JSON.stringify(file));

		if (cb)
			cb(true, file);
	}, function(e) {
		if (cb)
			cb(false, null);
	});
}

ar.file.copy = function(from, fromName, to, toName, cb) {
	window.resolveLocalFileSystemURL(ar.safePath(from + '/' + fromName), function(file) {
		window.resolveLocalFileSystemURL(ar.safePath(to), function(destination) {
			file.copyTo(destination, toName, function() {
				if (cb)
					cb(1);
			}, function() {
				if (cb)
					cb(-2);
			});
		}, function(e) {
			//alert('fileMode(err1): ' + JSON.stringify(e));
			if (cb)
				cb(0);
		})
	}, function(e) {
		//alert('fileMode(err2): ' + JSON.stringify(e));

		if (cb)
			cb(-1);
	});
}

ar.file.move = function(from, to, cb) {
	var destPath = to.substring(0, to.lastIndexOf("/"));
	var destFile = to.replace(/^.*[\\\/]/, '');

	//alert(destPath + ',' + destFile);

	window.resolveLocalFileSystemURL(ar.safePath(from), function(file) {
		window.resolveLocalFileSystemURL(ar.safePath(destPath), function(destination) {
			file.moveTo(destination, destFile, function() {
				if (cb)
					cb(1);
			}, function() {
				if (cb)
					cb(-2);
			});
		}, function(e) {
			//alert('fileMode(err1): ' + JSON.stringify(e));
			if (cb)
				cb(0);
		})
	}, function(e) {
		//alert('fileMode(err2): ' + JSON.stringify(e));
		if (cb)
			cb(-1);
	});
}

ar.file.del = function(filePath, cb) {
	window.resolveLocalFileSystemURL(ar.safePath(filePath), function(fileEntry) {
		fileEntry.remove(function(file) {
			if (cb)
				cb(1);
		}, function(e) {
			//alert('fileDel(err1): ' + JSON.stringify(e));
			if (cb)
				cb(0);
		});
	}, function(e) {
		//alert('fileDel(err2): ' + JSON.stringify(e));
		if (cb)
			cb(-1);
	});
}

ar.dir.list = function(path, cb) { // original from http://stackoverflow.com/questions/8298124/list-files-inside-www-folder-in-phonegap
	window.resolveLocalFileSystemURL(ar.safePath(path), function(fileEntry) {
		//alert('dirMake: ' + JSON.stringify(fileEntry));
		fileEntry.getDirectory(".", { // "." is necessary for android
			create : false,
			exclusive : false
		}, function(directory) {
			//alert(JSON.stringify(directory));

			var directoryReader = directory.createReader();
			var list = [];

			directoryReader.readEntries(function(entries) {
				//alert(JSON.stringify(entries));

				for (var i = 0; i < entries.length; i++) {
					list[i] = {};
					list[i].name = entries[i].name;
					list[i].path = entries[i].nativeURL;
					list[i].isDir = entries[i].isDirectory;
					list[i].datetime = entries[i].datetime;
				}

				if (cb)
					cb(list);
			}, function(error) {
				ar.dlg.alert({
					title : 'dirList:readEntries failed: ' + error.code,
					cb : function() {
						if (cb)
							cb(null);
					}
				});
			});
		}, function(error) {
			ar.dlg.alert({
				title : 'dirList:getDirectory failed: ' + error.code,
				cb : function() {
					if (cb)
						cb(null);
				}
			});
		});
	}, function(error) {
		ar.dlg.alert({
			title : 'dirList:requestFileSystem failed: ' + error.code,
			cb : function() {
				if (cb)
					cb(null);
			}
		});
	});
}

ar.dir.del = function(dirPath, cb) {
	//alert(dirPath);

	window.resolveLocalFileSystemURL(ar.safePath(dirPath), function(fileEntry) {
		//alert('dirDel: ' + JSON.stringify(fileEntry));

		fileEntry.removeRecursively(function() {
			if (cb)
				cb(1)
		}, function(e) {
			//alert('dirDel(err1): ' + JSON.stringify(e));
			if (cb)
				cb(0)
		});
	}, function(e) {
		//alert('dirDel(err2): ' + JSON.stringify(e));
		if (cb)
			cb(-2)
	});
}

ar.dir.make = function(path, newDirName, cb) {
	window.resolveLocalFileSystemURL(ar.safePath(path), function(fileEntry) {
		//alert('dirMake: ' + JSON.stringify(fileEntry));

		fileEntry.getDirectory(newDirName, {
			create : true,
			exclusive : false
		}, function(dirEntry) {
			//alert('dirMake: ' + JSON.stringify(dirEntry));
			if (cb)
				cb(1)
		}, function(e) {
			//alert('dirMake(err1): ' + JSON.stringify(e));
			if (cb)
				cb(0)
		});
	}, function(e) {
		//alert('dirMake(err2): ' + JSON.stringify(e));
		if (cb)
			cb(-1);
	});
}
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/
//
// Ext
//
String.prototype.insertAt = function(i, s) {
	return this.substr(0, i) + s + this.substr(i);
}

String.prototype.replaceAll = function(from, to) {
	return this.split(from).join(to);
};

String.prototype.compareSub = function(i, s) {
	for (var j = 0, len = s.length; j < len; j++)
		if (this[i] != s[j])
			return false;

	return true;
}

String.prototype.isPrefix = function(s) {
	return s && this.indexOf(s) == 0;
}

String.prototype.isSuffix = function(s) {
	return s && this.substring(this.length - s.length) == s;
}

Object.defineProperty(Object.prototype, 'arIsEmpty', {
	enumerable : false,
	value : function() {
		return Object.keys(this).length === 0;
	}
});

Object.defineProperty(Array.prototype, 'makeReverse', {
	enumerable : false,
	value : function() {
		var a = [];

		for ( var k in this)
			a.push(this[k]);

		a.reverse();
		return a;
	}
});

Array.prototype.rotate = function(n) { // https://stackoverflow.com/questions/1985260/javascript-array-rotate
	while (this.length && n < 0)
		n += this.length;
	this.push.apply(this, this.splice(0, n));
	return this;
}

function getColorVals(colorStr) {
	var r = [];

	if (colorStr.indexOf('#') >= 0)
		colorStr = colorStr.substring(1).match(/.{1,2}/g);
	else
		colorStr = colorStr.replace('rgba', '').replace('rgb', '').replace('(', '').replace(')', '').split(',');

	for ( var i in colorStr)
		r.push(parseInt(colorStr[i], 16));

	return r;
}

/*
 * JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*global unescape, define, module */

(function($) {
	'use strict'

	/*
	* Add integers, wrapping at 2^32. This uses 16-bit operations internally
	* to work around bugs in some JS interpreters.
	*/
	function safe_add(x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	* Bitwise rotate a 32-bit number to the left.
	*/
	function bit_rol(num, cnt) {
		return (num << cnt) | (num >>> (32 - cnt));
	}

	/*
	* These functions implement the four basic operations the algorithm uses.
	*/
	function md5_cmn(q, a, b, x, s, t) {
		return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
	}
	function md5_ff(a, b, c, d, x, s, t) {
		return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t) {
		return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t) {
		return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t) {
		return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	* Calculate the MD5 of an array of little-endian words, and a bit length.
	*/
	function binl_md5(x, len) {
		/* append padding */
		x[len >> 5] |= 0x80 << (len % 32)
		x[(((len + 64) >>> 9) << 4) + 14] = len

		var i;
		var olda;
		var oldb;
		var oldc;
		var oldd;
		var a = 1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d = 271733878;

		for (i = 0; i < x.length; i += 16) {
			olda = a;
			oldb = b;
			oldc = c;
			oldd = d;

			a = md5_ff(a, b, c, d, x[i], 7, -680876936);
			d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
			c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
			b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
			a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
			d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
			c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
			b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
			a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
			d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
			c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
			b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
			a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
			d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
			c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
			b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

			a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
			d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
			c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
			b = md5_gg(b, c, d, a, x[i], 20, -373897302);
			a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
			d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
			c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
			b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
			a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
			d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
			c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
			b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
			a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
			d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
			c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
			b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

			a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
			d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
			c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
			b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
			a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
			d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
			c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
			b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
			a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
			d = md5_hh(d, a, b, c, x[i], 11, -358537222);
			c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
			b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
			a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
			d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
			c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
			b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

			a = md5_ii(a, b, c, d, x[i], 6, -198630844);
			d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
			c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
			b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
			a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
			d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
			c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
			b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
			a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
			d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
			c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
			b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
			a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
			d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
			c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
			b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
		}
		return [
				a, b, c, d
		];
	}

	/*
	* Convert an array of little-endian words to a string
	*/
	function binl2rstr(input) {
		var i;
		var output = '';
		for (i = 0; i < input.length * 32; i += 8) {
			output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
		}
		return output;
	}

	/*
	* Convert a raw string to an array of little-endian words
	* Characters >255 have their high-byte silently ignored.
	*/
	function rstr2binl(input) {
		var i;
		var output = [];
		output[(input.length >> 2) - 1] = undefined;

		for (i = 0; i < output.length; i += 1) {
			output[i] = 0;
		}

		for (i = 0; i < input.length * 8; i += 8) {
			output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
		}

		return output;
	}

	/*
	* Calculate the MD5 of a raw string
	*/
	function rstr_md5(s) {
		return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
	}

	/*
	* Calculate the HMAC-MD5, of a key and some data (raw strings)
	*/
	function rstr_hmac_md5(key, data) {
		var i;
		var bkey = rstr2binl(key);
		var ipad = [];
		var opad = [];
		var hash;
		ipad[15] = opad[15] = undefined;
		if (bkey.length > 16) {
			bkey = binl_md5(bkey, key.length * 8);
		}
		for (i = 0; i < 16; i += 1) {
			ipad[i] = bkey[i] ^ 0x36363636;
			opad[i] = bkey[i] ^ 0x5C5C5C5C;
		}
		hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
		return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
	}

	/*
	* Convert a raw string to a hex string
	*/
	function rstr2hex(input) {
		var hex_tab = '0123456789abcdef';
		var output = '';
		var x;
		var i;
		for (i = 0; i < input.length; i += 1) {
			x = input.charCodeAt(i);
			output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
		}
		return output;
	}

	/*
	* Encode a string as utf-8
	*/
	function str2rstr_utf8(input) {
		return unescape(encodeURIComponent(input));
	}

	/*
	* Take string arguments and return either raw or hex encoded strings
	*/
	function raw_md5(s) {
		return rstr_md5(str2rstr_utf8(s));
	}
	function hex_md5(s) {
		return rstr2hex(raw_md5(s));
	}
	function raw_hmac_md5(k, d) {
		return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
	}
	function hex_hmac_md5(k, d) {
		return rstr2hex(raw_hmac_md5(k, d));
	}

	function md5(string, key, raw) {
		if (!key) {
			if (!raw) {
				return hex_md5(string);
			}
			return raw_md5(string);
		}
		if (!raw) {
			return hex_hmac_md5(key, string);
		}
		return raw_hmac_md5(key, string);
	}

	if (typeof define === 'function' && define.amd) {
		define(function() {
			return md5;
		})
	}
	else if (typeof module === 'object' && module.exports) {
		module.exports = md5;
	}
	else {
		$.md5 = md5;
	}
}(this));
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
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// ArquesCheckbox
//

Check = function(id) {
	var a = new ArquesCheckbox(id);
	return a;
}

ArquesCheckbox = function(id) {
	var This = this;

	ArquesElement.call(This, id);

	This.scope = Scope(This[0]);
	This._id = id;
	This._isChecked = This.attr('checked') ? true : false;
	This._check_size = This.attr('check-size') ? This.attr('check-size') : 25;
	This._check_color = This.attr('check-color')  ? This.attr('check-color') : 'black';
	This._check_tx = This.attr('check-tx')  ? This.attr('check-tx') : 0;
	This._check_ty = This.attr('check-ty')  ? This.attr('check-ty') : 6.5;
	This._check_mr = This.attr('check-mr')  ? This.attr('check-mr') : 6;
	This._isEnabled = This.attr('disabled') ? false : true;
	This.cursor = 'pointer';
	This.onClick = null;
	
	var html = '';
	
	html += '<span style="display:inline-block;">';
	html += ar.icon('check_box_outline_blank', This._check_size); // check_box
	html += '</span>';
	
	This[0].insertAdjacentHTML('afterbegin', html);

	This.scanAll();
	This.check = This.children[0];
	This.check.fill = This._check_color;
	This.check.tx = This._check_tx;
	This.check.ty = This._check_ty;
	This.check.mr = This._check_mr;

	//

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

	var attr = {};
	attr['click'] = function() {
		if (This._isEnabled == false)
			return;
		
		This._isChecked = !This._isChecked;
		This.refresh();
		
		if (This.onClick)
			This.onClick(This);
	};

	ar.click(This.scope, This, attr);
}

ArquesCheckbox.prototype = Object.create(ArquesElement.prototype, {
	refresh : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(id) {
			var This = this;
			ar.setIcon(This.check, This._isChecked ? 'check_box' : 'check_box_outline_blank' , This._check_size, 'fill:' + This._check_color + ';');
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
			This.filter = 'brightness(.5)';
		}
	},
});

Object.defineProperty(ArquesCheckbox.prototype, 'checked', {
	get : function() {
		var This = this;
		return This._isChecked;
	},

	set : function(v) {
		var This = this;
		This._isChecked = v;
		This.refresh();
	},
});
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// ArquesCombobox
//

Combo = function(id) {
	var a = new ArquesCombobox(id);
	return a;
}

ArquesCombobox = function(id) {
	var This = this;

	ArquesElement.call(This, id);

	This.scope = Scope(This[0]);
	This._id = id;
	This._index = This.attr('index') ? parseInt(This.attr('index')) : 0;
	This._combo_size = This.attr('combo-size') ? This.attr('combo-size') : 25;
	This._combo_color = This.attr('combo-color') ? This.attr('combo-color') : 'black';
	This._combo_tx = This.attr('combo-tx') ? This.attr('combo-tx') : 0;
	This._combo_ty = This.attr('combo-ty') ? This.attr('combo-ty') : 7;
	This._combo_mr = This.attr('combo-mr') ? This.attr('combo-mr') : 6;
	This._isEnabled = This.attr('disabled') ? false : true;
	This._combos = [];
	This.cursor = 'pointer';
	This.onClick = null;
	This.scanAll();

	for (var i = This.children.length - 1; i >= 0; i--) {
		var child = This.children[i];
		var html = '';

		html += '<span style="display:inline-block;">';
		html += ar.icon('combo_button_unchecked', This._combo_size);
		html += '</span>';

		child[0].insertAdjacentHTML('afterbegin', html);

		child.scanAll();
		var combo = child.children[0];
		This._combos.splice(0, 0, combo);

		combo.fill = This._combo_color;
		combo.tx = This._combo_tx;
		combo.ty = This._combo_ty;
		combo.mr = This._combo_mr;

		function setupClick(child, index) {
			var attr = {};
			attr['click'] = function() {
				if (This._isEnabled == false)
					return;

				This._index = index;
				This.refresh();

				if (This.onClick)
					This.onClick(This);
			};

			ar.click(This.scope, child, attr);
		}
		
		setupClick(child, i);
	}

	//

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
}

ArquesCombobox.prototype = Object.create(ArquesElement.prototype, {
	refresh : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(id) {
			var This = this;

			for (var i = 0; i < This._combos.length; i++) {
				var combo = This._combos[i];
				ar.setIcon(combo, 'combo_button_unchecked', This._combo_size, 'fill:' + This._combo_color + ';');
			}

			if (This._index < This._combos.length) {
				var combo = This._combos[This._index];
				ar.setIcon(combo, 'combo_button_checked', This._combo_size, 'fill:' + This._combo_color + ';');
			}
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

Object.defineProperty(ArquesCombobox.prototype, 'index', {
	get : function() {
		var This = this;
		return This._index;
	},

	set : function(v) {
		var This = this;
		This._index = Math.max(0, Math.min(This._combo.length - 1, v));
		This.refresh();
	},
});
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// ArquesDialog
//

function Dialog(opt) {
	var a = new ArquesDialog(opt);
	return a;
}

ArquesDialog = function(opt) {
	var This = this;
	This.opt = opt ? opt : {};

	ArquesElement.call(This);

	This.length = 1;
	This[0] = document.createElement('div');
	This[0].className = (opt.backClass ? opt.backClass : 'ar-dlg-cover') + ' ';
	This[0].className += ' animated ' + (opt.backShowAni ? opt.backShowAni : 'fadeIn');

	This.inner = E(document.createElement('div'));
	This.inner[0].className = opt.innerClass ? opt.innerClass : 'ar-dlg-inner';
	This.add(This.inner);

	if (opt.isHideByBackTouch)
		This.inner.on(ar.EV_DN, function() {
			This.hide();
		});

	This.onTouchDummy = function() {
		// nothing to do. just to block background touch.
	};

	if (typeof opt.html != 'undefined') {
		This.inner.html = opt.html;

		ar.compile({
			scope : opt.scope,
			root : This.inner[0],
			cb : function(isSucc) {
				if (isSucc == false) {
					opt.cb(false);
					return;
				}

				This.inner.children[0].on(ar.EV_DN, This.onTouchDummy);
				opt.cb(This);
			},
		});
	}
	else if (typeof opt.src != 'undefined')
		ar.net.html(opt.src, function(content) {
			if (content == null) {
				opt.cb(false);
				return;
			}

			This.inner.html = content;

			ar.compile({
				scope : opt.scope,
				root : This.inner[0],
				cb : function(isSucc) {
					if (isSucc == false) {
						opt.cb(false);
						return;
					}

					This.inner.children[0].on(ar.EV_DN, This.onTouchDummy);
					opt.cb(This);
				},
			});
		});
	else
		ar.log('ArquesDialog.constructor: err: dialog html or html url is not specified.');
}

ArquesDialog.zIndex = 100000;
ArquesDialog.onShow = null;
ArquesDialog.onHide = null;

ArquesDialog.setOnShow = function(f) {
	ArquesDialog.onShow = f;
}

ArquesDialog.setOnHide = function(f) {
	ArquesDialog.onHide = f;
}

ArquesDialog.prototype = Object.create(ArquesElement.prototype, {
	show : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(cb) {
			var This = this;
			ArquesDialog.zIndex++;
			This[0].style.zIndex = ArquesDialog.zIndex;
			This.opt.parent.appendChild(This[0]);

			ar.ani({
				obj : This.inner,
				name : This.opt.dlgShowAni ? This.opt.dlgShowAni : 'fadeIn'
			});

			if (ArquesDialog.onShow)
				ArquesDialog.onShow(This);

			if (cb)
				cb();
		}
	},

	hide : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(callback) {
			var This = this;
			This.inner.children[0].off(ar.EV_DN, This.onTouchDummy);
			//ar.log('offed');
			ArquesDialog.zIndex--;

			if (This.opt.backHideAni == '') {
				This.opt.parent.removeChild(This[0]);

				if (ArquesDialog.onHide)
					ArquesDialog.onHide(This);

				if (callback)
					callback();
			}
			else {
				var showAniName = This.opt.dlgShowAni ? This.opt.dlgShowAni : 'fadeIn';
				This.inner[0].className = This.inner[0].className.replaceAll(showAniName, '').trim();

				ar.ani({
					obj : This.inner,
					name : This.opt.dlgHideAni ? This.opt.dlgHideAni : 'fadeOut',
					cb : function() {
						ar.ani({
							obj : This[0],
							name : This.opt.backHideAni ? This.opt.backHideAni : 'fadeOut',
							cb : function() {
								if (ArquesDialog.onHide)
									ArquesDialog.onHide(This);

								This.opt.parent.removeChild(This[0]);

								if (callback)
									callback();
							}
						});
					}
				});
			}
		}
	},

	html : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(content) {
			var This = this;
			This.inner.html = content;
		}
	},
});
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// Gallery
//
Gallery = function(id) {
	var a = new ArquesGallery(id);
	return a;
}

ArquesGallery = function(id) {
	var This = this;
	ArquesElement.call(This, id);

	This.scope = Scope(This[0]);
	This.scanAll();
	This._id = This.attr('id');

	This._index = 0;
	This._isAuto = false;
	This._isInfinite = true;
	This._isSlidable = false;
	This._autoTimerId = 0;
	This._autoTime = 3000;
	This._conTransTime = 350;
	This._first = null;
	This._last = null;
	This._canHideUI = false;
	This.dnX = 0;
	This.dnY = 0;
	This.isTouchDown = false;
	This.overflow = 'hidden';
	This.onIndi = null;
	This.onChanged = null;
	This.imgs = [];

	var tempChil = This.children;
	This.clear();

	This.con = E('<div style="user-select:none;"></div>');
	This.con.position = 'relative';
	This.con.transTime = 0;
	This.con.aniFunc = 'cubic-bezier(.07,.32,.23,.92)';
	This.con.overflow = 'hidden';
	This.con.w = 100000;
	This.con.tx = -This.con.w / 2;
	This.prevTx = This.con.tx;
	ArquesElement.prototype.add.call(This, This.con);

	var btnSize = 60;

	This.btnL = E(ar.icon('navigate_before', btnSize, 'fill:rgba(255,255,255,0.5);'));
	This.btnL.cursor = 'pointer';
	This.btnL.w = btnSize;
	This.btnL.h = btnSize;
	This.btnL.show = function() {
		This.btnL.visible = true;
	};
	This.btnL.hide = function() {
		This.btnL.visible = false;
	};
	ArquesElement.prototype.add.call(This, This.btnL);

	This.btnR = E(ar.icon('navigate_next', btnSize, 'fill:rgba(255,255,255,0.5);'));
	This.btnR.cursor = 'pointer';
	This.btnR.w = btnSize;
	This.btnR.h = btnSize;
	This.btnR.show = function() {
		This.btnR.visible = true;
	};
	This.btnR.hide = function() {
		This.btnR.visible = false;
	};
	ArquesElement.prototype.add.call(This, This.btnR);

	This.indi = E('<div style="user-select:none;"></div>');
	This.indi.h = 50;
	This.indi.show = function() {
		This.indi.visible = true;
	};
	This.indi.hide = function() {
		This.indi.visible = false;
	};
	ArquesElement.prototype.add.call(This, This.indi);

	This.on(ar.EV_DN, function(e) {
		return This.onDn(e);
	}, true);
	This.on(ar.EV_MV, function(e) {
		return This.onMv(e);
	}, true);
	This.on(ar.EV_UP, function(e) {
		return This.onUp(e);
	}, true);
	This.on(ar.EV_CN, function(e) {
		return This.onOut(e);
	}, true);

	This.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.con.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.btnL.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.btnR.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.slide = function(isToLeft) {
		This.isTouchDown = true;
		This.dnX = isToLeft ? 0 : 50;
		This.dnY = 0;
		This.onMv(ar.ev(isToLeft ? 30 : 20, 0));
		This.onUp(ar.ev(isToLeft ? 50 : 0, 0));
	}

	This.btnL.on(ar.EV_CK, function(e) {
		This.slide(true);
	});

	This.btnR.on(ar.EV_CK, function(e) {
		This.slide();
	});

	This.indi.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.scope.on('size', function() {
		This.refresh();
	});

	This._onSetW = function() {
		This.refresh();
	};

	This._onSetH = This._onSetW;

	for (var i = 0; i < tempChil.length; i++)
		This.add(tempChil[i]);

	This.refresh();
};

ArquesGallery.prototype = Object.create(ArquesElement.prototype, {
	add : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(e) {
			var This = this;

			if (!ar.isE(e))
				e = E(e);

			This.imgs.push(e);
			This.con.add(e);

			if (This.imgs.length == 1) {
				This._first = e;
				This._last = e;
				e._prev = null;
				e._next = null;
			}
			else {
				This._first._prev = e;
				This._last._next = e;
				e._next = This._first;
				e._prev = This._last;
				This._last = e;
			}

			e.position = 'absolute';
			e.drag = 'none';
			e.sel = 'none';				
			e.y = 0;
			e.scanAll();

			This.prepareAni(e);
			This.runAni(e);
			This.refresh();
		}
	},

	prepareAni : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(e) {
			var This = this;
			var aniName = e.attr('ani');

			if (aniName != null) {
				e.delCls(aniName);
				e.visible = false;
			}

			var cnt = e.count;

			for (var i = 0; i < cnt; i++)
				This.prepareAni(e.children[i]);
		}
	},

	runAni : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(e) {
			var This = this;
			var ani = e.attr('ani');

			e.visible = true;

			if (ani)
				e.ani(ani);

			var cnt = e.count;

			for (var i = 0; i < cnt; i++)
				This.runAni(e.children[i]);
		}
	},

	onDn : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(e) {
			var This = this;
			var p = ar.evPos(e);

			This.dnX = p.x;
			This.dnY = p.y;
			This.prevTx = This.con.tx;
			This.isTouchDown = true;
			This._isSlidable = false;

			return true;
		}
	},

	onMv : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(e) {
			var This = this;

			if (This.isTouchDown == false)
				return;

			var p = ar.evPos(e);
			
			if (This._isSlidable == false) {
				if (Math.abs(p.x - This.dnX) > 30) {
					This.dnX = p.x;
					This._isSlidable = true;
				}
				
				return true;
			}
			
			This.con.tx = This.prevTx + p.x - This.dnX;

			if (This._isInfinite) {
				if (This._first && This._first._prev) {
					if (-This.con.tx <= This._first.x) {
						This._last.x = This._first.x - This.w;
						This._first = This._last;
						This._last = This._last._prev;
					}
					else if (-This.con.tx >= This._last.x) {
						This._first.x = This._last.x + This.w;
						This._last = This._first;
						This._first = This._first._next;
					}
				}
			}

			return true;
		}
	},

	onUp : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(e) {
			var This = this;

			if (This.isTouchDown) {
				This.isTouchDown = false;

				if (This.onWillChange)
					This.onWillChange();

				This.con.transTime = This._conTransTime;

				var p = ar.evPos(e);
				var newTx = 0;
				var direction = 0;

				if (p.x - This.dnX > 20) {
					This._index--;
					direction = 1;

					if (This._index < 0) {
						if (This._isInfinite)
							This._index = This.con.count - 1;
						else {
							This._index = 0;
							direction = 0;
						}
					}
				}
				else if (p.x - This.dnX < -20) {
					This._index++;
					direction = -1;

					if (This._index >= This.con.count) {
						if (This._isInfinite)
							This._index = 0;
						else {
							This._index = This.con.count - 1;
							direction = 0;
						}
					}
				}

				var newTx = This.prevTx + This.w * direction;
				This.con.tx = newTx;

				if (direction == 0)
					return;

				This.refreshIndis();

				//ar.log('This.con.tx = ' + This.con.tx);

				for (var i = 0; i < This.imgs.length; i++)
					This.prepareAni(This.imgs[i]);

				ar.run(This.con.transTime, function() {
					if (This.isTouchDown)
						return;

					This.con.transTime = 0;
					This.runAni(This.imgs[This._index]);
					This.refresh();

					if (This.onChanged)
						This.onChanged();
				});
			}

			return true;
		}
	},

	onOut : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(e) {
			var This = this;
			This.onUp(e);
			return true;
		}
	},

	refresh : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function() {
			var This = this;

			if (This.imgs.length == 0 || This._isLocked)
				return;

			This.con.tx = -This.con.w / 2;
			This.prevTx = This.con.tx;

			var x = -This.con.tx - This._index * This.w;

			if (This.imgs.length > 1) {
				This._first = This.imgs[0];
				This._last = This.imgs[This.imgs.length - 1];
			}

			for (var i = 0; i < This.imgs.length; i++) {
				var e = This.imgs[i];
				e.x = x;
				e.w = This.w;
				e.h = This.h;

				This.con.children[i] = e;
				x += This.w;
			}

			//This.con.w = x;
			This.con.h = This.h;
			
			This._isLocked = true;
			This.h = This.con.h; // This.h is changed by This.con.h is being changed, so must be recovered.
			This._isLocked = false;
			
			This.btnL.tx = 20;
			This.btnL.ty = -(This.h + This.btnL.h) / 2;
			This.btnR.tx = This.w - This.btnL.w * 2 - 20;
			This.btnR.ty = This.btnL.ty;

			This.indi.ty = -This.btnL.h - This.indi.h - 10;
			This.indi.w = This.w;
			This.refreshIndis();
		}
	},

	refreshIndis : {
		value : function() {
			var This = this;
			var cnt = This.con.count;
			var html = '<center><table height="50px;">';

			for (var i = 0; i < cnt; i++) {
				html += '<td ';
				html += ' id="' + This._id + '-indi-item-' + i + '" ';
				html += ' index="' + i + '" ';
				html += ' style="width:20px;text-align:center;cursor:pointer;color:' + (This._index == i ? "rgba(255,255,255,0.7);" : "rgba(155,155,155,0.7);") + '">●</td>';
			}

			html += '</table></center>';

			//ar.log(html);
			This.indi.html = html;

			var setup = function(i) {
				var item = This.scope.E(This._id + '-indi-item-' + i);
				item.off(ar.EV_CK);
				item.on(ar.EV_CK, function(e) {
					This.index = i;

					if (This.onIndi)
						This.onIndi(i);
				});
			}

			for (var i = 0; i < cnt; i++)
				setup(i);
		}
	},

	isInUI : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(e) {
			var This = this;
			var p = ar.localPos(This, e);
			var y = This.h + This.btnL.ty;
			var h = This.btnL.h;

			if (This.btnL.x <= p.x && p.x <= This.btnL.x + This.btnL.w && y <= p.y && p.y <= y + h || This.btnR.x <= p.x && p.x <= This.btnR.x + This.btnR.w && y <= p.y && p.y <= y + h || This.h + This.indi.ty <= p.y)
				return true;

			return false;
		}
	},
});

Object.defineProperties(ArquesGallery.prototype, {
	'index' : {
		get : function() {
			var This = this;
			return This._index;
		},

		set : function(v) {
			var This = this;

			if (v < 0)
				v = This.imgs.length - 1;
			else if (v >= This.imgs.length)
				v = 0;

			This._index = v;
			This.refresh();

			for (var i = 0; i < This.imgs.length; i++)
				This.prepareAni(This.imgs[i]);

			if (This._index < This.imgs.length)
				This.runAni(This.imgs[This._index]);
		},
	},
});

Object.defineProperties(ArquesGallery.prototype, {
	'isInfinite' : {
		get : function() {
			var This = this;
			return This._isInfinite;
		},

		set : function(v) {
			var This = this;
			This._isInfinite = v;
			This.refresh();
		},
	},
});

Object.defineProperties(ArquesGallery.prototype, {
	'isAuto' : {
		get : function() {
			var This = this;
			return This._isAuto;
		},

		set : function(v) {
			var This = this;
			This._isAuto = v;
			clearInterval(This._autoTimerId);

			if (This._isAuto)
				This._autoTimerId = setInterval(function() {
					This.slide();
				}, This.autoTime);
		},
	},
});

Object.defineProperty(ArquesGallery.prototype, 'count', {
	get : function() {
		var This = this;
		if (!This.con)
			return 0;
		return This.con.children.length;
	},

	set : function(v) {
		var This = this;
		ar.log('ArquesGallery.count property is readonly!');
	},
});

Object.defineProperties(ArquesGallery.prototype, {
	'autoTime' : {
		get : function() {
			var This = this;
			return This._autoTime;
		},

		set : function(v) {
			var This = this;
			This._autoTime = v;
			This.isAuto = This.isAuto;
		},
	},
});

Object.defineProperties(ArquesGallery.prototype, {
	'canHideUI' : {
		get : function() {
			var This = this;
			return This._canHideUI;
		},

		set : function(v) {
			var This = this;
			This._canHideUI = v;

			var posDn;
			var posUp;

			if (v) {
				This.on(ar.EV_DN, function(e) { // on click event
					posDn = ar.evPos(e);
				});

				This.on(ar.EV_UP, function(e) { // on click event
					posUp = ar.evPos(e);

					if (ar.isClick(posDn, posUp) == false || This.isInUI(e))
						return;

					if (This.indi.isShowing()) {
						This.btnL.hide(); // left button
						This.btnR.hide(); // right button
						This.indi.hide(); // indicator
					}
					else {
						This.btnL.show(); // left button
						This.btnR.show(); // right button
						This.indi.show(); // indicator
					}
				});
			}
			else {
				This.off(ar.EV_DN);
				This.off(ar.EV_UP);
			}
		},
	},
});
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

Menu = function(id) {
	var a = new ArquesMenu(id);
	return a;
}

//
// ArquesMenu
//

ArquesMenu = function(id) {
	var This = this;

	ArquesElement.call(This, id);

	This.scope = Scope(This[0]);
	This.scanAll();
	This._id = This.attr('id');
	This._index = 0;
	This._menus = [];
	This.header = null;
	This.footer = null;
	This.onChanged = null;
	This.onMenuScroll = null;
	This.overflow = 'hidden';

	This.color = {};
	This._activeFc = null;
	This._activeBc = null;

	var tempChil = This.children;
	This.clear();

	This.con = E('<div style="user-select:none;"></div>');
	This.con.position = 'relative';
	This.con.overflow = 'hidden';
	This.con.oy = 'auto';
	ArquesElement.prototype.add.call(This, This.con);

	This.back = E('<div style="user-select:none;"></div>');
	This.back.position = 'absolute';
	This.back.overflow = 'hidden';
	This.con.add(This.back);

	This.menuCon = E('<div style="user-select:none;"></div>');
	This.menuCon.position = 'absolute';
	This.menuCon.overflow = 'hidden';
	This.con.add(This.menuCon);

	This.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.con.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.back.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.menuCon.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

//	This.con.onScroll = function() {
//		if (This.onMenuScroll)
//			This.onMenuScroll(This.con.children, This.index, This.con.st);
//	};

	This.scope.on('size', function() {
		This.refresh();
	});

	This._onSetW = function() {
		This.refresh();

		if (This.onChanged)
			This.onChanged(This._menus, This.index);
	};

	This._onSetH = This._onSetW;

	for (var i = 0; i < tempChil.length; i++)
		This.add(tempChil[i]);

	This.refresh();
}

ArquesMenu.prototype = Object.create(ArquesElement.prototype, {
	add : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(e) {
			var This = this;

			if (!ar.isE(e))
				e = E(e);
			
			if (e.attr('back') != null) {
				This.back.add(e);
				e.position = 'absolute';
			}
			else if (e.attr('header') != null) {
				This.header = e;
				e.position = 'relative';
				ArquesElement.prototype.insert.call(This, 0, e);
			}
			else if (e.attr('footer') != null) {
				This.footer = e;
				e.position = 'relative';
				ArquesElement.prototype.add.call(This, e);
			}
			else {
				This.menuCon.add(e);

				e.position = 'absolute';
				e.cursor = 'pointer';
				e._normalFc = e.fc;
				e._normalBc = e.bc;

				if (e.attr('sep') == null) {
					This._menus.push(e);

					e.on(ar.EV_CK, function() {
						var index = 0;

						for (var i = 0; i < This._menus.length; i++)
							if (This._menus[i] == e) {
								index = i;
								break;
							}

						This.index = index;

						if (This.onChanged)
							This.onChanged(This._menus, This.index);
					});
				}
			}

			e.scanAll();
			e.computeStyle();
			
			This.refresh();
		}
	},

	del : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(index) {
			var This = this;
			var chil = This.children;
			
			if (index < 0 || index >= chil.length) {
				ar.log('Menu.del is called with invalid index');
				return;
			}
			
			var e = chil[index];
			
			for (var i = 0; i < This._menu.length; i++) 
				if (This._menu[i] == e) {
					This._menu.splice(i, 1);
					break;
				}

			This.menuCon.del(index);
			This.refresh();
		}
	},

	refresh : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(id) {
			var This = this;

			if (This.menuCon.count == 0)
				return;

			var headerHeight = This.header ? This.header.frameMP.h : 0;
			var footerHeight = This.footer ? This.footer.frameMP.h : 0;

			if (This.header) {
				This.header.x = 0;
				This.header.y = 0;
				This.header.w = This.w;
			}

			This.con.x = 0;
			This.con.y = 0;
			This.con.w = This.w;
			This.con.h = This.h - headerHeight - footerHeight;

			var chil = This.menuCon.children;
			var y = 0;

			for (var i = 0; i < chil.length; i++) {
				chil[i].fc = chil[i]._normalFc;
				chil[i].bc = chil[i]._normalBc;
				chil[i].x = 0;
				chil[i].y = y;
				chil[i].w = This.w - chil[i].ml - chil[i].mr;

				y += chil[i].h + chil[i].pt + chil[i].pb + chil[i].mt + chil[i].mb;
			}

			This.back.x = 0;
			This.back.y = 0;
			This.back.w = This.w;
			This.back.h = y;

			This.menuCon.x = 0;
			This.menuCon.y = 0;
			This.menuCon.w = This.w;
			This.menuCon.h = This.back.h;

			if (This.footer) {
				This.footer.x = 0;
				This.footer.y = 0;
				This.footer.w = This.w;
			}

			if (This._index < This._menus.length) {
				if (This._activeFc)
					This._menus[This._index].fc = This._activeFc;
				
				if (This._activeBc)
					This._menus[This._index].bc = This._activeBc;
			}
		}
	},
});

Object.defineProperty(ArquesMenu.prototype, 'index', {
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

Object.defineProperty(ArquesMenu.prototype, 'backs', {
	get : function() {
		var This = this;
		return This.back.children;
	},

	set : function(v) {
		var This = this;
		ar.log('Menu.backs property is readonly!');
	},
});

Object.defineProperty(ArquesMenu.prototype, 'count', {
	get : function() {
		var This = this;
		if (!This._menus)
			return 0;
		
		return This._menus.length;
	},

	set : function(v) {
		var This = this;
		ar.log('ArquesMenu.count property is readonly!');
	},
});

Object.defineProperty(ArquesMenu.prototype, 'menus', {
	get : function() {
		var This = this;
		if (!This._menus)
			return 0;
		return This._menus;
	},

	set : function(v) {
		var This = this;
		ar.log('Menu.menus property is readonly!');
	},
});

Object.defineProperty(ArquesMenu.prototype, 'activeFc', {
	get : function() {
		var This = this;
		return This._activeFc;
	},

	set : function(v) {
		var This = this;
		This._activeFc = v;
		This.refresh();
	},
});

Object.defineProperty(ArquesMenu.prototype, 'activeBc', {
	get : function() {
		var This = this;
		return This._activeBc;
	},

	set : function(v) {
		var This = this;
		This._activeBc = v;
		This.refresh();
	},
});
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// Msg
//

Msg = function() {
	var This = this;

	This.mAction = 0;
	This.mData1 = 0;
	This.mData2 = 0;
	This.mDurStartTime = 0;
	This.mDur = 0;
}

//
// MsgHandler
//

MsgHandler = function(onAction) {
	var This = this;

	This.mMsgs = [];
	This.mOnAction = onAction;
	This.mIsProcessing = false;
}

MsgHandler.prototype.start = function() {
	var This = this;
	This.mIsProcessing = true;
}

MsgHandler.prototype.stop = function() {
	var This = this;
	This.mIsProcessing = false;
}

MsgHandler.prototype.scheduleMessage = function(action, durMilli, data1, data2) {
	var This = this;
	var r = new Msg();

	r.mAction = action;
	r.mDur = durMilli;
	r.mData1 = data1;
	r.mData2 = data2;
	r.mDurStartTime = ar.tick();

	This.mMsgs.push(r);
}

MsgHandler.prototype.clearMessages = function(action) {
	var This = this;

	if (action == 0) {
		This.mMsgs = [];
		return;
	}

	var toDel = [];

	for (var i = This.mMsgs.length - 1; i >= 0; i--) {
		var r = This.mMsgs[i];

		if (r.mAction == action)
			This.mMsgs.splice(i, 1);
	}
}

MsgHandler.prototype.processMessage = function() {
	var This = this;
	var toRun = [];

	if (This.mIsProcessing == false)
		return;

	for (var i = This.mMsgs.length - 1; i >= 0; i--) {
		var r = This.mMsgs[i];
		var dur = ar.tick() - r.mDurStartTime;

		if (dur >= r.mDur) // r.mDur != 0 &&
		{
			toRun.push(r);
			This.mMsgs.splice(i, 1);
		}
	}

	for (var i = toRun.length - 1; i >= 0; i--)
		This.mOnAction(toRun[i]);

	if (This.mIsProcessing)
		setTimeout(function() {
			This.processMessage()
		}, 1000 / ar.FPS);
}
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// ArquesPages
//

Pages = function(id) {
	var a = new ArquesPages(id);
	return a;
}

ArquesPages = function(id) {
	var This = this;

	ArquesElement.call(This, id);

	This.scope = Scope(This[0]);
	This.scanAll();
	This._id = This.attr('id');
	This._index = 0;
	This._canAni = true;
	This.overflow = 'hidden';

	var tempChil = This.children;
	This.clear();

	This.con = E('<div></div>');
	This.con.position = 'relative';
	This.con.overflow = 'hidden';
	This.con.transTime = 500;
	ArquesElement.prototype.add.call(This, This.con);

	This.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.con.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.scope.on('size', function() {
		This.refresh();
	});

	This._onSetW = function() {
		This.refresh();
	};

	This._onSetH = This._onSetW;

	for (var i = 0; i < tempChil.length; i++)
		This.add(tempChil[i]);

	This.refresh();
}

ArquesPages.prototype = Object.create(ArquesElement.prototype, {
	add : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(e) {
			var This = this;

			if (!ar.isE(e))
				e = E(e);
			
			This.con.add(e);

			e.position = 'absolute';
			This.refresh();
			return e;
		}
	},

	del : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(index) {
			var This = this;
			var children = This.children;

			This.con.del(index);
			This.refresh();
		}
	},
	
	refresh : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(id) {
			var This = this;

			if (This.con.count == 0)
				return;

			var chil = This.con.children;
			var x = 0;

			for (var i = 0; i < chil.length; i++) {
				chil[i].x = x;
				chil[i].y = 0;
				chil[i].w = This.w;
				chil[i].h = This.h;
				
				if (This._canAni == false)
					chil[i].hide();
				
				x += This.w;
			}

			chil[This._index].show();

			This.con.x = -This._index * This.w;
			This.con.y = 0;
			This.con.w = This.w * chil.length;
			This.con.h = This.h;
		}
	},
});

Object.defineProperty(ArquesPages.prototype, 'index', {
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

Object.defineProperty(ArquesPages.prototype, 'count', {
	get : function() {
		var This = this;
		if (!This.con)
			return 0;
		return This.con.children.length;
	},

	set : function(v) {
		var This = this;
		ar.log('ArquesPages.count property is readonly!');
	},
});

Object.defineProperty(ArquesPages.prototype, 'canAni', {
	get : function() {
		var This = this;
		return This._canAni;
	},

	set : function(v) {
		var This = this;
		This._canAni = v;
		This.con.transTime = v ? 500 : 0;
		This.refresh();
	},
});
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// ArquesRadiobox
//
Radio = function(id) {
	var a = new ArquesRadiobox(id);
	return a;
}

ArquesRadiobox = function(id) {
	var This = this;

	ArquesElement.call(This, id);

	This.scope = Scope(This[0]);
	This._id = This.attr('id');
	This._index = This.attr('index') ? parseInt(This.attr('index')) : 0;
	This._radio_size = This.attr('radio-size') ? This.attr('radio-size') : 25;
	This._radio_color = This.attr('radio-color') ? This.attr('radio-color') : 'black';
	This._radio_tx = This.attr('radio-tx') ? This.attr('radio-tx') : 0;
	This._radio_ty = This.attr('radio-ty') ? This.attr('radio-ty') : 7;
	This._radio_mr = This.attr('radio-mr') ? This.attr('radio-mr') : 6;
	This._isEnabled = This.attr('disabled') ? false : true;
	This._radios = [];
	This.cursor = 'pointer';
	This.onClick = null;
	This.scanAll();

	for (var i = This.children.length - 1; i >= 0; i--) {
		var child = This.children[i];
		var html = '';

		html += '<span style="display:inline-block;">';
		html += ar.icon('radio_button_unchecked', This._radio_size);
		html += '</span>';

		child[0].insertAdjacentHTML('afterbegin', html);

		child.scanAll();
		var radio = child.children[0];
		This._radios.splice(0, 0, radio);

		radio.fill = This._radio_color;
		radio.tx = This._radio_tx;
		radio.ty = This._radio_ty;
		radio.mr = This._radio_mr;

		function setupClick(child, index) {
			var attr = {};
			attr['click'] = function() {
				if (This._isEnabled == false)
					return;

				This._index = index;
				This.refresh();

				if (This.onClick)
					This.onClick(This);
			};

			ar.click(This.scope, child, attr);
		}
		
		setupClick(child, i);
	}

	//

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
}

ArquesRadiobox.prototype = Object.create(ArquesElement.prototype, {
	refresh : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(id) {
			var This = this;

			for (var i = 0; i < This._radios.length; i++) {
				var radio = This._radios[i];
				ar.setIcon(radio, 'radio_button_unchecked', This._radio_size, 'fill:' + This._radio_color + ';');
			}

			if (This._index < This._radios.length) {
				var radio = This._radios[This._index];
				ar.setIcon(radio, 'radio_button_checked', This._radio_size, 'fill:' + This._radio_color + ';');
			}
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
			This.filter = 'brightness(.5)';
		}
	},
});

Object.defineProperty(ArquesRadiobox.prototype, 'index', {
	get : function() {
		var This = this;
		return This._index;
	},

	set : function(v) {
		var This = this;
		This._index = Math.max(0, Math.min(This._radios.length - 1, v));
		This.refresh();
	},
});
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
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

Scope = function(div) {
	var s = new ArquesScope(div);
	return s;
}

/**
 * @class ArquesScope 
 * @description ArquesScope manages actions, events, repeting blocks, and event broadcasting. You can categorize your project easily with ArquesScope.<br>
 * Use at least one ArquesScope for your application by <b>'var scope = new ArquesScope;'</b> and specify the variable to the compiler.<br>
 */

ArquesScope = function(div) {
	var This = this;
	ArquesScope.id++;

	This.ev = {};
	This.id = ArquesScope.id;
	This.div = div ? (ArquesElement.prototype.isPrototypeOf(div) ? div[0] : div) : null;
	This.__repeat__ = {}
	This.__slides__ = {}

	ArquesScope.hash[This.id] = This;
}

ArquesScope.hash = {};
ArquesScope.id = 0;

/**
 * @method ArquesScope.broadcast
 * @desc A static method to broadcast an event to all scopes.
 * @param {string} eventName - User defined event name
 * @param {any} param  - Parameters to be passed to the callback function
 * @example
 * <script>
 * 
 * // 
 * // Installing custom event
 * //
 * 
 * var scope1 = Scope();
 * scope1.on('myNoti', function(myParam) { 
 * 	 ar.log(JSON.stringify(myParam)); 
 * });
 * 
 * var scope2 = Scope();
 * scope2.on('myNoti', function(myParam) { 
 * 	 ar.log(JSON.stringify(myParam)); 
 * });
 * 
 * //
 * // Broadcasting 
 * //
 * 
 * ArquesScope.broadcast('myNoti', 1234); // 'myNoti' handlers of scope1 and scope2 will be called at once
 * 
 * </script>
 */

Scope.broadcast = function(eventName, param) {
	for ( var k in ArquesScope.hash) {
		var handler = ArquesScope.hash[k].ev[eventName];

		if (handler)
			handler(param);
	}
}

/**
 * @method ArquesScope.prototype.E
 * @desc Finds a child element.
 * @param {string} id - Element ID
 * @return {ArquesElement} a child
 */

ArquesScope.prototype.E = function(id) {
	var This = this;

	if (This.div == null)
		return null;

	var autoId = ar.isPrefix(id, '.') ? id : '#' + id;
	var e = This.div.querySelectorAll(autoId);

	if (e.length == 0)
		e = This.div.querySelectorAll(id);

	var r = E('');

	for (var i = 0; i < e.length; i++)
		r[i] = e[i];

	r.length = e.length;
	return r;
}

/**
 * @method ArquesScope.prototype.on
 * @desc Installs a new custom event
 * @param {string} eventName - Custom event name
 * @param {function} cb - Callback function
 */

ArquesScope.prototype.on = function(eventName, cb) {
	var This = this;

	if (ar.isFunc(cb)) {
		This.ev[eventName] = cb;

		if (This.div)
			ar.on(This.div, eventName, cb);
	}
	else if (This.ev[eventName]) {
		var param = cb;
		This.ev[eventName](param);
	}
}

/**
 * @method ArquesScope.prototype.off
 * @desc Uninstall a custom event
 * @param {string} eventName - Custom event name to be uninstalled
 */

ArquesScope.prototype.off = function(eventName) {
	var This = this;
	delete This.ev[eventName];

	if (This.div)
		ar.off(This.div, eventName);
}

/**
 * @method ArquesScope.prototype.repeat
 * @desc Returns a ArquesRepeatBlock object in the scope. Call this function to get a ArquesRepeatBlock object for managing the repetition block in html.
 * @param {string} repeatId - Repeat block ID
 * @return {ArquesRepeatBlock} ArquesRepeatBlock object
 */

ArquesScope.prototype.repeat = function(repeatId) {
	var This = this;
	return This.__repeat__[repeatId];
}

ArquesScope.prototype.slide = function(id) {
	var This = this;
	return This.__slides__[id];
}

ArquesScope.prototype.compile = function(html) {
	var This = this;
	html = This.processReplacement(html);
	html = This.processBinding(html);
	return html;
}

ArquesScope.prototype.processDirective = function(parent) {
	var This = this;

	for (var i = 0; i < parent.children.length; i++) {
		var c = parent.children[i];

		if (c.tagName.toLowerCase() == 'pic') {
			c.outerHTML = c.outerHTML.replace(/\<pic/g, "<img").replace(/\/pic\>/g, "/img>");
		}
	}

	for (var i = 0; i < parent.children.length; i++) {
		var c = parent.children[i];
		var attr = {}
		
		if (c.tagName.toLowerCase() == 'span') {
			c.style.display = 'inline-block';
		}

		if (c.tagName.toLowerCase() == 'icon') {
			var sp = E(document.createElement("span"));
			var id = c.getAttribute('id');
			var name = c.getAttribute('name');
			var shape = c.getAttribute('shape');
			var size = c.getAttribute('size');
			var style = c.getAttribute('style');
			var cls = c.getAttribute('class');
			var tx = c.getAttribute('tx');
			var ty = c.getAttribute('ty');
			var filter = c.getAttribute('filter');
			var arClick = c.getAttribute('click');
			var arClickColor = c.getAttribute('click-color');
			var arClickClass = c.getAttribute('click-class');
			var arClickNoPointer = c.getAttribute('click-no-pointer');
			var arClickKeepBc = c.getAttribute('click-keep-bc');

			sp.html = ar.icon(shape, size);
			parent.replaceChild(sp[0], c);

			if (style)
				sp.attr('style', style); // must be done at first

			sp.display = 'inline-block';

			if (tx)
				sp.tx = tx;

			if (ty)
				sp.ty = ty;

			if (filter)
				sp.filter = filter;

			if (id)
				sp.attr('id', id);

			if (name)
				sp.attr('name', name);

			if (cls)
				sp.cls = cls;

			if (arClick)
				sp.attr('click', arClick);

			if (arClickColor)
				sp.attr('click-color', arClickColor);

			if (arClickClass)
				sp.attr('click-class', arClickClass);

			if (arClickKeepBc)
				sp.attr('click-keep-bc', 1);

			if (arClickNoPointer)
				sp.attr('no-pointer', arClickNoPointer);

			c = sp[0];
		}

		if (c.hasAttribute('click-color'))
			attr['click-color'] = c.getAttribute('click-color');

		if (c.hasAttribute('click-class'))
			attr['click-class'] = c.getAttribute('click-class');

		if (c.hasAttribute('click-keep-bc'))
			attr['click-keep-bc'] = 1;

		if (c.hasAttribute('click')) {
			attr['click'] = c.getAttribute('click');

			if (c.hasAttribute('no-pointer'))
				c.style.cursor = 'default';
			else
				c.style.cursor = 'pointer';

			ar.click(This, c, attr);
		}

		if (c.hasAttribute('slide-left')) {
			attr['slide-left'] = c.getAttribute('slide-left');
			ar.slide(This, 'L', c, attr);
		}

		if (c.hasAttribute('slide-right')) {
			attr['slide-right'] = c.getAttribute('slide-right');
			ar.slide(This, 'R', c, attr);
		}

		if (c.hasAttribute('seen-ani')) {
			var ani = c.getAttribute('seen-ani');
			var aniTime = null;
			var transTime = null;

			if (c.hasAttribute('seen-ani-time')) 
				aniTime = c.getAttribute('seen-ani-time');
			
			if (c.hasAttribute('seen-trans-time')) 
				transTime = c.getAttribute('seen-trans-time');

			c._seenTag = ar.objCnt;
			ar.objCnt++;
			var e = E(c);

			ar._onSeenList[c._seenTag] = {
				dom: c,
				ani: ani,
				aniTime: parseInt(aniTime),
				transTime: parseInt(transTime),
			};
		}

		This.processDirective(c);
	}
}

ArquesScope.prototype.processReplacement = function(html, repeatBlock, bindObj) {
	var This = this;
	var bind = html.match(/\{\{[a-zA-Z0-9\-\\\/\.\_\ \t]*\}\}/g) || [];

	for (var i = 0; i < bind.length; i++) {
		var id = bind[i].substring(2, bind[i].length - 2).trim();

		if (id == '')
			continue;

		var val;

		if (repeatBlock) {
			var idNames = id.split('.');
			val = bindObj;

			for (var k = 0; k < idNames.length; k++) {
				val = val[idNames[k]];

				if (val == undefined || val == null)
					break;
			}
		}
		else {
			val = 'ArquesScope.hash[' + This.id + '].' + id;

			try {
				val = eval(val);
			}
			catch (e) {
				val = undefined;
			}
		}

		html = html.replaceAll(bind[i], val == undefined || val == null ? '' : val);
	}

	var bind = html.match(/\{\{\$\}\}/g) || [];

	for (var i = 0; i < bind.length; i++) {
		var rep = 'ArquesScope.hash[' + This.id + ']';

		try {
			html = html.replaceAll(bind[i], rep);
		}
		catch (e) {
			// error message of a repeat block must be ignored.
		}
	}

	return html;
}

ArquesScope.prototype.processBinding = function(html, repeatBlock, bindObj) {
	var This = this;
	var bind = html.match(/\{\{\:[a-zA-Z0-9\-\\\/\.\_\ \t]*\}\}/g) || [];

	for (var i = 0; i < bind.length; i++) {
		var id = bind[i].substring(3, bind[i].length - 2).trim();

		if (id == '')
			continue;

		function bindIt(id) {
			//
			// replace
			//

			try {
				var val;
				var objTag = ar.objCnt;
				ar.objCnt++;

				if (repeatBlock) {
					var idNames = id.split('.');
					val = bindObj;

					for (var k = 0; k < idNames.length; k++) {
						val = val[idNames[k]];

						if (val == undefined || val == null)
							break;
					}
				}
				else {
					val = 'ArquesScope.hash[' + This.id + '].' + id;
					//ar.log(val);

					try {
						val = eval(val);
					}
					catch (e) {
						val = undefined;
					}
				}

				val = '<span id="__o' + objTag + '__">' + (val == undefined || val == null ? '' : val) + '</span>';
				html = html.replaceAll(bind[i], val);

				//
				// defineProperty
				//

				function makeProperty(parent, property) {
					try {
						//ar.log('parent = ' + JSON.stringify(parent));
						//ar.log('lastId = ' + lastId);

						var realDataPrefix = '__real__';
						parent[realDataPrefix + property] = parent[property];

						Object.defineProperty(parent, property, {
							get : function() {
								return this[realDataPrefix + property];
							},

							set : function(v) {
								try {
									this[realDataPrefix + property] = v;
									document.getElementById('__o' + objTag + '__').innerHTML = v;
								}
								catch (e) {
								}

								return v;
							}
						});
					}
					catch (e) {
					}
				}

				var idNames = id.split('.');
				var parent = bindObj ? bindObj : This;
				var property = null;

				for (var k = 0; k < idNames.length; k++) {
					property = idNames[k];

					if (k == idNames.length - 1)
						break;

					parent = parent[property];

					if (parent == undefined || parent == null)
						break;
				}

				if (parent && property)
					makeProperty(parent, property);
			}
			catch (e) {
				// error message of a repeat block must be ignored.
			}
		}

		bindIt(id);
	}

	return html;
}

/**
 * @method ArquesScope.prototype.free
 * @desc Removes all event, unregisters the scope and deletes the scope from the memory.
 */

ArquesScope.prototype.free = function() {
	var This = this;

	for ( var k in This.__repeat__)
		delete This.__repeat__[k];

	for ( var k in This.__slides__)
		delete This.__slides__[k];

	if (This.div)
		for ( var k in This.ev)
			ar.off(This.div, k, This.ev[k]);

	if (This.ev['__free__'])
		This.ev['__free__']();

	if (This.ev['free'])
		This.ev['free']();

	delete ArquesScope.hash[This.id];
}
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// Scroll
//
Scroll = function(opt) {
	var This = this;

	This.opt = opt;
	This.M_PI_2 = 1.57079632679489661923;
	This.SSMSG_SCROLL = 0x0010;
	This.SSMSG_SCROLL_T = 0x0200;
	This.SSMSG_SCROLL_T_FIX = 0x0210;
	This.BOUNCE_SPEED = 1.15;
	This.ELASTICITY = 0.43;
	This.BOUNCE_ELASTICITY = 4.;
	This.SPEED_FACTOR = 0.135;
	This.mMvQueue = [];
	This.mMsgHandler = new MsgHandler(function(m) {
		This.onAction(m)
	});

	// ELASTICITY: 당겨지는 비율. 클수록 잘 당겨진다.
	// BOUNCE_SPEED: 스크롤 종료 후 튕기는 속도. 작을 수록 천천히 튕긴다. 항상 1 < 이여야 한다.
	// SPEED_FACTOR: 관성크기. 클수록 살짝 튕겨도 멀리 간다.

	This.mTime = 0;
	This.mTimeUp = 0;
	This.mTimeStart = 0;

	This.mIsDown = false;
	This.mIsMoveOn = false;
	This.mIsScrollingT = false;
	This.mIsBounceModeT = false;
	This.mIsUseBounce = true;

	This.mViewLen = 0;
	This.mContentLen = 0;
	This.mDnT = 0;
	This.mMvT = 0;
	This.mUpT = 0;
	This.mStartT = 0;
	This.mRadT = 0;
	This.mRadDa = 0;
	This.mCurDt = 0;
	This.mPrevScrollT = 0;
	This.mScrollT = 0;
	This.mBounceLimitT = 0;
}

Scroll.prototype.setContentLen = function(len) {
	var This = this;
	This.mContentLen = len;
}

Scroll.prototype.getContentLen = function() {
	var This = this;
	return This.mContentLen;
}

Scroll.prototype.setViewLen = function(len) {
	var This = this;
	This.mViewLen = len;
}

Scroll.prototype.getViewLen = function() {
	var This = this;
	return This.mViewLen;
}

Scroll.prototype.refresh = function() {
	var This = this;
	This.setPos(This.mScrollT);
}

Scroll.prototype.getPos = function() {
	return this.mScrollT;
}

Scroll.prototype.setPos = function(t) {
	var This = this;

	This.mScrollT = t;
	This.limitScrollT();

	if (This.opt.onScroll)
		This.opt.onScroll(This.mScrollT);

	if (This.opt.onScrollEnd)
		This.opt.onScrollEnd(true);

	/*
	This.clearMessages(0);
	This.mMsgHandler.start();
	This.mMsgHandler.scheduleMessage(This.SSMSG_SCROLL_T, 0);
	This.mMsgHandler.processMessage();
	*/

	//This.opt.onScroll(This.mScrollT);
}

Scroll.prototype.getScrollT = function() {
	return this.mScrollT;
}

Scroll.prototype.clearMessages = function(action) {
	var This = this;

	This.mMsgHandler.clearMessages(action);

	if (action == 0)
		This.mIsScrollingT = false;
}

Scroll.prototype.calcDistance = function(t) {
	var This = this;

	var dt = t - This.mDnT;
	var nt = This.mPrevScrollT + dt;

	return nt;
}

Scroll.prototype.limitScrollT = function() {
	var This = this;
	This.mScrollT = Math.min(This.getContentLen() - This.getViewLen() + (This.mIsUseBounce ? This.mBounceLimitT : 0), Math.max(This.mIsUseBounce ? -This.mBounceLimitT : 0, This.mScrollT));
	//ar.log(This.mScrollT);
}

Scroll.prototype.onAction = function(m) {
	var This = this;
	var fpsSpeed = ar.FPS_STANDARD / ar.FPS;
	var BOUNCE_LIMIT = 100;

	switch (m.mAction) {
		case This.SSMSG_SCROLL_T: {
			if (This.mIsBounceModeT) {
				if (This.mScrollT < 0) {
					This.mScrollT = Math.max(This.mBounceLimitT, This.mScrollT + This.mCurDt * fpsSpeed);
				}
				else {
					This.mScrollT = Math.min(This.mBounceLimitT, This.mScrollT + This.mCurDt * fpsSpeed);
				}
			}
			else {
				if (This.mScrollT < 0) {
					This.mIsBounceModeT = This.mIsUseBounce;
					This.mBounceLimitT = Math.max(-BOUNCE_LIMIT, This.mCurDt * 7);
				}
				else if (This.mScrollT > This.getContentLen() - This.getViewLen()) {
					This.mIsBounceModeT = This.mIsUseBounce;
					This.mBounceLimitT = This.getContentLen() - This.getViewLen() + Math.min(BOUNCE_LIMIT, This.mCurDt * 7);
				}
				else {
					This.mCurDt *= Math.cos(This.mRadT);
					This.mScrollT += This.mCurDt * fpsSpeed;
					This.mRadT = Math.min(This.M_PI_2, This.mRadT + This.mRadDa); // mRadDa가 작을수록 This.mCurDt 값이 천천히 감소하므로, 더 부드럽게 멈춰진다
				}
			}
			
			This.limitScrollT();

			if (This.opt.onScroll)
				This.opt.onScroll(This.mScrollT);
			
			if (This.mIsBounceModeT && ((This.mScrollT < 0 && This.mScrollT <= This.mBounceLimitT) || (This.mScrollT > This.getContentLen() - This.getViewLen() && This.mBounceLimitT <= This.mScrollT))) {
				This.clearMessages(This.SSMSG_SCROLL_T);
				This.clearMessages(This.SSMSG_SCROLL_T_FIX);
				This.mMsgHandler.scheduleMessage(This.SSMSG_SCROLL_T_FIX, 1000 / ar.FPS);
			}
			else if (This.mIsUseBounce == false && This.mScrollT < 0) {
				This.mScrollT = 0;
				This.mMsgHandler.stop();

				if (This.opt.onScrollEnd)
					This.opt.onScrollEnd(true);
			}
			else if (This.mIsUseBounce == false && This.mScrollT > This.getContentLen() - This.getViewLen()) {
				This.mScrollT = This.getContentLen() - This.getViewLen();
				This.mMsgHandler.stop();

				if (This.opt.onScrollEnd)
					This.opt.onScrollEnd(true);
			}
			else if (This.mRadT < This.M_PI_2) {
				This.mMsgHandler.scheduleMessage(This.SSMSG_SCROLL_T, 1000 / ar.FPS);
			}
			else {
				This.mMsgHandler.stop();

				if (This.opt.onScrollEnd)
					This.opt.onScrollEnd(true);
			}
		}
			break;

		case This.SSMSG_SCROLL_T_FIX: {
			if (This.mScrollT <= 0) {
				This.mScrollT /= Math.pow(This.BOUNCE_SPEED, fpsSpeed);

				if (-1 < This.mScrollT)
					This.mScrollT = 0;
			}
			else if (This.mScrollT > This.getContentLen() - This.getViewLen()) {
				var dt = (This.mScrollT - (This.getContentLen() - This.getViewLen())) / Math.pow(This.BOUNCE_SPEED, fpsSpeed);

				if (dt < 1)
					dt = 0;

				This.mScrollT = This.getContentLen() - This.getViewLen() + dt;
			}

			This.limitScrollT();

			if (This.opt.onScroll)
				This.opt.onScroll(This.mScrollT);

			if (This.mScrollT < 0 || This.mScrollT > This.getContentLen() - This.getViewLen()) {
				This.mMsgHandler.scheduleMessage(This.SSMSG_SCROLL_T_FIX, 1000 / ar.FPS);
			}
			else {
				This.mMsgHandler.stop();
				if (This.opt.onScrollEnd)
					This.opt.onScrollEnd(true);
			}
		}
			break;
	}
}

Scroll.prototype.onDn = function(t) {
	var This = this;

	if (This.mIsDown)
		return;

	This.clearMessages(0);
	This.mMsgHandler.start();

	var time = ar.tick();

	This.mTime = time;
	This.mTimeStart = time;
	This.mIsScrollingT = true;
	This.mIsDown = true;
	This.mIsMoveOn = false;
	This.mIsBounceModeT = false;
	This.mBounceLimitT = 0;
	This.mDnT = t;
	This.mStartT = t;
	This.mPrevScrollT = This.mScrollT;
	This.mMvQueue = [];
	This.mRadT = 0;
	This.mRadDa = This.M_PI_2;
	This.mCurDt = 0;

	if (This.opt.onScroll)
		This.opt.onScroll(This.mScrollT);

	setTimeout(function() {
		This.mMsgHandler.processMessage();
	}, 0);
}

Scroll.prototype.onMv = function(t) {
	var This = this;

	if (This.mIsDown == false)
		return;

	if (This.opt.moveThreshold) {
		if (This.mIsMoveOn == false && Math.abs(t - This.mDnT) > This.opt.moveThreshold) {
			This.mIsMoveOn = true;
			This.mDnT = t;
		}

		if (This.mIsMoveOn == false)
			return;
	}

	var time = ar.tick();

	if (time - This.mTimeStart > 300) {
		This.mStartT = t;
		This.mTimeStart = time;
	}

	var q = {};
	q.t = t;
	q.time = time;

	This.mMvT = t;
	This.mMvQueue.push(q);

	if (This.mMvQueue.length > 50)
		This.mMvQueue.splice(0, 1);

	var nt = This.calcDistance(t);

	if (nt < 0)
		nt *= This.ELASTICITY;
	else if (nt > This.getContentLen() - This.getViewLen())
		nt = This.getContentLen() - This.getViewLen() + (nt - (This.getContentLen() - This.getViewLen())) * This.ELASTICITY;

	This.mScrollT = nt;
	This.limitScrollT();

	if (This.opt.onScroll)
		This.opt.onScroll(This.mScrollT);
}

Scroll.prototype.onUp = function(t) {
	var This = this;

	This.mTimeUp = ar.tick();
	This.mIsDown = false;
	This.mUpT = t;

	// touch down 후 한참 있다 빠르게 swiping 하는 액션도 고려한다
	// This.mStartT, mTimeStart는 스와이핑 액션이 시작되는 기준점이다. down pos와 관계 없이 move event handler 내에서 시간 체크를 하면서 계속 변한다

	var prevTime = This.mTimeUp;
	var moveTime = 0;
	var isQuickUp = false;
	var TRIGGER_TIME_MOVE = ar.isIos() ? 150 : 300;
	var TRIGGER_TIME_UP = ar.isIos() ? 300 : 700;

	//$('#d').html(JSON.stringify(This.mMvQueue));	

	if (This.mMvQueue.length < 3 && Math.abs(This.mUpT - This.mDnT) > 70)
		isQuickUp = true;
	else
		while (This.mMvQueue.length > 0 && moveTime < TRIGGER_TIME_MOVE) {
			var q = This.mMvQueue.pop();
			moveTime += (prevTime - q.time);
			prevTime = q.time;

			if (moveTime < TRIGGER_TIME_MOVE && Math.abs(t - q.t) > 20) {
				isQuickUp = true;
				break;
			}
		}

	//ar.log(This.mMvQueue.length + ',' + This.mUpT + ',' + This.mDnT + ',' + isQuickUp);

	var time = This.mTimeUp - This.mTimeStart;
	var isFastTouchUp = time < TRIGGER_TIME_UP && isQuickUp;

	var dt = t - This.mStartT;
	var nt = This.calcDistance(t);

	if (This.mIsUseBounce && (nt < 0 || nt > This.getContentLen() - This.getViewLen()))
		dt *= This.ELASTICITY;

	if (isFastTouchUp) {
		This.mRadT = 0;
		This.mRadDa = This.M_PI_2 / Math.min(600, 30000 / time);
		This.mCurDt = dt * This.SPEED_FACTOR;
	}
	else {
		This.mRadT = 0;
		This.mRadDa = This.M_PI_2;
		This.mCurDt = 0;
	}

	This.mMsgHandler.scheduleMessage(This.SSMSG_SCROLL_T, 0);
}

Scroll.prototype.onCn = function() {
	var This = this;
	This.onUp(This.mMvT);
}

Scroll.prototype.stop = function() {
	var This = this;

	This.mMsgHandler.stop();
	This.clearMessages(0);
}
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

Split = function(id, opt) {
	var con = E(id);
	con.scanAll();
	con.splitters = [];
	
	var chil = con.children;

	if (chil.length <= 1) {
		ar.log('To split one div, it must have more than one child.');
		return con;
	}

	if (opt != ar.COL && opt != ar.ROW) {
		ar.log('Please specify ar.COL or ar.ROW to the second paramter of Split().');
		return con;
	}

	if (opt == ar.COL)
		con.addCls('ar-split-box');

	con.html = con.html.replace(/\>[\s\n]+\</g, '><');
	con.scanAll();
	var chil = con.children;
	var prevSplitter = null;

	for (var i = chil.length - 1; i > 0; i--) {
		var link1 = chil[i - 1];
		var link2 = chil[i];
		var a = new ArquesSplitter('<div id="__ar_split_' + Split.splitIds + '"></div>', link1, link2, opt);
		con.insert(i, a);
		Split.splitIds++;
		con.splitters.push(a);
		
		if (prevSplitter) {
			prevSplitter.prev = a;
			a.next = prevSplitter;
		}
		
		prevSplitter = a;
	}
	
	return con;
}

Split.splitIds = 0;
Split.splits = [];

//
// ArquesSplitter
//

ArquesSplitter = function(id, link1, link2, opt) {
	var This = this;

	ArquesElement.call(This, id);

	Split.splits.push(This);
	This.scope = Scope(This[0]);
	This._id = This.attr('id');
	This._type = opt;
	This.onChanged = null;
	This.isHorz = true;
	This.isDn = false;
	This.prev = null;
	This.next = null;
	This.link = [];
	This.addCls('ar-split-bar');
	This.scanAll();
	This.posDn = {
		x : 0,
		y : 0
	};
	This.posMv = {
		x : 0,
		y : 0
	};

	//	for (var j = 0; j < Split.splits.length; j++)
	//		Split.splits[j].makeLink(This);
	//
	//	This.makeLink();

	if (This._type == ar.COL) {
		This.L = link1;
		This.R = link2;
		This.L.addCls('ar-split-col');
		This.R.addCls('ar-split-col');
		This.addCls('ar-split-col');
		This.w = 5;
		This.cursor = 'col-resize';
	}
	else {
		This.isHorz = false;
		This.T = link1;
		This.B = link2;
		This.T.addCls('ar-split-row');
		This.B.addCls('ar-split-row');
		This.addCls('ar-split-row');
		This.h = 5;
		This.cursor = 'row-resize';
	}

	var win = E(window);
	This.onDn = function(e, isFromLink) {
		if (This.isHorz) {
			if (e.target != This[0])
				return true;
		}
		else {
			if (e.target != This[0])
				return true;
		}

		This.isDn = true;
		This.posDn = ar.evPos(e);

		if (!isFromLink)
			for (var i = 0; i < This.link.length; i++) {
				var e2 = ar.ev(This.posDn.x, This.posDn.y);
				e2.target = This.link[i][0];
				This.link[i].onDn(e2, true);
			}

		This.Lmax = (This.next ? This.next.x - This.parent.x - (This.w + 1) : This.parent.w - This.w) - (This.prev ? This.prev.x - This.parent.x + This.prev.w : 0);
		This.Tmax = (This.next ? This.next.y - This.parent.y - This.h : This.parent.h - This.h) - (This.prev ? This.prev.y - This.parent.y + This.prev.h : 0);

		if (This.isHorz) {
			This.Lw = This.L.frameMP.w;
			This.Lminw = This.L.minw;
			This.Rminw = This.R.minw;
			This.Lmaxw = This.L.maxw;
			This.Rmaxw = This.R.maxw;
			This.Lmp = This.L.ml + This.L.mr + This.L.pl + This.L.pr;
			This.Rmp = This.R.ml + This.R.mr + This.R.pl + This.R.pr;
		}
		else {
			This.Th = This.T.frameMP.h;
			This.Tminh = This.T.minh;
			This.Bminh = This.B.minh;
			This.Tmaxh = This.T.maxh;
			This.Bmaxh = This.B.maxw;
			This.Tmp = This.T.mt + This.T.mb + This.T.pt + This.T.pb;
			This.Bmp = This.B.mt + This.B.mb + This.B.pt + This.B.pb;
		}
	};

	win.on(ar.EV_DN, This.onDn, true);

	This.onMv = function(e) {
		This.posMv = ar.evPos(e);

		if (This.isHorz) {
			var diff = This.posMv.x - This.posDn.x;

			This.L.w = Math.max(0, Math.min(This.Lmax, This.Lw + diff)) - This.Lmp;

			if (This.Lminw)
				This.L.w = Math.max(This.L.w, This.Lminw);
			if (This.Lmaxw)
				This.L.w = Math.min(This.L.w, This.Lmaxw);

			This.R.w = Math.max(0, This.Lmax - This.L.w) - This.Rmp;

			if (This.Rminw)
				This.R.w = Math.max(This.R.w, This.Rminw);
			if (This.Rmaxw)
				This.R.w = Math.min(This.R.w, This.Rmaxw);
		}
		else {
			var diff = This.posMv.y - This.posDn.y;

			This.T.h = Math.max(0, Math.min(This.Tmax, This.Th + diff)) - This.Tmp;

			if (This.Tminh)
				This.T.h = Math.max(This.T.h, This.Tminh);
			if (This.Tmaxh)
				This.T.h = Math.min(This.T.h, This.Tmaxh);

			This.B.h = Math.max(0, This.Tmax - This.T.h) - This.Bmp;

			if (This.Bminh)
				This.B.h = Math.max(This.B.h, This.Bminh);
			if (This.Bmaxh)
				This.B.h = Math.min(This.B.h, This.Bmaxh);
		}
	};

	win.on(ar.EV_MV, function(e) {
		if (This.isDn == false)
			return true;

		var r = This.onMv(e);
		Scope.broadcast('size', This);
		return r;
	}, true);

	win.on(ar.EV_UP, function(e) {
		for (var i = 0; i < This.link.length; i++)
			This.link[i].isDn = false;

		Scope.broadcast('size', This);
		This.isDn = false;
		return true;
	}, true);

	//	win.on(ar.EV_CN, function(e) {
	//		var p = ar.evPos(e);
	//		//ar.log(p);
	//		
	//		if (p.x < 0 || p.y < 0 || p.x > win.w || p.y > win.h)
	//			This.isDn = false;
	//	}, true);

	This.scope.on('size', function(param) {
		if (This.isDn)
			return;

		if (param == undefined && This.next == null) { // only do when window size is changed
			if (This.isHorz) {
				This.R.w = This.parent.w - (This.x - This.parent.x) - This.w;
			}
			else {
				This.B.h = This.parent.h - (This.y - This.parent.y) - This.h;
			}
		}
	});

	This._onSetW = function() {
		This.refresh();

		if (This.onChanged)
			This.onChanged(This.con.children, This.index);
	};

	This._onSetH = This._onSetW;
	This.refresh();
}

ArquesSplitter.prototype = Object.create(ArquesElement.prototype, {
	makeLink : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(ele) {
			var This = this;
			var link = This.attr('link');

			if (This == ele || !link)
				return;

			var ids = link.trim().split(' ');

			if (ele)
				for (var i = 0; i < ids.length; i++) {
					if (ids[i] == ele._id) {
						This.link.push(ele);
						return;
					}
					continue;
				}
			else
				for (var i = 0; i < ids.length; i++)
					for (var j = 0; j < Split.splits.length; j++) {
						if (Split.splits[j] == This)
							continue;
						else if (Split.splits[j]._id == ids[i])
							This.link.push(Split.splits[j]);
					}
		}
	},

	refresh : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(id) {
			var This = this;
		}
	},
});
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

Tabs = function(id) {
	var a = new ArquesTabs(id);
	return a;
}

//
// ArquesTabs
//

ArquesTabs = function(id) {
	var This = this;

	ArquesElement.call(This, id);

	This.scope = Scope(This[0]);
	This.scanAll();
	This._id = This.attr('id');
	This._index = 0;
	This.onChanged = null;

	This.color = {};
	This.color._activeText = 'white';
	This.color._activeBack = 'blue';

	var tempChil = This.children;
	This.clear();

	This.back = E('<div style="user-select:none;"></div>');
	This.back.position = 'relative';
	This.back.overflow = 'hidden';
	ArquesElement.prototype.add.call(This, This.back);

	This.con = E('<div style="user-select:none;"></div>');
	This.con.position = 'relative';
	This.con.overflow = 'hidden';
	ArquesElement.prototype.add.call(This, This.con);

	This.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.con.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.scope.on('size', function() {
		This.refresh();
	});
	
	This._onSetW = function() {
		This.refresh();

		if (This.onChanged)
			This.onChanged(This.con.children, This.index);
	};

	This._onSetH = This._onSetW;
	
	for (var i = 0; i < tempChil.length; i++)
		This.add(tempChil[i]);

	This.refresh();
}

ArquesTabs.prototype = Object.create(ArquesElement.prototype, {
	add : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(e) {
			var This = this;

			if (!ar.isE(e))
				e = E(e);
			
			if (e.attr('back') != null)
				This.back.add(e);
			else
				This.con.add(e);

			e.position = 'absolute';
			e.cursor = 'pointer';
			e._normalFc = e.fc;
			e._normalBc = e.bc;
			e.scanAll();

			e.on(ar.EV_CK, function() {
				This.index = This.con.indexOf(e);

				if (This.onChanged)
					This.onChanged(This.con.children, This.index);
			});

			This.refresh();
			return e;
		}
	},

	del : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(index) {
			var This = this;
			var children = This.children;

			This.con.del(index);
			This.refresh();
		}
	},

	refresh : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(id) {
			var This = this;

			if (This.con.count == 0)
				return;

			This.back.w = This.w;
			This.back.h = This.h;
			
			This.con.x = 0;
			This.con.y = -This.h;
			This.con.w = This.w;
			This.con.h = This.h;

			var chil = This.con.children;
			var x = 0;
			var w = This.w / chil.length;

			for (var i = 0; i < chil.length; i++) {
				chil[i].fc = chil[i]._normalFc;
				chil[i].bc = chil[i]._normalBc;
				chil[i].x = x;
				chil[i].y = 0;
				chil[i].w = w;
				chil[i].h = This.h;

				x += w;
			}

			chil[This._index].fc = This.color._activeText;
			chil[This._index].bc = This.color._activeBack;
		}
	},
});

Object.defineProperty(ArquesTabs.prototype, 'index', {
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

Object.defineProperty(ArquesTabs.prototype, 'backs', {
	get : function() {
		var This = this;
		return This.back.children;
	},

	set : function(v) {
		var This = this;
		ar.log('Tabs.backs property is readonly!');
	},
});

Object.defineProperty(ArquesTabs.prototype, 'count', {
	get : function() {
		var This = this;
		if (!This.con)
			return 0;
		return This.con.children.length;
	},

	set : function(v) {
		var This = this;
		ar.log('ArquesTabs.count property is readonly!');
	},
});

Object.defineProperty(ArquesTabs.prototype, 'tabs', {
	get : function() {
		var This = this;
		return This.con.children;
	},

	set : function(v) {
		var This = this;
		ar.log('Tabs.tabs property is readonly!');
	},
});

Object.defineProperty(ArquesTabs.prototype, 'activeFc', {
	get : function() {
		var This = this;
		return This.color._activeText;
	},

	set : function(v) {
		var This = this;
		This.color._activeText = v;
		This.refresh();
	},
});

Object.defineProperty(ArquesTabs.prototype, 'activeBc', {
	get : function() {
		var This = this;
		return This.color._activeBack;
	},

	set : function(v) {
		var This = this;
		This.color._activeBack = v;
		This.refresh();
	},
});
/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

/**
 * @namespace ar
 * @desc <b>ar</b> singleton is the core singleton to use Arques Engine.
 */

ar.RADIAN = 0x10;
ar.DEGREE = 0x20;

ar._isInited = false;
ar._isNodeJS = false;
ar._isCordova = false;
ar._isAndroidOld = false;
ar._isUseDebugWindow = false;
ar._isStatusBarShowing = true;
ar._statusBarHeight = 20;
ar._domain = '.';
ar._subUrl = '';
ar._click_time = 0;
ar._lang = {};
ar._curLang = 'en';
ar._curLangUrl = null;
ar._customStyleUrl = null;
ar._angleUnit = ar.DEGREE;
ar._onSeenList = {};

ar.title = 'Arques';
ar.clickObj = null;
ar.pathDb = null;
ar.pathApp = null;
ar.pathDoc = null;
ar.pathDat = null;
ar.evs = {};

ar.EV_DN = 'touchstart';
ar.EV_MV = 'touchmove';
ar.EV_UP = 'touchend';
ar.EV_CN = 'touchcancel';
ar.EV_CK = 'click';

ar.EV_DS = 'dragstart';
ar.EV_DE = 'dragend';
ar.EV_DR = 'drag';
ar.EV_DP = 'drop';
ar.EV_DO = 'dragover';
ar.EV_DT = 'dragenter';
ar.EV_DL = 'dragleave';

ar.LEFT = 'left';
ar.RIGHT = 'right';
ar.TOP = 'top';
ar.BOTTOM = 'bottom';
ar.CENTER = 'center';
ar.COL = 'col';
ar.ROW = 'row';

ar.evCnt = 0;
ar.objCnt = 0;
ar.adHeight = 0;
ar.ADPOS_TOP = 10;
ar.ADPOS_BTM = 10;
ar.adPos = ar.ADPOS_BTM;
ar.ARQUES_logCnt = 0;
ar.FPS_STANDARD = 60;
ar.FPS = 60;

//
// Utils
//

ar.logPrefix = 'Arques: ';

/**
 * @func log
 * @memberOf ar
 * @desc Prints a log in console.
 */

ar.log = function(v) {
	//		if (true)
	//			return;

	//ar.printCallStack();

	if (typeof v == 'object')
		v = JSON.stringify(v);

	console.log(ar.logPrefix + v);
}

/**
 * @func logCS
 * @memberOf ar
 * @desc Prints the callstack until this line.
 */

ar.logCS = function() { // http://stackoverflow.com/questions/4671031/print-function-log-stack-trace-for-entire-program-using-firebug
	var stack = new Error().stack;
	console.log('------------CallStack--------------');
	console.log(stack);
	console.log('===================================');
}

/**
 * @func osVer
 * @memberOf ar
 * @desc Returns current OS version.
 */

ar.osVer = function() {
	return typeof device == 'undefined' ? 0 : device.version;
}

/**
 * @func pad
 * @memberOf ar
 * @param {integer} num - number to be filled with '0'
 * @param {integer} size - number of digit
 * @desc Fills 0 as many as the size.
 */

ar.pad = function(num, size) { // http://stackoverflow.com/questions/2998784/how-to-output-integers-with-leading-zeros-in-javascript
	return ('000000000' + num).substr(-size);
}

/**
 * @func copy
 * @memberOf ar
 * @param {json} object - Json object to be copied
 * @desc Copies json object by using JSON.parse(JSON.stringify(o)).
 */

ar.copy = function(o) {
	return JSON.parse(JSON.stringify(o));
}

/**
 * @func 
 * @memberOf ar
 * @param {string} src - Source version string
 * @param {string} dst - Destination version string
 * @desc Compares version string of A and B. String length must be same otherwise it returns the difference of the length.
 * @return {integer} 0 is identical and the other number is the difference
 */

ar.cmpVer = function(a, b) { // http://stackoverflow.com/questions/6832596/how-to-compare-software-version-number-using-js-only-number
	var i, l, diff, segmentsA, segmentsB;

	a = '' + a;
	b = '' + b;

	segmentsA = a.replace(/(\.0+)+$/g, '').split('.');
	segmentsB = b.replace(/(\.0+)+$/g, '').split('.');
	l = Math.min(segmentsA.length, segmentsB.length);

	for (i = 0; i < l; i++) {
		diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
		if (diff !== 0) {
			return diff;
		}
	}
	return segmentsA.length - segmentsB.length;
}

/**
 * @func urlToHash
 * @memberOf ar
 * @param {string} url - URL to be parsed
 * @desc Parses url parameters and returns a hash structure.
 * @return {object} Returns a hash structure of parsed parameters
 */

ar.urlToHash = function(url) { // http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters 
	var vars = {};
	var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
		vars[key] = value;
	});
	return vars;
}

/**
 * @func setAngleUnit
 * @memberOf ar
 * @param {integer} angleUnit - Angle Unit. Use ar.DEGREE or ar.RADIAN.
 * @desc Sets the default global angle unit. You can choose an appropriate unit what you want to use for your project.
 */

ar.setAngleUnit = function(v) {
	ar._angleUnit = v;
}

/**
 * @func setDomain
 * @memberOf ar
 * @param {string} domain - Default domain for networking
 * @desc Sets the default domain for networking. All network methods of Arques will use this domain.
 */

ar.setDomain = function(domain) {
	if (domain[domain.length - 1] == '/')
		domain = domain.slice(0, -1);

	ar._domain = domain;
}

//
//
//

/**
 * @func run
 * @memberOf ar
 * @param {integer} delay - Milliseconds to be delayed
 * @param {function} cb - Callback to be called after the delay
 * @desc Substitutes setTimeout.
 * @return {integer} ID returned by setTimeout
 */

ar.run = function(delay, func) {
	return setTimeout(func, delay);
}

/**
 * @func isPrefix
 * @memberOf ar
 * @param {string} source - Source string to be checked
 * @param {string} prefix - Prefix string to check with
 * @desc Checks if source string has the specified prefix.
 * @return {boolean} Returns true if it's identical
 */

ar.isPrefix = function(str, prefix) {
	return str && str.indexOf(prefix) == 0;
}

/**
 * @func isSuffix
 * @memberOf ar
 * @param {string} source - Source string to be checked
 * @param {string} suffix - Suffix string to check with
 * @desc Checks if source string has the specified suffix.
 * @return {boolean} Returns true if it's identical
 */

ar.isSuffix = function(str, suffix) {
	return str && str.substring(str.length - suffix.length) == suffix;
}

/**
 * @func tick 
 * @memberOf ar
 * @desc Returns the number of milliseconds since midnight of January 1, 1970
 * @return {integer} Milliseconds
 */

ar.tick = function() {
	return (new Date()).getTime();
}

/**
 * @func isValid
 * @memberOf ar
 * @desc Is object defined and not null?
 * @param {object} object - Object to be checked
 * @return {boolean} Returns true if the object is defined and not null.
 */

ar.isValid = function(a) {
	return typeof a != 'undefined' && a != null;
}

Object.defineProperty(ar, 'isStatusBarShowing', {
	get : function() {
		return this._isStatusBarShowing;
	},

	set : function(v) {
		ar._isStatusBarShowing = v;
	},
});

Object.defineProperty(ar, 'statusBarHeight', {
	get : function() {
		return this._statusBarHeight;
	},

	set : function(v) {
		ar._statusBarHeight = v;
	},
});

/**
 * @func str
 * @memberOf ar
 * @desc Returns a string of specifed id for the current language
 * @param {string} id - Text ID
 * @return {string} Returns the text of the specifed ID
 */

ar.str = function(id) {
	return ar._lang[ar._curLang][id];
}

ar.lpad = function(v, c) {
	return ('00000000000000' + v).slice(-c);
}

/**
 * @func strWidth
 * @memberOf ar
 * @desc Returns pixel width of specified text.
 * @param {string} text - Text
 * @param {string} [textClass] - CSS class name to measure with
 * @param {string} [textStyle] - CSS style text to measure with
 * @return {integer} Returns the width of the specifed text
 */

ar.strWidth = function(text, textClass, textStyle) {
	// original from http://stackoverflow.com/questions/1582534/calculating-text-width-with-jquery

	if (!textClass)
		textClass = '';

	if (!textStyle)
		textStyle = '';

	var tempSpan = E('<span id="tempColumnWidth" class="' + textClass + '" style="position:absolute;top:-1000px;' + textStyle + '">' + text + '</span>');
	E('body').add(tempSpan);

	var rect = tempSpan[0].getBoundingClientRect();
	tempSpan.free();

	return rect.width;
}

/**
 * @func strHeight
 * @memberOf ar
 * @desc Returns pixel height of specified text.
 * @param {string} text - Text
 * @param {string} [textClass] - CSS class name to measure with
 * @param {string} [textStyle] - CSS style text to measure with
 * @return {integer} Returns the height of the specifed text
 */

ar.strHeight = function(text, textClass, textStyle) {
	// original from http://stackoverflow.com/questions/1582534/calculating-text-width-with-jquery

	if (!textClass)
		textClass = '';

	if (!textStyle)
		textStyle = '';

	var tempSpan = E('<span id="tempColumnWidth" class="' + textClass + '" style="display:none;' + textStyle + '">' + text + '</span>').appendTo(E('body'));
	var h = tempSpan.height();
	tempSpan.free();

	return h;
}

/**
 * @func uuid
 * @memberOf ar
 * @desc Returns a new uuid.
 * @return {string} Returns 36 bytes uuid string
 */

ar.uuid = function() // from http://jsfiddle.net/briguy37/2mvfd/
{
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});

	return uuid;
}

/**
 * @func rand
 * @memberOf ar
 * @desc Returns a random integer number between min and max.
 * @return {string} Returns 36 bytes uuid string
 */

ar.rand = function(min, max) { // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

/**
 * @func ymdHms
 * @memberOf ar
 * @desc Returns the current time by format of YMDHMS.
 * @param {boolean} [isHumanReadable]
 * @return {string} Returns ymdHms string
 */

ar.ymdHms = function(isHumanReadable) {
	var d = new Date();
	var yyyy = d.getFullYear().toString();
	var mon = (d.getMonth() + 1).toString(); // getMonth() is zero-based
	var dd = d.getDate().toString();
	var hh = "" + d.getHours();
	var mm = "" + d.getMinutes();
	var ss = "" + d.getSeconds();

	mon = mon[1] ? mon : "0" + mon[0];
	dd = dd[1] ? dd : "0" + dd[0];
	hh = hh[1] ? hh : "0" + hh[0];
	mm = mm[1] ? mm : "0" + mm[0];
	ss = ss[1] ? ss : "0" + ss[0];

	if (isHumanReadable)
		return mon + '/' + dd + ', ' + yyyy + ' ' + hh + ':' + mm + ':' + ss;
	else
		return yyyy + mon + dd + hh + mm + ss;
}

/**
 * @func toHex
 * @memberOf ar
 * @desc Returns converted hex string(without '0x' prefix).
 * @param {integer} Integer number to be converted
 * @return {string} Returns the hex string
 */

ar.toHex = function(x) {
	if (x == undefined || isNaN(x))
		return null;

	return x.toString(16);
};

/**
 * @func loop
 * @memberOf ar
 * @desc Loops callback until it returns false at intervals of 20ms
 * @param {function} callback
 */

ar.loop = function(cb) {
	var loopImpl = function() {
		if (cb() == false)
			return;

		ar.run(20, loopImpl);
	}

	ar.run(20, loopImpl);
};

/**
 * @func ani
 * @memberOf ar
 * @desc Runs animation.
 * @param {object} opt - Specify object as below:<br>
 * 	{<br>
 * 	obj: object, // E_or_DOM object to be animated<br>
 * 	name: animationName, // please refer to https://daneden.github.io/animate.css/ for the name<br>
 * 	cb: function() {}, // callback is called after <b>ar.css.aniTime</b> milliseconds<br>
 * 	}<br>
 */

ar.ani = function(opt) {
	var This = this;

	if (opt.name == undefined || opt.name == null) {
		ar.log('ar.ani: opt.name is required.');
		return;
	}

	if (opt.animatedClass == undefined)
		opt.animatedClass = 'animated';

	if (ArquesElement.prototype.isPrototypeOf(opt.obj))
		opt.obj = opt.obj[0];

	opt.obj.className = opt.obj.className.replaceAll(opt.animatedClass, '').trim();
	opt.obj.className = opt.obj.className.replaceAll(opt.name, '').trim();

	if (opt.obj.__last_ani_name__)
		opt.obj.className = opt.obj.className.replaceAll(opt.obj.__last_ani_name__, '').trim();

	opt.obj.__last_ani_name__ = opt.name;
	//opt.obj.style.visibility = 'hidden';

	ar.run(1, function() {
		opt.obj.style.visibility = 'visible';
		opt.obj.className += ' ' + opt.animatedClass;
		opt.obj.className += ' ' + opt.name;

		ar.run(ar.css.aniTime, function() {
			//opt.obj.className = opt.obj.className.replaceAll(opt.animatedClass, '').trim();
			//opt.obj.className = opt.obj.className.replaceAll(opt.name, '').trim();

			//ar.log(opt.obj.className);
			if (opt.cb)
				opt.cb();
		});
	});
}

/**
 * @func localPos
 * @memberOf ar
 * @desc Returns local { x, y } of the event (mouse or touch) on E_or_DOM.
 * @param {object} element - E_or_DOM object
 * @param {object} event - A mouse event object or a touch event object
 */

ar.localPos = function(ele, event) {
	if (!ArquesElement.prototype.isPrototypeOf(ele))
		ele = E(ele);

	var x = event.pageX - ele.x;
	var y = event.pageY - ele.y;

	return {
		x : x,
		y : y
	};
}

//
// Init
//

ar.init = function() {
	var This = this;

	if (ar._isInited)
		return;

	// http://stackoverflow.com/questions/17226169/how-to-check-weather-the-device-is-ipad-and-tablet-in-phonegap
	var agent = typeof navigator == 'undefined' ? '' : navigator.userAgent.toLowerCase();
	ar._isCordova = typeof cordova == 'undefined' ? false : true;
	ar._isNodeJS = typeof module == 'undefined' ? false : true;
	ar._isWebkit = agent.indexOf("applewebkit") > 0;
	ar._isIpad = agent.indexOf("ipad") > 0;
	ar._isIos = agent.indexOf("iphone") > 0 || agent.indexOf("ipod") > 0 || agent.indexOf("ipad") > 0;
	ar._isAndroid = agent.indexOf("android") > 0;
	ar._isNewBlackBerry = agent.indexOf("applewebkit") > 0 && agent.indexOf("blackberry") > 0;
	ar._isWebOS = agent.indexOf("webos") > 0;
	ar._isWin = agent.indexOf("iemobile") > 0;
	ar._isMobile = ar._isIos || ar._isAndroid || ar._isNewBlackBerry || ar._isWebOS || ar._isWin;
	ar._isTablet = ar._isIpad || (ar._isAndroid && navigator.userAgent.indexOf("Mobile") <= 0);
	ar._isAndroidOld = ar.isAndroid() && ar.cmpVer('5.1', ar.osVer()) > 0; // doesn't need because of xwalk

	ar.EV_DN = ar._isMobile ? 'touchstart' : 'mousedown';
	ar.EV_MV = ar._isMobile ? 'touchmove' : 'mousemove';
	ar.EV_UP = ar._isMobile ? 'touchend' : 'mouseup';
	ar.EV_CN = ar._isMobile ? 'touchcancel' : 'mouseout';
	ar.EV_CK = ar._isMobile ? 'touchstart' : 'click';

	ar.evs[ar.EV_DN] = {};
	ar.evs[ar.EV_MV] = {};
	ar.evs[ar.EV_UP] = {};
	ar.evs[ar.EV_CN] = {};

	ar.onGlobalDn = null;
	ar.onGlobalMv = null;
	ar.onGlobalUp = null;
	ar.onGlobalCn = null;
	ar.onGlobalCk = null;

	if (This.isNodeJS()) { // for nodejs
	}
	else {
		ar._url = document.location.href;
		ar._domain = location.protocol + '//' + location.host;
		ar._subUrl = location.pathname.substring(0, location.pathname.lastIndexOf("/"));

		ar.css.init();

		function findTarget(idPrefix, e) {
			var target = e.target;
			var hash = ar.evs[idPrefix];

			while (ar._ev_target_ == null && target && target.getAttribute) {
				var ev_id = target.getAttribute(idPrefix + '_ev_id');

				if (!ev_id || !hash) {
					target = target.parentNode;
					continue;
				}

				var handlers = hash[ev_id];

				if (handlers)
					return {
						target : target,
						handlers : handlers
					};

				target = target.parentNode;
			}

			return null;
		}

		function findAndRunEventTarget(idPrefix, e) {
			var info = findTarget(idPrefix, e);

			if (info) {
				ar._ev_target_ = info.target;

				for (var i = 0; i < info.handlers.length; i++)
					info.handlers[i].handler(e);
			}
		}

		function compileDoc() {
			function compileDocImpl() {
				if (ar._customStyleUrl) {
					var head = document.getElementsByTagName('head')[0];
					var link = document.createElement('link');
					link.id = '__arques_custom_style__';
					link.rel = 'stylesheet';
					link.type = 'text/css';
					link.href = ar._customStyleUrl;
					link.media = 'all';
					head.appendChild(link);
				}
				
				ar._isInited = true;
				ar.scope.div = document.body;
				ar.compile({
					scope : ar.scope,
					root : document.body,
					cb : function() {
						Scope.broadcast('inited');
						ar.run(100, function() {
							Scope.broadcast('size');
							ar.onScroll();
						});
					},
				});
			}

			if (ar._curLangUrl) {
				if (!ar._domain) {
					ar.log('Please specify the server domain by ar.setDomain(url)');
					compileDocImpl();
					return;
				}

				var script = document.createElement('script');
				script.src = ar._domain + '/' + ar._curLangUrl;
				script.onload = compileDocImpl();
				document.head.appendChild(script);
			}
			else
				compileDocImpl();
		}

		function initEvents() {
			document.addEventListener('DOMContentLoaded', function() {
				document.body.parentNode.addEventListener(ar.EV_DN, function(e) {
					if (ar.onGlobalDn)
						ar.onGlobalDn(e);

					ar._ev_target_ = null;
					findAndRunEventTarget(ar.EV_DN, e);

					return false;
				}, true);

				document.body.parentNode.addEventListener(ar.EV_MV, function(e) {
					//ar.log('moving: ' + ar._ev_target_);

					var r = false;

					if (ar.onGlobalMv)
						ar.onGlobalMv(e);

					if (ar._ev_target_) {
						var hash = ar.evs[ar.EV_MV];
						var ev_id = ar._ev_target_.getAttribute(ar.EV_MV + '_ev_id');
						var handlers = hash[ev_id];

						if (handlers)
							for (var i = 0; i < handlers.length; i++)
								r = handlers[i].handler(e);
					}

					if (!r)
						r = false;

					return r;
				}, true);

				document.body.parentNode.addEventListener(ar.EV_UP, function(e) {
					var r = false;

					if (ar.onGlobalUp)
						ar.onGlobalUp(e);

					if (ar._ev_target_) {
						var hash = ar.evs[ar.EV_UP];
						var ev_id = ar._ev_target_.getAttribute(ar.EV_UP + '_ev_id');
						var handlers = hash[ev_id];
						ar.clickTime = ar.tick();
						ar.clickObj = E(ar._ev_target_);

						if (handlers)
							for (var i = 0; i < handlers.length; i++)
								r = handlers[i].handler(e);

						ar._ev_target_ = null;
					}

					if (!r)
						r = false;

					return r;
				}, true);

				document.body.parentNode.addEventListener(ar.EV_CN, function(e) {
					var r = false;

					if (ar.onGlobalCn)
						ar.onGlobalCn(e);

					var info = findTarget(ar.EV_CN, e);

					if (info) {
						for (var i = 0; i < info.handlers.length; i++)
							r = info.handlers[i].handler(e);

						ar._ev_target_ = null;
					}

					if (!r)
						r = false;

					return r;
				}, true);

				ar.onScroll = function() {
					var sy = window.scrollY;
					var wh = ar.h;

					function onScrollImpl(info) {
						var e = E(info.dom);
						var ty = e.ot;
						var by = e.ot + e.h - 1;

						if (sy <= ty && ty <= sy + wh || sy <= by && by <= sy + wh) {
							if (e.visible == false) {
								//e.visible = true;

								if (info.aniTime)
									e.aniTime = info.aniTime;

								if (info.transTime)
									e.transTime = info.transTime;

								ar.ani({
									obj : info.dom,
									name : info.ani,
								});
							}
						}
						else
							e.visible = false;
					}

					for ( var key in ar._onSeenList) {
						var info = ar._onSeenList[key];
						onScrollImpl(info);
					}
				};

				window.addEventListener('scroll', ar.onScroll, true);

				if (ar.isMobile() == false)
					document.body.parentNode.addEventListener(ar.EV_CK, function(e) {
						if (ar.onGlobalCk)
							ar.onGlobalCk(e);

						findAndRunEventTarget(ar.EV_CK, e);
						ar._ev_target_ = null;

						return false;
					}, true);

				//alert(ar._isAndroidOld);
				//alert(ar._isTablet);
				window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

				if (ar.isCordova()) {
					window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
						var go = function() {
							if (ar.pathDoc && ar.pathDoc.charAt(ar.pathDoc.length - 1) == '/')
								ar.pathDoc = ar.pathDoc.slice(0, ar.pathDoc.length - 1);

							if (ar.isIos())
								ar.pathDat = ar.pathDoc;

							ar.pathApp = cordova.file.applicationDirectory;

							if (ar.pathApp && ar.pathApp.charAt(ar.pathApp.length - 1) == '/')
								ar.pathApp = ar.pathApp.slice(0, ar.pathApp.length - 1);

							//alert('ar.pathDoc = ' + ar.pathDoc);
							//alert(ar.pathApp);

							compileDoc();
						}; // go()

						if (ar.isAndroid()) {
							ar.pathDoc = cordova.file.dataDirectory.substring(7); // file:///android_asset 
							ar.dirMake(cordova.file.externalRootDirectory, 'Casture', function(r) {
								ar.pathDat = r == 1 ? cordova.file.externalRootDirectory + 'Casture' : ar.pathDoc;
								if (ar.isPrefix(ar.pathDat.toLowerCase(), 'file://'))
									ar.pathDat = ar.pathDat.substring(7);
								go();
							});
						}
						else {
							ar.pathDoc = fileSystem.root.toURL();
							go();
						}
					}, function() {
						console.log("failed to get filesystem");
					});
				}
				else
					compileDoc();
			}, false);
		}

		if (This.isCordova() && !ar.db.path)
			ar.log('Please set database path with ar.db.setPath(path)');

		window.onresize = function() {
			Scope.broadcast('size');
		};

		ar.pref.init(ar.db.path, initEvents);
	}
}

/**
 * @func setStyle
 * @memberOf ar
 * @desc Prepares to load a custom style. Use this methond to change the default dialog style.
 * @param {string} url - A css file url to be loaded
 */

ar.setStyle = function(url) {
	if (url[0] == '/')
		url = url.substring(1);

	ar._customStyleUrl = url;
}

/**
 * @func setLang
 * @memberOf ar
 * @desc Prepares to load a language string set from the specifed language code and the url.
 * @param {string} langCode - User defined language code
 * @param {string} url - A Language javasript url to be loaded
 * @example 
 * A language file is like below:
 * 
 * ar.lang.add('en', { // Define a language code and use <b>ar.lang.add</b> method to register a string set of the language
 *   greeting: 'Hello',
 * });
 */

ar.setLang = function(code, url) {
	if (url[0] == '/')
		url = url.substring(1);

	ar._curLang = code;
	ar._curLangUrl = url;
}

ar.lang = {};

/**
 * @func add
 * @memberOf ar
 * @desc Adds the current language string set for the language code.
 * @param {string} langCode - User defined language code
 * @param {object} json - Json string set of the language code
 */

ar.lang.add = function(langCode, json) {
	ar._lang[langCode] = json;
}

Object.defineProperty(ar, 'clickTime', {
	get : function() {
		return ar._click_time;
	},

	set : function(v) {
		ar._click_time = v;
	},
});

/**
 * @func on
 * @memberOf ar
 * @desc Installs an event handler to the centralized event controller.
 * @param {object} element - E or DOM element
 * @param {object} name - Event name
 * @param {function} handler - Event handler function
 */

ar.on = function(ele, name, handler) {
	if (ArquesElement.prototype.isPrototypeOf(ele))
		ele = ele[0];
	
	if (typeof ele == 'string') {
		Scope.broadcast(ele);
		return;
	}

	if (!ele)
		return;

	if (!ar.evs[name])
		ar.evs[name] = {};

	ar.evCnt++;
	var ev_id;

	if (ArquesElement.prototype.isPrototypeOf(ele))
		ev_id = ele.attr(name + '_ev_id');
	else
		ev_id = ele.getAttribute(name + '_ev_id');

	if (!ev_id) {
		ev_id = ar.evCnt;

		if (ArquesElement.prototype.isPrototypeOf(ele))
			ele.attr(name + '_ev_id', ev_id);
		else
			ele.setAttribute(name + '_ev_id', ev_id);
	}

	var newEv = {
		ele : ele,
		handler : handler,
	};

	if (!ar.evs[name][ev_id])
		ar.evs[name][ev_id] = [];

	ar.evs[name][ev_id].push(newEv);
}

/**
 * @func off
 * @memberOf ar
 * @desc Uninstalls an event handler from the centralized event controller.
 * @param {object} element - E or DOM element
 * @param {object} name - Event name
 */

ar.off = function(ele, name) {
	if (!ar.evs[name])
		return;

	var hash = ar.evs[name];
	var ev_id;

	if (ArquesElement.prototype.isPrototypeOf(ele))
		ev_id = ele.attr(name + '_ev_id');
	else
		ev_id = ele.getAttribute(name + '_ev_id');

	if (hash[ev_id])
		delete hash[ev_id];
}

/**
 * @func click
 * @memberOf ar
 * @desc Installs a click event.
 * @param {Scope} scope - Scope object for the click event handler
 * @param {object} element - E or DOM element
 * @param {object} opt - Options for the click event handler as below:<br>
 * {<br>
 *  'no-pointer', // specify if it will use default cursor, otherwise the default cursor(hand pointer) will be used<br>
 *  'click-class': string, // class name to change the background when it's clicked<br>
 *  'click-color': string, // color vale to change the background when it's clicked<br>
 *  'click': string, // specify the function name of the scope object to be called when it's clicked<br>
 *  cb: function() {}, // callback function to be called when it's clicked. 'click' handler will not be called if this is specified<br>
 * }<br>
 */

ar.click = function(scope, ele, opt) {
	var CLICK_THRESOLD = 40;
	var isClickable = false;
	var eleOriginal = ArquesElement.prototype.isPrototypeOf(ele) ? ele : null;
	var ptDn = null;
	var ptMv = null;
	var prevScrollTop = 0;

	if (eleOriginal)
		ele = ele[0];

	var changeColor = function() {
		try {
			if (opt['click-class'])
				ele.className += ' ' + opt['click-class'];
			else if (opt['click-color'])
				ele.style.backgroundColor = opt['click-color'];

			if (opt['no-pointer'])
				ele.style.cursor = 'default';
			else
				ele.style.cursor = 'pointer';

		}
		catch (e) {
			ar.log(e);
		}
	}

	var evDn = function(e) {
		ar.lastDnEvent = e;

		if (eleOriginal && eleOriginal.isEnabled() == false) {
			isClickable = false;
			return true;
		}

		//e.preventDefault(); don't do this for scrolling

		if (scope.__last_click_ele__) {
			var p = scope.__last_click_ele__.parentNode;

			while (p) {
				if (p == ele) {
					isClickable = false;
					return true;
				}

				p = p.parentNode;
			}
		}

		//ar.log(ele);
		scope.__last_click_ele__ = ele;
		ele.__prev_color__ = ele.style.backgroundColor;

		changeColor();

		ptDn = ar.evPos(e);
		isClickable = true;
		prevScrollTop = ele.getBoundingClientRect().top;
		return true;
	};

	var evMv = function(e) {
		ar.lastMvEvent = e;

		if (isClickable == false)
			return true;

		ptMv = ar.evPos(e);

		if (Math.abs(ele.getBoundingClientRect().top - prevScrollTop) > 5 || //
		Math.abs(ptMv.x - ptDn.x) > CLICK_THRESOLD || // 
		Math.abs(ptMv.y - ptDn.y) > CLICK_THRESOLD) {
			isClickable = false;

			if (opt['click-class'])
				ele.className = ele.className.replaceAll(opt['click-class'], '').trim();

			if (opt['click-no-color'] != 1 && !opt['click-keep-bc'])
				ele.style.backgroundColor = ele.__prev_color__;
		}

		return true;
	};

	var evUp = function(e) {
		ar.lastUpEvent = e;

		if (opt['click-class'])
			ele.className = ele.className.replaceAll(opt['click-class'], '').trim();

		if (opt['click-no-color'] != 1 && !opt['click-keep-bc'])
			ele.style.backgroundColor = ele.__prev_color__;

		if (isClickable) {
			if (opt.cb) {
				opt.cb(ar.clickObj);
			}
			else {
				var event = opt['click'];
				ar.clickTime = ar.tick();
				ar.clickObj = E(ele);

				if (opt.cb) {
					opt.cb(ar.clickObj);
				}
				else if (ar.isFunc(event)) {
					event(ar.clickObj);
				}
				else if (event) {
					event = event.replaceAll('\\bthis\\b', 'ar.clickObj');
					var fn = 'ArquesScope.hash[' + scope.id + '].' + event;
					eval(fn);
				}
			}
		}

		scope.__last_click_ele__ = null;
		isClickable = false;

		return true;
	};

	var evCn = function(e) {
		ar.lastCnEvent = e;

		if (opt['click-class'])
			ele.className = ele.className.replaceAll(opt['click-class'], '').trim();

		if (!opt['click-keep-bc'])
			ele.style.backgroundColor = ele.__prev_color__;
		
		isClickable = false;
		return true;
	};

	ar.on(ele, ar.EV_DN, evDn);
	ar.on(ele, ar.EV_MV, evMv);
	ar.on(ele, ar.EV_UP, evUp);
	ar.on(ele, ar.EV_CN, evCn);

	scope.on('__free__', function() {
		ar.off(ele, ar.EV_DN, evDn);
		ar.off(ele, ar.EV_MV, evMv);
		ar.off(ele, ar.EV_UP, evUp);
		ar.off(ele, ar.EV_CN, evCn);
	});
};

ar.slide = function(scope, type, ele, opt) {
	var SLIDE_THRESOLD = 50;
	ele.__sld_pt_dn__ = null;
	ele.__sld_pt_mv__ = null;
	ele.__sld_prev_scroll_top__ = 0;

	var evDn = function(e) {
		ele.__sld_is_slidable__ = true;
		ele.__sld_pt_dn__ = ar.evPos(e);
		ele.__sld_prev_scroll_top__ = ele.getBoundingClientRect().top;
	}

	var evMv = function(e) {
		if (ele.__sld_is_slidable__ == false)
			return;

		ele.__sld_pt_mv__ = ar.evPos(e);

		if (Math.abs(ele.getBoundingClientRect().top - ele.__sld_prev_scroll_top__) > 5)
			ele.__sld_is_slidable__ = false;

		if (ele.__sld_is_slidable__) {
			//ar.log('slidable');
			//ar.log(type + ',' + (ele.__sld_pt_dn__.x - ele.__sld_pt_mv__.x));

			if (type == 'L' && ele.__sld_pt_dn__.x - ele.__sld_pt_mv__.x > SLIDE_THRESOLD) {
				var fn = 'ArquesScope.hash[' + scope.id + '].' + opt.arSlideL;
				eval(fn);
				ele.__sld_is_slidable__ = false;
			}
			else if (type == 'R' && ele.__sld_pt_mv__.x - ele.__sld_pt_dn__.x > SLIDE_THRESOLD) {
				var fn = 'ArquesScope.hash[' + scope.id + '].' + opt.arSlideR;
				eval(fn);
				ele.__sld_is_slidable__ = false;
			}
		}
	}

	var evUp = function(e) {
		ele.__sld_is_slidable__ = false;
	}

	var evCn = function(e) {
		ele.__sld_is_slidable__ = false;
	}

	ar.on(ele, ar.EV_DN, evDn);
	ar.on(ele, ar.EV_MV, evMv);
	ar.on(ele, ar.EV_UP, evUp);
	ar.on(ele, ar.EV_CN, evCn);

	scope.on('__free__', function() {
		ar.off(ele, ar.EV_DN, evDn);
		ar.off(ele, ar.EV_MV, evMv);
		ar.off(ele, ar.EV_UP, evUp);
		ar.off(ele, ar.EV_CN, evCn);
	});
};

/**
 * @func has
 * @memberOf ar
 * @desc Checks if the DOM element exists by specified id.
 * @param {string} id - Element ID
 */

ar.has = function(id) {
	id = id.trim();

	if (id == '') {
		return false;
	}
	else if (ar.isPrefix(id, '.')) {
		var e = document.getElementsByClassName(id.substr(1));

		if (e.length > 0)
			return true;
	}
	else if (ar.isPrefix(id, '#')) {
		var e = document.querySelectorAll(id);

		if (e.length > 0)
			return true;
	}
	else {
		var ele = document.getElementById(id);

		if (ele)
			return true;

		ele = document.getElementsByName(id);

		if (ele.length > 0)
			return true;

		ele = document.getElementsByClassName(id);

		if (ele.length > 0)
			return true;

		ele = document.querySelectorAll(id);

		if (ele.length > 0)
			return true;
	}

	return false;
}

/**
 * @func compile
 * @memberOf ar
 * @desc Compiles the specified DOM element.
 * @param {object} opt - Options as below:<br>
 * {<br>
 *  scope: myScope,  // must be specifed. Create a new one by using <b>Scope();</b><br>
 *  root: DOM, // Specify the DOM element to be compiled<br>
 *  cb: function() {}, // callback is called when compiling is finished<br>
 * }<br>
 */

ar.compile = function(opt) {
	if (!opt.scope) {
		ar.log('A scope object must be specified.');
		return;
	}

	var scope = opt.scope;
	var rootEl = opt.root;
	var htmlRoot = opt.html ? opt.html : rootEl.innerHTML;

	//
	// Multilingual Text
	//

	var processTxt = function() {
		//var txt = htmlRoot.match(/\{\{\@[a-zA-Z0-9\-\\\/\.\_\ \t]*\}\}/g) || [];
		var txt = htmlRoot.match(/\{\{\@[a-zA-Z0-9\-\\\/\.\_\ \t\n\-\\\_\`\~\!\@\#\$\%\^\&\*\(\)\=\|\\\:\;\'\"\<\>\,\.\/\?]*\}\}/g) || [];

		for (var i = 0; i < txt.length; i++) {
			var src = txt[i].substring(3, txt[i].length - 2).trim();

			if (src == '')
				continue;

			var params = src.split(/[\s\t\n]+/);

			for (var j = params.length - 1; j >= 0; j--) {
				params[j] = params[j].trim();

				if (params[j] == '') {
					if (j == 0)
						ar.log('The first element of the text directive must be text-id. Error at: ' + src);

					params.splice(j, 1);
					continue;
				}

				if (j > 0) {
					params[j] = params[j].split(':');

					if (params[j].length != 2) {
						params.splice(j, 1);
						continue;
					}

					params[j][0] = params[j][0].trim();
					params[j][1] = params[j][1].trim();

					if (params[j][0] == '' || params[j][1] == '')
						params.splice(j, 1);
				}
			}

			//ar.log(src);
			//ar.log(params[0]);
			//ar.log('--');

			var id = params[0];
			var dst = ar._lang[ar._curLang][id];

			if (dst == undefined)
				dst = '[UNDEFINED]';
			else
				for (var j = 1; j < params.length; j++) {
					var scopeVal = scope[params[j][1]] ? scope[params[j][1]] : params[j][1];
					dst = dst.replaceAll(params[j][0], scopeVal);
				}

			htmlRoot = htmlRoot.replaceAll(txt[i], dst);
		}

		rootEl.innerHTML = htmlRoot;
	}

	//
	// Repeat
	//

	var processRepeat = function(parent) {
		var chil = [];
		var parentId = parent.getAttribute('id');

		for (var i = 0; i < parent.children.length; i++)
			// must make copy because one child could be removed in for-loop
			chil.push(parent.children[i]);

		for (var i = 0; i < chil.length; i++) {
			var c = chil[i];

			if (c.hasAttribute('repeat')) {
				var repeat = new ArquesRepeatBlock;

				repeat.scope = scope;
				repeat.bindTo = c;
				repeat.repeatId = c.getAttribute('id') ? c.getAttribute('id').trim() : '';
				repeat.tag = c.tagName ? c.tagName.toLowerCase() : 'div';
				repeat.srcHtml = c.outerHTML;
				repeat.srcHtml = repeat.srcHtml.replaceAll(/\<tbody\>/g, '');
				repeat.srcHtml = repeat.srcHtml.replaceAll(/\<\/tbody\>/g, '');
				repeat._container = E(document.createElement('div'));
				repeat._containerId = repeat.repeatId; // '__o' + ar.objCnt + '__';
				repeat._container.attr('id', repeat._containerId);
				ar.objCnt++;

				scope.__repeat__[repeat.repeatId] = repeat;

				parent.insertBefore(repeat._container[0], c.nextSibling);
				parent.removeChild(c);
				continue;
			}
			else if (c.hasAttribute('repeat-sub')) {
				var repeat = new ArquesRepeatBlock;

				repeat.scope = scope;
				repeat.bindTo = c;
				repeat.repeatId = c.getAttribute('id') ? c.getAttribute('id').trim() : '';
				repeat.tag = c.tagName ? c.tagName.toLowerCase() : 'div';
				repeat.srcHtml = c.innerHTML;
				repeat.srcHtml = repeat.srcHtml.replaceAll(/\<tbody\>/g, '');
				repeat.srcHtml = repeat.srcHtml.replaceAll(/\<\/tbody\>/g, '');
				repeat._container = E(c);
				repeat._containerId = repeat.repeatId;
				ar.objCnt++;

				scope.__repeat__[repeat.repeatId] = repeat;
				c.innerHTML = '';
				continue;
			}

			if (c.hasAttribute('slide')) {
				if (!scope.__slides__[parentId])
					scope.__slides__[parentId] = [];

				scope.__slides__[parentId].push(c);
				parent.removeChild(c);
				continue;
			}

			processRepeat(c);
		}
	}

	var processRepeatNode = function() {
		for ( var i in scope.__repeat__) {
			var repeat = scope.__repeat__[i];
			repeat._container = E(rootEl.querySelector('#' + repeat._containerId));
		}
	}

	//
	// Template
	//

	function makeTmpls(parent, html) {
		var tmpls = [];
		var directives = html.match(/\[\+[a-zA-Z0-9 \t\n\-\\\_\`\~\!\@\#\$\%\^\&\*\(\)\=\|\\\:\;\'\"\<\>\,\.\/\?\{\}]*\]/g) || [];

		for (var i = 0; i < directives.length; i++) {
			var src = directives[i].substring(2, directives[i].length - 1).trim();

			if (src == '')
				continue;

			var params = src.split(/[\s\t\n]+/);

			for (var j = params.length - 1; j >= 0; j--) {
				params[j] = params[j].trim();

				if (params[j] == '') {
					if (j == 0)
						ar.log('The first element of the template directive must be source file path. Error at: ' + src);

					params.splice(j, 1);
					continue;
				}

				if (j > 0) {
					params[j] = params[j].split(':');

					if (params[j].length != 2) {
						params.splice(j, 1);
						continue;
					}

					params[j][0] = params[j][0].trim();
					params[j][1] = params[j][1].trim();

					if (params[j][0] == '' || params[j][1] == '')
						params.splice(j, 1);
				}
			}

			//ar.log(src);
			//ar.log(params[0]);
			//ar.log('--');

			tmpls.push({
				parent : parent,
				params : params,
				directive : directives[i],
				sons : [],
			});
		}

		return tmpls;
	}

	function loadTmpl(tmpls, index, cb) {
		if (index >= tmpls.length) {
			if (cb)
				cb(true);
			return;
		}

		var t = tmpls[index];
		var url = t.params[0];

		if (!(ar.isPrefix(url, '/') || ar.isPrefix(url, 'http:') || ar.isPrefix(url, 'https:')))
			url = ar._subUrl + '/' + url;

		ar.net.html(url, function(content) {
			if (content == null) {
				cb(false);
				return;
			}

			t.html = content;
			t.sons = makeTmpls(t, content); // perform template hierarchy

			if (t.sons.length > 0) {
				loadTmpl(t.sons, 0, function() {
					loadTmpl(tmpls, index + 1, cb);
				});
			}
			else
				loadTmpl(tmpls, index + 1, cb);
		});
	}

	function processParams(tmpls) {
		for (var i = 0; i < tmpls.length; i++) {
			var t = tmpls[i];
			var html = t.html;

			while (t) {
				for (var j = 1; j < t.params.length; j++)
					html = html.replaceAll(t.params[j][0], t.params[j][1]);

				t = t.parent;
			}

			tmpls[i].html = html;
			processParams(tmpls[i].sons);
		}
	}

	function replaceTmpls(tmpls) {
		for (var i = 0; i < tmpls.length; i++) {
			var t = tmpls[i];

			if (t.sons.length > 0)
				replaceTmpls(t.sons);

			if (t.parent)
				t.parent.html = t.parent.html.replaceAll(t.directive, t.html);
			else
				htmlRoot = htmlRoot.replaceAll(t.directive, t.html);
		}
	}

	var tmpls = makeTmpls(null, htmlRoot);
	loadTmpl(tmpls, 0, function(isSucc) {
		if (isSucc == false) {
			if (opt.cb)
				opt.cb(false);
			return;
		}

		processParams(tmpls);
		replaceTmpls(tmpls);
		processTxt();
		processRepeat(rootEl);
		rootEl.innerHTML = scope.processReplacement(rootEl.innerHTML);
		rootEl.innerHTML = scope.processBinding(rootEl.innerHTML);
		scope.processDirective(rootEl);
		processRepeatNode();

		if (opt.cb)
			opt.cb(true);
	});
}

/**
 * @func html
 * @memberOf ar
 * @desc Loads an html document from the server. The server domain must be set by ar.setDomain(domain) before calling this method.
 * @param {object} opt - Options as below:<br>
 * {<br>
 *  scope: myScope,  // must be specifed<br>
 *  url: string, // Specify the url<br>
 *  cb: function(div) { ... }, // callback is called when loading and compiling is finished. <b>div</b> is the compiled ArquesElement<br>
 * }<br>
 */

ar.html = function(opt) {
	ar.net.html(opt.url, function(content) {
		if (content == null) {
			if (opt.cb)
				opt.cb(false);
			return;
		}

		var div = document.createElement('div');
		div.innerHTML = content;

		ar.compile({
			scope : opt.scope,
			root : div,
			cb : function(isSucc) {
				if (isSucc == false) {
					if (opt.cb)
						opt.cb(false);
					return;
				}

				if (opt.cb)
					opt.cb(E(div));
			}
		});
	});
}

/**
 * @func setIcon
 * @memberOf ar
 * @desc Sets the embedded icon to an icon tag element
 * @param {object} object - E or DOM element
 * @param {string} shape - Name of the icon. Please refer to https://material.io/icons/ for the icon names
 * @param {integer} [size] - Size for the icon
 * @param {string} [style] - CSS style string for the icon
 */

ar.setIcon = function(o, shape, size, style) {
	var c = ArquesElement.prototype.isPrototypeOf(o) ? o : E(o);

	if (!size)
		size = c.attr('size');

	if (!style)
		style = c.attr('style');

	var html = ar.icon(shape, size, style);
	c.html = html;
}

//
// Platform 
//

/**
 * @func isCordova
 * @memberOf ar
 * @desc Tells if the current environment is on the Cordova.
 * @return {boolean} True if it's on the Cordova
 */

ar.isCordova = function() {
	return ar._isCordova;
}

/**
 * @func isNodeJS
 * @memberOf ar
 * @desc Tells if the current environment is on the NodeJS.
 * @return {boolean} True if it's on the NodeJS
 */

ar.isNodeJS = function() {
	return ar._isNodeJS;
}

/**
 * @func isMobile
 * @memberOf ar
 * @desc Tells if the current environment is on the mobile.
 * @return {boolean} True if it's on the mobile
 */

ar.isMobile = function() {
	return ar._isMobile;
}

/**
 * @func isPC
 * @memberOf ar
 * @desc Tells if the current environment is on the PC.
 * @return {boolean} True if it's on the PC
 */

ar.isPC = function() {
	return ar._isCordova == false && ar._isMobile == false;
}

/**
 * @func isAndroid
 * @memberOf ar
 * @desc Tells if the current environment is on the Android.
 * @return {boolean} True if it's on the Android
 */

ar.isAndroid = function() {
	return ar._isAndroid;
}

/**
 * @func isAndroidOld
 * @memberOf ar
 * @desc Tells if the current environment is on the Android old version(equal or less than 5.1).
 * @return {boolean} True if it's on the Android old version
 */

ar.isAndroidOld = function() {
	return ar._isAndroidOld;
}

/**
 * @func isIos
 * @memberOf ar
 * @desc Tells if the current environment is on the iOS.
 * @return {boolean} True if it's on the iOS
 */

ar.isIos = function() {
	return ar._isIos;
}

/**
 * @func isWin
 * @memberOf ar
 * @desc Tells if the current environment is on the Windows.
 * @return {boolean} True if it's on the Windows
 */

ar.isWin = function() {
	return ar._isWin;
}

/**
 * @func isIpad
 * @memberOf ar
 * @desc Tells if the current environment is on the iPad.
 * @return {boolean} True if it's on the iPad
 */

ar.isIpad = function() {
	return ar._isIpad;
}

/**
 * @func isTablet
 * @memberOf ar
 * @desc Tells if the current environment is on the isTablet.
 * @return {boolean} True if it's on the isTablet
 */

ar.isTablet = function() {
	return ar._isTablet;
}

ar.isE = function(v) {
	return ArquesElement.prototype.isPrototypeOf(v);
}

/**
 * @func isFunc
 * @memberOf ar
 * @desc Tells if the specified parameter is function.
 * @param {function} v - A paramter to be checked
 * @return {boolean} True if it's function
 */

ar.isFunc = function(v) {
	var r = typeof v === "function";
	return r;
}

/**
 * @func isNum
 * @memberOf ar
 * @desc Tells if the specified parameter is number.
 * @param {number} v - A paramter to be checked
 * @return {boolean} True if it's number
 */

ar.isNum = function(v) {
	var r = typeof v === "number";
	return r;
}

/**
 * @func isStr
 * @memberOf ar
 * @desc Tells if the specified parameter is string.
 * @param {number} v - A paramter to be checked
 * @return {boolean} True if it's string
 */

ar.isStr = function(v) {
	var r = typeof v === "string";
	return r;
}

//
// Coordinate System
//

/**
 * @func isPortrait
 * @memberOf ar
 * @desc Tells if the current window is portrait mode (by comparing width and height)
 * @return {boolean} True if it's portrait
 */

ar.isPortrait = function() {
	var w = ar.w;
	var h = ar.h;

	return ar._isMobile ? w < h : true;
}

//var winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
//var winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

// window.innerHeight: affected by virtual keyboard and orientation. its value is shrunk if the virtual keyboard is shown. changed by orientation. 
// window.screen.height: absolute value. always it's not changed no matter what orientation is and virtual keyboard is shown or not.
// document.body.clientHeight: always full height no matter whether virtual keyboard is shown or not. but changed by orientation.

/**
 * @member {integer} w
 * @memberOf ar
 * @desc Get the current width of the window.
 */

Object.defineProperty(ar, 'w', {
	get : function() {
		var isPortrait = window.matchMedia("(orientation: portrait)").matches;
		var width = ar._isCordova ? (isPortrait ? window.screen.width : window.screen.height) : document.body.clientWidth;
		return width;
	},

	set : function(v) {
		ar.log('ar.w is readonly property');
	},
});

/**
 * @member {integer} h
 * @memberOf ar
 * @desc Get the current height of the window.
 */

Object.defineProperty(ar, 'h', {
	get : function() {
		var isPortrait = window.matchMedia("(orientation: portrait)").matches;
		var statusBarHeight = ar._isCordova == false || ar._isStatusBarShowing == false ? 0 : ar.statusBarHeight;
		//var height = ar._isCordova ? (isPortrait ? window.screen.height : window.screen.width) : window.innerHeight;
		var height = ar._isCordova ? (isPortrait ? window.innerHeight : window.screen.width) : window.innerHeight;
		height -= statusBarHeight;
		//return 480; // for testing;
		return height - ar.adHeight;
	},

	set : function(v) {
		ar.log('ar.h is readonly property');
	},
});

ar.openInSysBrowser = function(url, opt) {
	ChromeLauncher.open(url, function() {
	}, function() {
		window.open(url, '_system', opt);
	});
}

ar.open = function(url, target, feature) {
	if (target)
		window.open(url, target, feature);
	else
		document.location.href = url;
}

//
// Touch
//

/**
 * @func ev
 * @memberOf ar
 * @desc Returns a custom event of position { x, y }
 * @param {integer} x - x
 * @param {integer} y - y
 * @return {object} Returns event position { x, y }
 */

ar.ev = function(x, y) {
	var touch = {};
	touch.clientX = x;
	touch.clientY = y;

	var e = {};
	e.touches = [];
	e.touches.push(touch);

	return e;
}

/**
 * @func evPos
 * @memberOf ar
 * @desc Returns event position { x, y }
 * @param {object} event - Javascript event object 
 * @return {object} Returns event position { x, y }
 */

ar.evPos = function(e) {
	var touches = ar.evPoses(e);
	var r = {
		x : 0,
		y : 0
	};

	if (touches.length > 0)
		r = touches[0];

	return r;
}

/**
 * @func evPoses
 * @memberOf ar
 * @desc Returns event position array [{ x, y }]
 * @param {object} event - Javascript event object 
 * @return {object} Returns event position array [{ x, y }]
 */

ar.evPoses = function(e) {
	var touches = [];

	try {
		var list;

		if (e.originalEvent) {
			if (e.originalEvent.touches || e.originalEvent.changedTouches) {
				if (e.originalEvent.touches.length > 0)
					list = e.originalEvent.touches;
				else
					list = e.originalEvent.changedTouches;
			}
			else
				list = [
					e
				];
		}
		else {
			if (e.touches || e.changedTouches) {
				if (e.touches.length > 0)
					list = e.touches;
				else
					list = e.changedTouches;
			}
			else
				list = [
					e
				];
		}

		for (var i = 0; i < list.length; i++) {
			var touch = list[i];
			var r = {};
			r.x = parseInt('' + touch.clientX);
			r.y = parseInt('' + touch.clientY);
			touches.push(r);
			//ar.log(r);
		}
	}
	catch (e) {
		ar.log('error');
	}

	return touches;
}

ar.isClick = function(upPos, dnPos) {
	return Math.abs(upPos.x - dnPos.x) < 10 && Math.abs(upPos.y - dnPos.y) < 10;
}

//
//
//

ar.setMoreLoader = function(opt) {
	var MORE_LOADER_TRIGGER_HEIGHT = 170;
	var scope = opt.scope;
	var ele = opt.ele;
	var topTool = opt.topTool;
	var topToolColor = opt.topToolColor;
	var posDn;
	var posMv;
	var isDn = false;
	var isToRefresh = false;
	//var isRefreshBtm = false;
	var lastRefreshBtmPos = 0;
	var lastRefreshBtmTime = 0;

	ele.on(ar.EV_DN, function(e) {
		posDn = ar.evPos(e);
		isToRefresh = false;
		isDn = true;
	}, true);

	ele.on(ar.EV_MV, function(e) {
		if (isDn == false)
			return;

		posMv = ar.evPos(e);

		if (isToRefresh == false && ele.st <= 0 && posMv.y - posDn.y > MORE_LOADER_TRIGGER_HEIGHT) {
			isToRefresh = true;
			scope.on(opt.cmdTopReady);
		}
	}, true);

	ele.on(ar.EV_UP, function(e) {
		isDn = false;
		if (isToRefresh)
			scope.on(opt.cmdTop);
	}, true);

	ele.on(ar.EV_CN, function(e) {
		isDn = false;
		if (isToRefresh)
			scope.on(opt.cmdTop);
	}, true);

	ele.on('scroll', function() {
		if (ele.st >= Math.max(10, ele.sh - ele.oh - 50)) { // isRefreshBtm == false && 
			//isRefreshBtm = true;
			lastRefreshBtmPos = ele.st;
			lastRefreshBtmTime = ar.tick();
			scope.on(opt.cmdBtm);
		}

		//if (isRefreshBtm && ar.tick() - lastRefreshBtmTime > 60 * 1000) // ele.st > lastRefreshBtmPos + 50 && 
		//	isRefreshBtm = false;

		//				if (topTool) {
		//					var st = ele.st;
		//					var h = topTool.h - st + 5;
		//					ele[0].style.background = 'linear-gradient(to bottom, ' + topToolColor + ' ' + h + 'px, white 1px, white)';
		//				}
	}, true);
}

ar.unsetMoreLoader = function(con) {
	con.off('touchstart');
	con.off('touchmove');
	con.off('touchend');
	con.off('scroll', null, true);
}

//
// pivot scroll
//

ar.pivotScroll = function(whereTo, list, obj) {
	switch (whereTo) {
		case 'top': {
			if (typeof obj.__prev_st__ == undefined)
				obj.__prev_st__ = 0;

			var speed = obj.pivotSpeed ? obj.pivotSpeed : 4;
			var st = list.st;
			var y = obj.y;
			var d = (st - obj.__prev_st__ > 0 ? speed : -speed);
			var stLimit = list.sh - list.oh;

			y = Math.max(obj.minY, Math.min(obj.maxY, y - d));

			if (st <= 0 || stLimit < obj.h)
				y = obj.maxY;
			else if (st >= stLimit)
				y = obj.minY;

			//ar.log(st + ',' + (list.sh - list.oh));

			obj.y = y;
			obj.__prev_st__ = st;
		}
			break;

		case 'btm': {
			if (typeof obj.__prev_st__ == undefined)
				obj.__prev_st__ = 0;

			var speed = obj.pivotSpeed ? obj.pivotSpeed : 4;
			var st = list.st;
			var y = obj.y;
			var d = (st - obj.__prev_st__ > 0 ? speed : -speed); //  > 0 ? 2 : -2
			var stLimit = list.sh - list.oh;

			y = Math.max(obj.minY, Math.min(obj.maxY, y + d));

			if (st <= 0 || stLimit < obj.h)
				y = obj.minY;
			else if (st >= stLimit)
				y = obj.maxY;

			obj.y = y;
			obj.__prev_st__ = st;
		}
			break;
	}
}

if (typeof module !== 'undefined')
	module.exports = ar;
else
	ar.scope = Scope(document.body);

ar.init();
})();
