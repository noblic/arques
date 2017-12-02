/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

/**
 * @namespace pref
 * @memberOf ar
 * @desc Preference singleton to manage the user preferences by using cookie.
 */

ar.pref = {};

ar.pref.db = null;
ar.pref.cache = {};

ar.pref.init = function(dbPath, cb) {
	var This = this;
	if (ar.isCordova()) {
		try {
			This.db = window.sqlitePlugin.openDatabase({
				name : dbPath,
				createFromLocation : true
			});

			This.db.transaction(function(tx) {
				//tx.executeSql("drop table pref"); // for testing
				//tx.executeSql("drop index pref_idx"); // for testing

				tx.executeSql("CREATE TABLE IF NOT EXISTS pref(pref_key text primary key, pref_val text)", [], function(tx, res) {
					This._cacheAll('', cb);
				}, function(e) {
					ar.log('ar.pref.init: ' + e);
					if (cb)
						cb();
				});

				tx.executeSql("commit", []);
			});

			//ar.log('==> db path: ' + dbPath);
			//ar.log('==> db loaded');
		}
		catch (e) {
			ar.log('pref:open_db: ' + e);
		}
	}
	else {
		This._cacheAll('');

		if (cb)
			cb();
	}
}

/**
 * @func set
 * @memberOf ar.pref
 * @desc Sets the value for the key. 
 * @param {string} key - Key.
 * @param {any} val - Value.
 */

ar.pref.set = function(key, val) {
	var This = this;
	This.cache[key] = val;
	This._set(key, val);
}

ar.pref.setInt = function(key, val) {
	var This = this;
	This.set(key, val);
}

ar.pref.setFloat = function(key, val) {
	var This = this;
	This.set(key, val);
}

ar.pref.setStr = function(key, val) {
	var This = this;
	This.set(key, val);
}

/**
 * @func get
 * @memberOf ar.pref
 * @desc Returns the value for the key. 
 * @param {string} key - Key.
 * @return {any} Returns the value for the key. 
 */

ar.pref.get = function(key) {
	var This = this;
	var r = null;

	try {
		r = This.cache[key];
	}
	catch (e) {
		ar.log('ar.pref.get: ' + e);
	}

	return r;
}

/**
 * @func getInt
 * @memberOf ar.pref
 * @desc Returns the integer value for the key. 
 * @param {string} key - Key.
 * @return {integer}
 */

ar.pref.getInt = function(key) {
	var This = this;
	var r = 0;

	try {
		r = parseInt('' + This.cache[key]);

		if (isNaN(r))
			r = 0;
	}
	catch (e) {
		ar.log('ar.pref.getInt: ' + e);
	}

	return r;
}

/**
 * @func getFloat
 * @memberOf ar.pref
 * @desc Returns the float value for the key. 
 * @param {string} key - Key.
 * @return {float}
 */

ar.pref.getFloat = function(key) {
	var This = this;
	var r = 0;

	try {
		r = parseFloat('' + This.cache[key]);

		if (isNaN(r))
			r = 0;
	}
	catch (e) {
		ar.log('ar.pref.getFloat: ' + e);
	}

	return r;
}

/**
 * @func getStr
 * @memberOf ar.pref
 * @desc Returns the string value for the key. 
 * @param {string} key - Key.
 * @return {string}
 */

ar.pref.getStr = function(key) {
	var This = this;
	var r = undefined;

	try {
		r = This.cache[key];

		if (typeof r == 'undefined')
			r = undefined;
		else
			r = '' + r;
	}
	catch (e) {
		ar.log('ar.pref.getStr: ' + e);
	}

	return r;
}

/**
 * @func del
 * @memberOf ar.pref
 * @desc Deletes the key. 
 * @param {string} key - Key.
 */

ar.pref.del = function(key, cb) {
	var This = this;
	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("delete from pref where pref_key = ?", [
				key
			], function(tx, res) {
				if (cb)
					cb(true);
			}, function(e) {
				ar.log('ar.pref.del: ' + e);
				if (cb)
					cb(false);
			});

			tx.executeSql("commit", []);
		});
	}
	else {
		document.cookie = key + '=; Max-Age=0';
		delete This.cache[key];

		if (cb)
			cb(true);
	}
}

/**
 * @func clear
 * @memberOf ar.pref
 * @desc Clears all keys.
 */

ar.pref.clear = function(prefix, cb) {
	var This = this;
	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("delete from pref where pref_key like '" + prefix + "%'", [], function(tx, res) {
				This.cache = {};
				if (cb)
					cb(true);
			}, function(e) {
				ar.log('ar.pref.clear: ' + e);
				if (cb)
					cb(false);
			});

			tx.executeSql("commit", []);
		});
	}
	else {
		for ( var key in This.cache)
			document.cookie = key + '=; Max-Age=0';

		This.cache = {};

		if (cb)
			cb(true);
	}
}

/**
 * @func isHaving
 * @memberOf ar.pref
 * @desc Tells if the key is existing.
 * @param {string} key - Key.
 * @param {func} cb(isHaving) - Callback. <b>isHaving</b> is true if the key exists.
 */

