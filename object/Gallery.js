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

Gallery._objIndex = 0;

ArquesGallery = function(id) {
	var This = this;
	ArquesElement.call(This, id);
	Gallery._objIndex++;

	This.scope = Scope(This[0]);
	This.scanAll();
	This._id = This.attr('id') ? This.attr('id') : '__arques_gallery_' + Gallery._objIndex;

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
