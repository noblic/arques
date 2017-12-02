/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

var execSync = require('child_process').execSync;
var fs = require("fs");
//var ug = require("uglify-js");
var r = [];
var version = '1.0.15';

r.push('include/top.js');
r.push('object/E.js');
r.push('singleton/icon.js');
r.push('singleton/math.js');
r.push('singleton/css.js');
r.push('singleton/pref.js');
r.push('singleton/valid.js');
r.push('singleton/net.js');
r.push('singleton/dlg.js');
r.push('singleton/color.js');
r.push('singleton/db.js');
r.push('singleton/file.js');
r.push('singleton/ext.js');

fs.readdirSync('object').forEach(function(file) {
	if (file == 'E.js')
		return;
	r.push('object/' + file);
});

r.push('singleton/ar.js');
r.push('include/btm.js');

//console.log(r);
var fileNames = '';

for (var i = 0; i < r.length; i++)
	fileNames += r[i] + ' ';

execSync('cat ' + fileNames + ' > dist/arques.' + version + '.js');

//
//
//

execSync('cp dist/arques.' + version + '.js /Volumes/Andy/project/all/Casture/src/www/js/arques.' + version + '.js');
execSync('cp dist/arques.' + version + '.js /Volumes/Andy/project/all/MapsWiki/src/www/js/arques.' + version + '.js');
execSync('cp dist/arques.' + version + '.js /Volumes/Andy/project/all/DiceShot/src/www/js/arques.' + version + '.js');

process.chdir('./dist')

try {
	execSync('rm -rf ./out/*');
}
catch (e) {
}

try {
	execSync('rm ./out/.DS_Store');
}
catch (e) {
}

try {
	execSync('rmdir out');
}
catch (e) {
}

try {
	execSync('jsdoc arques.' + version + '.js ../README.md -c conf.json');
}
catch (e) {
}

//execSync('cp arques.' + version + '.js ./out/');
execSync('cp test.html ./out');

//execSync('mkdir ./out/samples');
//execSync('cp -R samples/* ./out/samples/');

//execSync('uglifyjs --compress --mangle -- arques.' + version + '.js > arques.' + version + '.min.js');
console.log('done.');


