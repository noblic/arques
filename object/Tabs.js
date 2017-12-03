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

Tabs._objIndex = 0;

//
// ArquesTabs
//

ArquesTabs = function(id) {
	var This = this;

	ArquesElement.call(This, id);
	Tabs._objIndex++;

	This.scope = Scope(This[0]);
	This.scanAll();
	This._id = This.attr('id') ? This.attr('id') : '__arques_tabs_' + Tabs._objIndex;
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
