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
