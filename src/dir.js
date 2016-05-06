/**
*@description 文件夹操作
*@auther yq
*@date 2016-5-5
@API
1.checkAndCreateDir				检查文件夹是否存在,若不存在则创建
2.createPaths					创建文件夹
3.removeDir						删除文件夹
4.dirExists						判断文件夹是否存在
5.fileExists					判断文件是否存在
6.getDirRecurFiles				递归读取目录下所有的文件


*/
var fs = require('fs');
var then = require('yqthen');
var path = require('path');

/**
@path {String} 路径
@callback {Function} -call(err);
*/
exports.checkAndCreateDir = (path,callback)=>{
	//检查文件目录是否存在	
	then((next)=>{
		// fs.exists(path,(result)=>{
		// 	if(!result)
		// 		return next();
		// 	fs.lstat(path,(err,state)=>{
		// 		if(err)
		// 			return next(err);
		// 		if(state.isDirectory()){
		// 		}
		// 		next();
		// 	});
		// });
		exports.dirExists(path,(err,is)=>{
			if(err)
				return callback(err);

			if(is){
					return callback(null,'目录已存在');
			}else{
				next();
			}
		});

	}).then((next)=>{
		fs.mkdir(path,(err)=>{
			callback(err);
		});
	}).fail((next,err)=>{
		console.log("ERROR:"+path+"目录创建失败",err);
		callback(err);
	});
};


/**
@params params {String|[String]} -路径
@params callback {Function}  -call(err);
*/
exports.createPaths = function(params,callback){
	if(!(params instanceof Array)){
		params = [params];
	}
	then.each(params,(next,path)=>{
		exports.checkAndCreateDir(path,(err)=>{
			next(err,path);				
		});
	}).then((next)=>{
		callback();
	}).fail((next,err,path)=>{
		console.log("ERROR:"+path+"目录创建失败",err);
		callback(err);
	});
};

/**
@param path {String} -路径
@param callback {Function} -call(err,true) 
			true/false -> 存在/不存在 
*/
exports.dirExists = (path,callback)=>{
	fs.exists(path,(result)=>{
		if(!result)
			return callback(null,false);
		fs.lstat(path,(err,state)=>{
			if(err)
				return next(err);
			if(state.isDirectory()){
				return callback(null,true);
			}
			callback(null,false);
		});
	});
};
/** 和dirExists 用法一致*/
exports.fileExists = (path,callback)=>{
	fs.exists(path,(result)=>{
		if(!result)
			return callback(null,false);
		fs.lstat(path,(err,state)=>{
			if(err)
				return next(err);
			if(!state.isDirectory()){
				return callback(null,true);
			}
			callback(null,false);
		});
	});
};



function travel(dir, callback, finish) {
  fs.readdir(dir, function (err, files) {
    (function next(i) {
      if (i < files.length) {
        var pathname = path.join(dir, files[i]);
 
        fs.stat(pathname, function (err, stats) {
          if (stats.isDirectory()) {
            travel(pathname, callback, function () {
              next(i + 1);
            });
          } else {
            callback(pathname, function () {
              next(i + 1);
            });
          }
        });
      } else {
        finish && finish();
      }
    }(0));
  });
}

var _getDirRecurFiles = (filePath,callback)=>{
	var outFiles = [];

	then((next)=>{
		fs.readdir(filePath,(err, files)=>{
			next(err,files);
		});
	})
	.each((next,file)=>{
		var curFilePath = path.join(filePath,file);
		exports.fileExists(curFilePath,(err,is)=>{
			if(err)
				next(err);

			if(is){
				outFiles.push(curFilePath);
				next();
			}else{
				_getDirRecurFiles(curFilePath,(err,files)=>{
					outFiles = outFiles.concat(files);
					next(err);
				});
			}
		});
	})
	.then((next)=>{
		callback(null,outFiles);
	})
	.fail((next,err)=>{
		console.log('ERROR getDirRecurFiles',err);
		callback(err);
	});
};

exports.getDirRecurFiles = (filePath,callback)=>{
		exports.dirExists(filePath,(err,is)=>{
			if(err)
				return callback(err);
			if(!is)
				return callback('文件夹不存在');
			_getDirRecurFiles(filePath,(err,outFiles)=>{
				callback(err,outFiles);
			});
		});
};

exports.getDirRecurFiles(path.join(__dirname,'../../'),(err,outFiles)=>{
	console.log(err,outFiles.length);
});


