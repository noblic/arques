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
