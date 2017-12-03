/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// ArquesCheckbox
//

Check = function(id) {
	var a = new ArquesCheckbox(id);
	return a;
}

Check._objIndex = 0;

ArquesCheckbox = function(id) {
	var This = this;

	ArquesElement.call(This, id);
	Check._objIndex++;

	This.scope = Scope(This[0]);
	This._id = This.attr('id') ? This.attr('id') : '__arques_check_' + Check._objIndex;
	This._isChecked = This.attr('checked') ? true : false;
	This._check_size = This.attr('check-size') ? This.attr('check-size') : 25;
	This._check_color = This.attr('check-color')  ? This.attr('check-color') : 'black';
	This._check_tx = This.attr('check-tx')  ? This.attr('check-tx') : 0;
	This._check_ty = This.attr('check-ty')  ? This.attr('check-ty') : 6.5;
	This._check_mr = This.attr('check-mr')  ? This.attr('check-mr') : 6;
	This._isEnabled = This.attr('disabled') ? false : true;
	This.cursor = 'pointer';
	This.onClick = null;
	
	var html = '';
	
	html += '<span style="display:inline-block;">';
	html += ar.icon('check_box_outline_blank', This._check_size); // check_box
	html += '</span>';
	
	This[0].insertAdjacentHTML('afterbegin', html);

	This.scanAll();
	This.check = This.children[0];
	This.check.fill = This._check_color;
	This.check.tx = This._check_tx;
	This.check.ty = This._check_ty;
	This.check.mr = This._check_mr;

	//

	This.on(ar.EV_DS, function(e) {
		e.preventDefault();
	});

	This.scope.on('size', function() {
		This.refresh();
	});

	This._onSetW = function() {
		This.refresh();
	};

	This._onSetH = This._onSetW;
	This.refresh();

	var attr = {};
	attr['click'] = function() {
		if (This._isEnabled == false)
			return;
		
		This._isChecked = !This._isChecked;
		This.refresh();
		
		if (This.onClick)
			This.onClick(This);
	};

	ar.click(This.scope, This, attr);
}

ArquesCheckbox.prototype = Object.create(ArquesElement.prototype, {
	refresh : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function() {
			var This = this;
			ar.setIcon(This.check, This._isChecked ? 'check_box' : 'check_box_outline_blank' , This._check_size, 'fill:' + This._check_color + ';');
		}
	},

	enable : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function() {
			var This = this;
			This._isEnabled = true;
			This.cursor = 'pointer';
			This.filter = '';
		}
	},

	disable : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function() {
			var This = this;
			This._isEnabled = false;
			This.cursor = 'inherit';
			This.filter = 'brightness(.5)';
		}
	},
});

Object.defineProperty(ArquesCheckbox.prototype, 'checked', {
	get : function() {
		var This = this;
		return This._isChecked;
	},

	set : function(v) {
		var This = this;
		This._isChecked = v;
		This.refresh();
	},
});
