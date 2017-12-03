/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// ArquesCombobox
//

Combo = function(id) {
	var a = new ArquesCombobox(id);
	return a;
}

Combo._objIndex = 0;

ArquesCombobox = function(id) {
	var This = this;

	ArquesElement.call(This, id);
	Combo._objIndex++;

	This.scope = Scope(This[0]);
	This._id = This.attr('id') ? This.attr('id') : '__arques_combo_' + Combo._objIndex;
	This._index = This.attr('index') ? parseInt(This.attr('index')) : 0;
	This._combo_size = This.attr('combo-size') ? This.attr('combo-size') : 25;
	This._combo_color = This.attr('combo-color') ? This.attr('combo-color') : 'black';
	This._combo_tx = This.attr('combo-tx') ? This.attr('combo-tx') : 0;
	This._combo_ty = This.attr('combo-ty') ? This.attr('combo-ty') : 7;
	This._combo_mr = This.attr('combo-mr') ? This.attr('combo-mr') : 6;
	This._isEnabled = This.attr('disabled') ? false : true;
	This._combos = [];
	This.cursor = 'pointer';
	This.onClick = null;
	This.scanAll();

	for (var i = This.children.length - 1; i >= 0; i--) {
		var child = This.children[i];
		var html = '';

		html += '<span style="display:inline-block;">';
		html += ar.icon('combo_button_unchecked', This._combo_size);
		html += '</span>';

		child[0].insertAdjacentHTML('afterbegin', html);

		child.scanAll();
		var combo = child.children[0];
		This._combos.splice(0, 0, combo);

		combo.fill = This._combo_color;
		combo.tx = This._combo_tx;
		combo.ty = This._combo_ty;
		combo.mr = This._combo_mr;

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

ArquesCombobox.prototype = Object.create(ArquesElement.prototype, {
	refresh : {
		enumerable : true,
		configurable : true,
		writable : true,
		value : function() {
			var This = this;

			for (var i = 0; i < This._combos.length; i++) {
				var combo = This._combos[i];
				ar.setIcon(combo, 'combo_button_unchecked', This._combo_size, 'fill:' + This._combo_color + ';');
			}

			if (This._index < This._combos.length) {
				var combo = This._combos[This._index];
				ar.setIcon(combo, 'combo_button_checked', This._combo_size, 'fill:' + This._combo_color + ';');
			}
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
			This.filter = 'brightness(.78)';
		}
	},
});

Object.defineProperty(ArquesCombobox.prototype, 'index', {
	get : function() {
		var This = this;
		return This._index;
	},

	set : function(v) {
		var This = this;
		This._index = Math.max(0, Math.min(This._combo.length - 1, v));
		This.refresh();
	},
});
