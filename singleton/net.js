/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

/**
 * @namespace net
 * @memberOf ar
 * @desc Net singleton to manage the network methods.
 */

ar.net = {}

/**
 * @func html
 * @memberOf ar.net
 * @desc Loads raw html string of specified url.
 * @param {string} url - Relative url of the default domain. Set the default domain first with <b>ar.setDomain(url);</b>.
 * @param {func} cb(html) - Callback. <b>html</b> will be the string when it's sucessful, otherwise it's null.
 */

ar.net.html = function(url, cb) {
	if (url[0] == '/')
		url = url.substring(1);

	if (ar._isCordova) {
		ar.fileReadAsText(ar.pathApp + '/www/' + url, null, function(content) {
			cb(content);
		});
	}
	else {
		var xhr = new XMLHttpRequest();
		xhr.timeout = 5000;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200)
					cb(xhr.responseText);
				else if (xhr.status == 0)
					cb(null);
			}
		}
		xhr.open("GET", ar._domain + '/' + url, true);
		xhr.send(null);
	}
}

/**
 * @func get
 * @memberOf ar.net
 * @desc Gets json data from the url by GET method.
 * @param {string} url - Relative url of the default domain. Set the default domain first with <b>ar.setDomain(url);</b>.
 * @param {object} params - Json object of parameters.
 * @param {func} cb(isSucc, data) - Callback. <b>isSucc</b> will be true when it's successful. <b>data</b> is json object of the result.
 */

ar.net.get = function(q, params, cb) {
	ar.net.req(q, params, false, cb);
};

/**
 * @func get
 * @memberOf ar.net
 * @desc Gets json data from the url by POST method.
 * @param {string} url - Relative url of the default domain. Set the default domain first with <b>ar.setDomain(url);</b>.
 * @param {object} params - Json object of parameters.
 * @param {func} cb(isSucc, data) - Callback. <b>isSucc</b> will be true when it's successful. <b>data</b> is json object of the result.
 */

ar.net.post = function(q, params, cb) {
	ar.net.req(q, params, true, cb);
};

ar.net.req = function(q, params, isPost, cb) { // request
	if (q[0] == '/')
		q = q.substring(1);

	var url = ar._domain + '/' + q;
	//ar.log(url);

	var body = '';

	if (typeof params == 'function') {
		cb = params;
	}
	else {
		var i = 0;
		for ( var k in params) {
			body += ((i == 0 ? '' : '&') + k + '=' + params[k]);
			i++;
		}
	}

	//			if (ar.isCordova()) {
	//				NoblicUtils.act('req', {
	//					url : ar._domain + '/' + q,
	//					params : body
	//				}, function(r) {
	//					fin(true, r);
	//				}, function(r) {
	//					fin(false, r);
	//				});
	//				return;
	//			}
	//			else {
	var xhr = new XMLHttpRequest();
	xhr.timeout = 15000;
	xhr.onreadystatechange = function() {
		//ar.log('xhr.status = ' + xhr.status);
		//ar.log('xhr.readyState = ' + xhr.readyState);

		if (cb && xhr.readyState == 4) {
			var data = null;

			try {
				data = JSON.parse(xhr.responseText);
			}
			catch (e) {
				ar.log('ar.net.req: err: parsing json failed: xhr.responseText = ' + xhr.responseText);
			}

			try {
				//ar.log(document.cookie);
				//ar.log('response = ' + r);
				cb(xhr.status == 200 && data != null, data);
			}
			catch (e) {
				ar.log('ar.net.req: err: ' + q + ',' + e + ',' + e.stack);
			}
		}
	};

	xhr.getResponseHeader('Set-Cookie');
	//xhr.withCredentials = true;
	xhr.crossDomain = true;
	xhr.open(isPost ? "POST" : "GET", url, true);
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded'); // 
	//xhr.setRequestHeader('Cache-Control', 'no-cache');
	//xhr.setRequestHeader("X-CSRFToken", csrftoken);
	//xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
	//xhr.setRequestHeader("x-requested-with", '');
	xhr.send(body);
	//ar.log(body);
	//			}
}

/**
 * @func upload
 * @memberOf ar.net
 * @desc Uploads files to the server.
 * @param {object} opt - Options as below:<br>
 * {<br>
 * url: '/customer.picture', // Relative url of the default domain.<br>
 * params: [{ key1: val1 }, { key2: val2 }, ... ], // Query parameters array.<br>
 * files: [ path1, path2, ... ], // Local file path string array specified by 'input' tag.<br>
 * onProgress: function(oEvent) { ... }, // &lt;Optional&gt;. Please refer to https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest.<br>
 * onError: function(evt) { ... }, // &lt;Optional&gt;<br>
 * onCancel: function(evt) { ... }, // &lt;Optional&gt;<br>
 * onDone: function(isSucc, json) { ... }, // &lt;Optional&gt;. <b>isSucc</b> is true when the query is successful. <b>json</b> is the json structure of the result<br>
 * }<br>
 */

ar.net.upload = function(opt) {
	var fd = new FormData();
	var xhr = new XMLHttpRequest();
	xhr.timeout = 60 * 60 * 1000;

	for ( var k in opt.params) {
		//ar.log(k + ',' + opt.params[k]);
		fd.append(k, opt.params[k]);
	}

	for ( var i in opt.files) {
		fd.append('id_file_' + i, opt.files[i]);
		ar.log('form file: ' + opt.files[i]);
	}

	//ar.log(opt.params);
	//ar.log(opt.files);
	//ar.log(fd);

	if (opt.onProgress)
		xhr.addEventListener("progress", opt.onProgress, false);

	if (opt.onError)
		xhr.addEventListener("error", opt.onError, false);

	if (opt.onCancel)
		xhr.addEventListener("abort", opt.onCancel, false);

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var data = null;

			try {
				data = JSON.parse(xhr.responseText);
			}
			catch (e) {
				ar.log('ar.net.upload: err: parsing json failed: xhr.responseText = ' + xhr.responseText);
			}

			try {
				//ar.log('response = ' + xhr.responseText);
				if (opt.onDone)
					opt.onDone(xhr.status == 200 && data != null, data);
			}
			catch (e) {
				ar.log('ar.net.upload: err: ' + e + ',' + e.stack);
			}
		}
	}

	//	for (var [key, value] of fd.entries()) { 
	//	  console.log(key, value);
	//	}	

	xhr.withCredentials = true;
	xhr.crossDomain = true;
	xhr.open("POST", ar._domain + '/' + opt.url, true);

	if (opt.onPrepareXhr)
		opt.onPrepareXhr(xhr);

	//var oundary = "---------------------------" + Date.now().toString(16);	
	//xhr.setRequestHeader('Content-type', 'multipart/form-data'); //
	xhr.send(fd);
}

/*
> run chrome with unsafe mode for testing.
open -a /Applications/Google\ Chrome.app --args --disable-web-security --user-data-dir="" 
 
ar.net.upload = function(opt) {
	//
	
//			ar.log(fd);

	//xhr.setRequestHeader("X-File-Type", file.type);
	xhr.send(null);
} */
