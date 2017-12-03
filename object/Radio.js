/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// ArquesRadiobox
//
Radio = function(id) {
	var a = new ArquesRadiobox(id);
	return a;
}

ArquesRadiobox = function(id) {
	var This = this;

	ArquesElement.call(This, id);

	This.scope = Scope(This[0]);
	This._id = This.attr('id');
	This._index = This.attr('index') ? parseInt(This.attr('index')) : 0;
	This._radio_size = This.attr('radio-size') ? This.attr('radio-size') : 25;
	This._radio_color = This.attr('radio-color') ? This.attr('radio-color') : 'black';
	This._radio_tx = This.attr('radio-tx') ? This.attr('radio-tx') : 0;
	This._radio_ty = This.attr('radio-ty') ? This.attr('radio-ty') : 7;
	This._radio_mr = This.attr('radio-mr') ? This.attr('radio-mr') : 6;
	This._isEnabled = This.attr('disabled') ? false : true;
	This._radios = [];
	This.cursor = 'pointer';
	This.onClick = null;
	This.scanAll();

	for (var i = This.children.length - 1; i >= 0; i--) {
		var child = This.children[i];
		var html = '';

		html += '<span style="display:inline-block;">';
		html += ar.icon('radio_button_unchecked', This._radio_size);
		html += '</span>';

		child[0].insertAdjacentHTML('afterbegin', html);

		child.scanAll();
		var radio = child.children[0];
		This._radios.splice(0, 0, radio);

		radio.fill = This._radio_color;
		radio.tx = This._radio_tx;
		radio.ty = This._radio_ty;
		radio.mr = This._radio_mr;

		function setupClick(child, index) {
			var attr = {};
			attr['click'] = function() {
				if (This._isEnabled == false)
					return;

				This._index = index;
				This.refresh();

				if (This.onClick)
					This.onClick(This);
			};

			ar.click(This.scope, child, attr);
		}
		
		setupClick(child, i);
	}

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
}

ArquesRadiobox.prototype = Object.create(ArquesElement.prototype, {
	refresh : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(id) {
			var This = this;

			for (var i = 0; i < This._radios.length; i++) {
				var radio = This._radios[i];
				ar.setIcon(radio, 'radio_button_unchecked', This._radio_size, 'fill:' + This._radio_color + ';');
			}

			if (This._index < This._radios.length) {
				var radio = This._radios[This._index];
				ar.setIcon(radio, 'radio_button_checked', This._radio_size, 'fill:' + This._radio_color + ';');
			}
		}
	},

	enable : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function(id) {
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
		value : function(id) {
			var This = this;
			This._isEnabled = false;
			This.cursor = 'inherit';
			This.filter = 'brightness(.5)';
		}
	},
});

Object.defineProperty(ArquesRadiobox.prototype, 'index', {
	get : function() {
		var This = this;
		return This._index;
	},

	set : function(v) {
		var This = this;
		This._index = Math.max(0, Math.min(This._radios.length - 1, v));
		This.refresh();
	},
});
