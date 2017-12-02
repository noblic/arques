ar.file = {};
ar.dir = {};

ar.file.readAsText = function(filePath, bypass, cb) {
	window.resolveLocalFileSystemURL(ar.safePath(filePath), function(fileEntry) {
		//alert(JSON.stringify(fileEntry));
		fileEntry.file(function(file) {
			var reader = new FileReader();

			reader.onloadend = function(e) {
				//alert(cb);
				var result = this.result;

				if (cb)
					cb(result, bypass);
				//delete reader;
			}

			reader.readAsText(file);
		});
	}, function(e) {
		ar.log('File read failed: ' + JSON.stringify(e));
		//alert('File read failed: ' + filePath + ', ' + JSON.stringify(e));

		if (cb)
			cb(null, bypass);
	});
}

ar.file.readAsBase64 = function(path, cb) {
	window.resolveLocalFileSystemURL(path, function(fileEntry) {
		fileEntry.file(function(file) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
				var content = this.result;
				content = content.match(/,(.*)$/)[1];
				cb(content);
			};
			reader.readAsDataURL(file);
		});
	}, function(e) {
		alert(path + " file doesn't exist.");
		cb(null);
	});
}

ar.file.writeAsText = function(path, fileName, text, bypass, cb) {
	window.resolveLocalFileSystemURL(ar.safePath(path), function(fileSystem) {
		fileSystem.getFile(fileName, {
			create : true,
			exclusive : false
		}, function(fileEntry) {
			fileEntry.createWriter(function(writer) {
				writer.onwriteend = function(e) {
					if (cb)
						cb(true, bypass);
				}
				writer.write(text);
			}, function(e) {
				ar.log('File createWriter failed: ' + JSON.stringify(e));
				alert('File createWriter failed: ' + path + ',' + fileName + ', ' + JSON.stringify(e));

				if (cb)
					cb(false, bypass);
			});
		}, function(e) {
			ar.log('Writing: getFile failed: ' + JSON.stringify(e));
			alert('Writing: getFile failed: ' + path + ',' + fileName + ', ' + JSON.stringify(e));

			if (cb)
				cb(false, bypass);
		});
	}, function(e) {
		ar.log('File write failed: ' + JSON.stringify(e));
		alert('File write failed: ' + path + ',' + fileName + ', ' + JSON.stringify(e));

		if (cb)
			cb(false, bypass);
	});
}

ar.safePath = function(path) {
	if (ar.isAndroid()) {
		path = ar.isPrefix(path, 'file://') ? path : 'file://' + path;
	}
	else {
		// nothing to do
	}

	return path;
}

ar.file.extractBase = function(path) {
	var filename = path.replace(/^.*[\\\/]/, '');
	path = path.substring(0, path.length - filename.length - 1);
	return path;
}

ar.file.extractName = function(path) {
	var filename = path.replace(/^.*[\\\/]/, '');
	return filename;
}

ar.file.isExisting = function(path, cb) {
	path = ar.safePath(path);

	window.resolveLocalFileSystemURL(path, function(file) {
		//alert(JSON.stringify(file));

		if (cb)
			cb(true, file);
	}, function(e) {
		if (cb)
			cb(false, null);
	});
}

ar.file.copy = function(from, fromName, to, toName, cb) {
	window.resolveLocalFileSystemURL(ar.safePath(from + '/' + fromName), function(file) {
		window.resolveLocalFileSystemURL(ar.safePath(to), function(destination) {
			file.copyTo(destination, toName, function() {
				if (cb)
					cb(1);
			}, function() {
				if (cb)
					cb(-2);
			});
		}, function(e) {
			//alert('fileMode(err1): ' + JSON.stringify(e));
			if (cb)
				cb(0);
		})
	}, function(e) {
		//alert('fileMode(err2): ' + JSON.stringify(e));

		if (cb)
			cb(-1);
	});
}

