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
	This._id = id;
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
