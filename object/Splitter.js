/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

Split = function(id) {
	var a = new ArquesSplitter(id);
	return a;
}

Split.splits = [];

//
// ArquesSplitter
//

ArquesSplitter = function(id) {
	var This = this;

	ArquesElement.call(This, id);

	Split.splits.push(This);
	This.scope = Scope(This[0]);
	This._id = id;
	This.onChanged = null;
	This.isHorz = true;
	This.isDn = false;
	This.link = [];

	for (var j = 0; j < Split.splits.length; j++)
		Split.splits[j].makeLink(This);

	This.makeLink();

	if (This.attr('left')) {
		var leftId = This.attr('left');
		var rightId = This.attr('right');

		if (ar.has(leftId) == false)
			ar.log("ArquesSplitter: specified id for left isn't valid. The element doesn't exist.");

		if (ar.has(rightId) == false)
			ar.log("ArquesSplitter: specified id for right isn't valid. The element doesn't exist.");

		This.L = E(leftId);
		This.R = E(rightId);
		This.cursor = 'col-resize';
	}
	else if (This.attr('top')) {
		This.isHorz = false;
		var topId = This.attr('top');
		var btmId = This.attr('bottom');

		if (ar.has(topId) == false)
			ar.log("ArquesSplitter: specified id for top isn't valid. The element doesn't exist.");

		if (ar.has(btmId) == false)
			ar.log("ArquesSplitter: specified id for bottom isn't valid. The element doesn't exist.");

		This.T = E(topId);
		This.B = E(btmId);
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

		This.Pw = This.parent.w;
		This.Ph = This.parent.h;

		if (This.isHorz) {
			This.Lw = This.L.frameMP.w;
			This.Rw = This.R.frameMP.w;
			This.Lminw = This.L.minw;
			This.Rminw = This.R.minw;
			This.Lmaxw = This.L.maxw;
			This.Rmaxw = This.R.maxw;
		}
		else {
			This.Th = This.T.frameMP.h;
			This.Bh = This.B.frameMP.h;
			This.Tminh = This.T.minh;
			This.Bminh = This.B.minh;
			This.Tmaxh = This.T.maxh;
			This.Bmaxh = This.B.maxh;
		}
	};

	win.on(ar.EV_DN, This.onDn, true);

	win.on(ar.EV_MV, function(e) {
		if (This.isDn == false)
			return true;

		This.posMv = ar.evPos(e);

		if (This.isHorz) {
			var w = This.w;
			var diff = This.posMv.x - This.posDn.x;

			This.L.w = Math.max(0, Math.min(This.Pw - w, This.Lw + diff)) - This.L.ml - This.L.mr - This.L.pl - This.L.pr;
			
			if (This.Lminw)
				This.L.w = Math.max(This.L.w, This.Lminw);
			if (This.Lmaxw)
				This.L.w = Math.min(This.L.w, This.Lmaxw);
			
			This.R.w = Math.max(0, This.Pw - w - This.L.w) - This.R.ml - This.R.mr - This.R.pl - This.R.pr;
			
			if (This.Rminw)
				This.R.w = Math.max(This.R.w, This.Rminw);
			if (This.Rmaxw)
				This.R.w = Math.min(This.R.w, This.Rmaxw);
		}
		else {
			var h = This.h;
			var diff = This.posMv.y - This.posDn.y;

			This.T.h = Math.max(0, Math.min(This.Ph - h - 1, This.Th + diff)) - This.T.mt - This.T.mb - This.T.pt - This.T.pb;

			if (This.Tminh)
				This.T.h = Math.max(This.T.h, This.Tminh);
			if (This.Tmaxh)
				This.T.h = Math.min(This.T.h, This.Tmaxh);

			This.B.h = Math.max(0, This.Ph - h - This.T.h) - This.B.mt - This.B.mb - This.B.pt - This.B.pb;

			if (This.Bminh)
				This.B.h = Math.max(This.B.h, This.Bminh);
			if (This.Bmaxh)
				This.B.h = Math.min(This.B.h, This.Bmaxh);
		}
		
		Scope.broadcast('size');
	}, true);

	win.on(ar.EV_UP, function(e) {
		for (var i = 0; i < This.link.length; i++)
			This.link[i].isDn = false;

		This.isDn = false;
		Scope.broadcast('size');
		return true;
	}, true);

	//	win.on(ar.EV_CN, function(e) {
	//		var p = ar.evPos(e);
	//		//ar.log(p);
	//		
	//		if (p.x < 0 || p.y < 0 || p.x > win.w || p.y > win.h)
	//			This.isDn = false;
	//	}, true);

	This.scope.on('size', function() {
		This.refresh();
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
