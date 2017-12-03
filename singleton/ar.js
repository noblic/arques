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

// https://stackoverflow.com/questions/20256760/javascript-console-log-to-html

ar._logbox = document.createElement('div');
ar._logbox.style.position = 'absolute';
ar._logbox.style.zIndex = 1000000;
ar._logbox.style.display = 'none';
ar._logbox.style.backgroundColor = 'rgba(0,0,0,0.5)';
ar._logbox.style.color = 'white';
ar._logbox.style.border = '1px solid #777';
ar._logbox.style.top = '10px';
ar._logbox.style.right = '10px';
ar._logbox.style.width = '600px';
ar._logbox.style.height = '400px';
ar._logbox.style.fontSize = '12px';
ar._logbox.style.padding = '3px';

console.oldlog = console.log;
console.log = function() {
	if (ar.logbox.enabled == false) {
		console.oldlog.apply(undefined, arguments);
		return;
	}

	var output = "";

	for (var i = 0; i < arguments.length; i++) {
		var arg = arguments[i];
		output += "<span style='color:white;'>";

		if (typeof arg === "object" && typeof JSON === "object" && typeof JSON.stringify === "function")
			output += JSON.stringify(arg);
		else
			output += arg;

		output += "\n</span>";
	}

	ar.logbox.out.html += output + "<br>";
	console.oldlog.apply(undefined, arguments);
};

console.oldwarn = console.warn;
console.warn = function() {
	if (ar.logbox.enabled == false) {
		console.oldwarn.apply(undefined, arguments);
		return;
	}

	var output = "";

	for (var i = 0; i < arguments.length; i++) {
		var arg = arguments[i];
		output += "<span style='color:yellow;'>";

		if (typeof arg === "object" && typeof JSON === "object" && typeof JSON.stringify === "function")
			output += JSON.stringify(arg);
		else
			output += arg;

		output += "\n</span>";
	}

	ar.logbox.out.html += output + "<br>";
	console.oldwarn.apply(undefined, arguments);
};

console.olderr = console.error;
console.error = function() {
	if (ar.logbox.enabled == false) {
		console.olderror.apply(undefined, arguments);
		return;
	}

	var output = "";

	for (var i = 0; i < arguments.length; i++) {
		var arg = arguments[i];
		output += "<span style='color:red;'>";

		if (typeof arg === "object" && typeof JSON === "object" && typeof JSON.stringify === "function")
			output += JSON.stringify(arg);
		else
			output += arg;

		output += "\n</span>";
	}

	ar.logbox.out.html += output + "<br>";
	console.olderr.apply(undefined, arguments);
};

window.addEventListener('error', function(err) {
	ar.log(err.filename + ':' + err.lineno + ':' + err.colno + ':' + err.message);
});

window.onerror = function(msg, url, line) {
	ar.log(url + ':' + line + ':' + msg);
};

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
						document.body.appendChild(ar._logbox);
						ar.logbox = E(ar._logbox);
						ar.logbox.enabled = false;
						ar.logbox.btn = Button('<div text="Copy"></div>');
						ar.logbox.btn.w = 80;
						ar.logbox.btn.h = 30;
						ar.logbox.btn.mb = 3;
						ar.logbox.btn.bc = '#eee';
						ar.logbox.btn.fc = 'black';
						ar.logbox.btn.border = '1px solid #ccf';
						ar.logbox.btn.onClick = function() {
							window.getSelection().selectAllChildren(ar.logbox.out[0]);
							document.execCommand("Copy");

							if (document.selection)
								document.selection.empty();
							else if (window.getSelection)
								window.getSelection().removeAllRanges();

							ar.dlg.toast({
								msg : 'Log has been copied'
							});
						};
						ar.logbox.out = E('<div></div>');
						ar.logbox.out.padding = 10;
						ar.logbox.out.bc = 'rgba(0,0,0,0.5)';
						ar.logbox.out.w = 'calc(100%)';
						ar.logbox.out.h = 'calc(100% - 30px - 4px)';
						ar.logbox.out.lh = '16px';
						ar.logbox.out.oy = 'scroll';
						ar.logbox.out.sizing = 'border-box';
						ar.logbox.add(ar.logbox.btn);
						ar.logbox.add(ar.logbox.out);

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
				script.onload = compileDocImpl;
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
