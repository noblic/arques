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

		This.Lmax = (This.next ? This.next.x - This.parent.x - This.w : This.parent.w - This.w) - (This.prev ? This.prev.x - This.parent.x + This.prev.w : 0);
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
