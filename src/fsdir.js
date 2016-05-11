/**
*@description 文件夹操作
*@auther yq
*@date 2016-5-5
@API
1.checkAndCreateDir				检查文件夹是否存在,若不存在则创建
2.createPaths					创建文件夹
3.removeDir						删除文件夹
4.dirExists						判断文件夹是否存在
5.getDirRecurFiles				递归读取目录下所有的文件
6.removeDirAllFile				删除目录下的文件，目录不存在抛出异常				


*/
var fs = require('fs');
var then = require('yqthen');
var path = require('path');
var fsfile = require('./fsfile');
var AsyncRecursearchDir = require('../lib/searchDir');

/**
@path {String} 路径
@callback {Function} -call(err);
*/
exports.checkAndCreateDir = (path,callback)=>{
	//检查文件目录是否存在	
	then((next)=>{
		exports.dirExists(path,(err,is)=>{
			if(err)
				return callback(err);

			if(is){
					return callback(null,true);
			}else{
				next();
			}
		});

	}).then((next)=>{
		fs.mkdir(path,(err)=>{
			callback(err,false);
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
				return callback(err);
			if(state.isDirectory()){
				return callback(null,true);
			}
			callback(null,false);
		});
	});
};


/**
*@parm path {String} -路径
*@param callback {Function} -回调函数  -call(err,files) `files` 文件数组
*/
exports.getDirRecurFiles = (path,callback)=>{
	exports.dirExists(path,(err,is)=>{
		if(err)
			return callback(err);

		if(!is)
			return callback('ERROR:'+path+'路径不存在');
		
		AsyncRecursearchDir(path,callback);

	});
};


/**
*@param _path {String} -目录
*@param callback {Function} -回调函数 call(err);
*/
exports.removeDirAllFile = (_path,callback)=>{
	then((next)=>{
		exports.dirExists(_path,(err,is)=>{
			if(err)
				return next(err);
			if(!is)
				return next('文件不存在');
			next();
		});
	}).then((next)=>{
		fs.readdir(_path,(err,files)=>{
			if(files.length === 0)
				return callback(null);

			next(err,files);
		});
	}).each((next,value)=>{
		fs.unlink(path.join(_path,value),(err)=>{
			next(err);
		});
	}).then((next)=>{
		callback(null);
	}).fail((next,err)=>{
		callback(err);
	});
};