ar.pref.isHaving = function(key, cb) {
	var This = this;
	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("select count(*) as cnt from pref where pref_key = ?", [
				key
			], function(tx, res) {
				var r = res && res.rows && res.rows.length > 0 && res.rows.item(0).cnt > 0;
				if (cb)
					cb(r);
			}, function(e) {
				ar.log('ar.pref.isHaving: ' + e);
				if (cb)
					cb(false);
			});
		});
	}
	else {
		This._cookieLoop(function(_key, _val) {
			if (_key == key && _val) {
				if (cb)
					cb(true);
				return false;
			}
		});

		if (cb)
			cb(false);
	}
}

//
// implementations (don't call these methods directly) 
//

ar.pref._cacheAll = function(prefix, cb) {
	var This = this;
	This.cache = {};

	if (ar.isCordova()) {
		This._getKeyVals(prefix, function(keyVals) {
			This.cache = keyVals;
			if (cb)
				cb();
		});
	}
	else {
		This._cookieLoop(function(key, val) {
			This.cache[key] = val;
		});

		if (cb)
			cb();
	}
}

ar.pref._set = function(key, val, cb) {
	var This = this;
	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("INSERT OR IGNORE INTO pref(pref_key, pref_val) values(?, ?)", [
					key, val
			]);

			tx.executeSql("update pref set pref_val = ? where pref_key = ?", [
					val, key
			], function(tx, res) {
				if (cb)
					cb(true);
			}, function(e) {
				ar.log('ar.pref._set: ' + e);
				if (cb)
					cb(false);
			});

			tx.executeSql("commit", []);
		});
	}
	else {
		var days = 10000;
		var date = new Date();
		date.setTime(date.getTime() + (days * 86400000));
		document.cookie = key + '=' + val + ';expires=' + date.toGMTString() + ";path=/";

		if (cb)
			cb(true);
	}
}

ar.pref._setBulk = function(data, cb) {
	var This = this;
	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			for ( var key in data) {
				var val = data[key];

				tx.executeSql("INSERT OR IGNORE INTO pref(pref_key, pref_val) values(?, ?)", [
						key, val
				]);

				tx.executeSql("update pref set pref_val = ? where pref_key = ?", [
						val, key
				]);
			}

			tx.executeSql("commit", []);

			if (cb)
				cb(true);
		});
	}
	else {
		var days = 10000;
		var date = new Date();
		date.setTime(date.getTime() + (days * 86400000));

		for ( var key in data)
			document.cookie = key + '=' + data[key] + ';expires=' + date.toGMTString() + ";path=/";
	}
}

ar.pref._get = function(key, cb) {
	var This = this;
	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("select pref_val from pref where pref_key = ?", [
				key
			], function(tx, res) {
				if (cb) {
					if (res && res.rows && res.rows.length > 0)
						cb(res.rows.item(0).pref_val);
					else
						cb(null);
				}
			}, function(e) {
				ar.log('ar.pref._get: ' + e);
				if (cb)
					cb(null);
			});
		});
	}
	else {
		This._cookieLoop(function(_key, _val) {
			if (_key == key) {
				if (cb)
					cb(val);
				return false;
			}
		});
	}
}

ar.pref._getKeys = function(prefix, cb) {
	var This = this;
	var result = [];

	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("select pref_key from pref where pref_key like '" + prefix + "%' ", [], function(tx, res) {
				for (var i = 0; i < res.rows.length; i++)
					result.push(res.rows.item(i).pref_key);

				if (cb)
					cb(result);
			}, function(e) {
				ar.log('ar.pref._getKeys: ' + e);
				if (cb)
					cb(null);
			});
		});
	}
	else {
		This._cookieLoop(function(key, val) {
			if (prefix == undefined || prefix == null || prefix == '' || ar.isPrefix(key, prefix))
				result.push(key);
		});

		if (cb)
			cb(result);
	}
}

ar.pref._getKeyVals = function(prefix, cb) {
	var This = this;
	var result = {};

	if (ar.isCordova()) {
		This.db.transaction(function(tx) {
			tx.executeSql("select pref_key, pref_val from pref where pref_key like '" + prefix + "%' ", [], function(tx, res) {
				for (var i = 0; i < res.rows.length; i++) {
					var key = res.rows.item(i).pref_key;
					var val = res.rows.item(i).pref_val;

					result[key] = val;
				}

				if (cb)
					cb(result);
			}, function(e) {
				ar.log('ar.pref._getKeyVals: ' + e);
				if (cb)
					cb(null);
			});
		});
	}
	else {
		This._cookieLoop(function(key, val) {
			if (prefix == undefined || prefix == null || prefix == '' || ar.isPrefix(key, prefix))
				result[key] = val;
		});

		if (cb)
			cb(result);
	}
}

ar.pref._cookieLoop = function(cb) {
	var This = this;
	var cookies = document.cookie.split(';');

	for (var i = 0; i < cookies.length; i++)
		try {
			cookies[i] = cookies[i].trim();
			var keyval = cookies[i].split('=');
			var b = cb(keyval[0], keyval[1]);

			if (b == false)
				break;
		}
		catch (e) {
			ar.log('ar.pref._cookieLoop: ' + e);
		}
}
