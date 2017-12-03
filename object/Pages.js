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