ar.file.move = function(from, to, cb) {
	var destPath = to.substring(0, to.lastIndexOf("/"));
	var destFile = to.replace(/^.*[\\\/]/, '');

	//alert(destPath + ',' + destFile);

	window.resolveLocalFileSystemURL(ar.safePath(from), function(file) {
		window.resolveLocalFileSystemURL(ar.safePath(destPath), function(destination) {
			file.moveTo(destination, destFile, function() {
				if (cb)
					cb(1);
			}, function() {
				if (cb)
					cb(-2);
			});
		}, function(e) {
			//alert('fileMode(err1): ' + JSON.stringify(e));
			if (cb)
				cb(0);
		})
	}, function(e) {
		//alert('fileMode(err2): ' + JSON.stringify(e));
		if (cb)
			cb(-1);
	});
}

ar.file.del = function(filePath, cb) {
	window.resolveLocalFileSystemURL(ar.safePath(filePath), function(fileEntry) {
		fileEntry.remove(function(file) {
			if (cb)
				cb(1);
		}, function(e) {
			//alert('fileDel(err1): ' + JSON.stringify(e));
			if (cb)
				cb(0);
		});
	}, function(e) {
		//alert('fileDel(err2): ' + JSON.stringify(e));
		if (cb)
			cb(-1);
	});
}

ar.dir.list = function(path, cb) { // original from http://stackoverflow.com/questions/8298124/list-files-inside-www-folder-in-phonegap
	window.resolveLocalFileSystemURL(ar.safePath(path), function(fileEntry) {
		//alert('dirMake: ' + JSON.stringify(fileEntry));
		fileEntry.getDirectory(".", { // "." is necessary for android
			create : false,
			exclusive : false
		}, function(directory) {
			//alert(JSON.stringify(directory));

			var directoryReader = directory.createReader();
			var list = [];

			directoryReader.readEntries(function(entries) {
				//alert(JSON.stringify(entries));

				for (var i = 0; i < entries.length; i++) {
					list[i] = {};
					list[i].name = entries[i].name;
					list[i].path = entries[i].nativeURL;
					list[i].isDir = entries[i].isDirectory;
					list[i].datetime = entries[i].datetime;
				}

				if (cb)
					cb(list);
			}, function(error) {
				ar.dlg.alert({
					title : 'dirList:readEntries failed: ' + error.code,
					cb : function() {
						if (cb)
							cb(null);
					}
				});
			});
		}, function(error) {
			ar.dlg.alert({
				title : 'dirList:getDirectory failed: ' + error.code,
				cb : function() {
					if (cb)
						cb(null);
				}
			});
		});
	}, function(error) {
		ar.dlg.alert({
			title : 'dirList:requestFileSystem failed: ' + error.code,
			cb : function() {
				if (cb)
					cb(null);
			}
		});
	});
}

ar.dir.del = function(dirPath, cb) {
	//alert(dirPath);

	window.resolveLocalFileSystemURL(ar.safePath(dirPath), function(fileEntry) {
		//alert('dirDel: ' + JSON.stringify(fileEntry));

		fileEntry.removeRecursively(function() {
			if (cb)
				cb(1)
		}, function(e) {
			//alert('dirDel(err1): ' + JSON.stringify(e));
			if (cb)
				cb(0)
		});
	}, function(e) {
		//alert('dirDel(err2): ' + JSON.stringify(e));
		if (cb)
			cb(-2)
	});
}

ar.dir.make = function(path, newDirName, cb) {
	window.resolveLocalFileSystemURL(ar.safePath(path), function(fileEntry) {
		//alert('dirMake: ' + JSON.stringify(fileEntry));

		fileEntry.getDirectory(newDirName, {
			create : true,
			exclusive : false
		}, function(dirEntry) {
			//alert('dirMake: ' + JSON.stringify(dirEntry));
			if (cb)
				cb(1)
		}, function(e) {
			//alert('dirMake(err1): ' + JSON.stringify(e));
			if (cb)
				cb(0)
		});
	}, function(e) {
		//alert('dirMake(err2): ' + JSON.stringify(e));
		if (cb)
			cb(-1);
	});
}
