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
