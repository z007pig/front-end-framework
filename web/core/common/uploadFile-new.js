/**
 * 文件上传
 * 依赖：jquery
 */
class zjxx_upladFile {
    /**
     * 上传文件方法
     * @param {obj} fileObj 文件对象
     * @param {obj} info 文件参数
     * @param {obj} promise 失败回调
     * @param {Function} progresscallback 进度条回调
     * @param {Function} callbacks 上传成功回调
     * @param {Function} failcallback 失败条回调
     */
    static  UpladFile (fileObj,info, promise={}, progresscallback, callbacks, failcallback) {
        let url = sysSet.dataUrl;
        //如果url以“/”结尾，后续就不需要加“/”
        if(url.endsWith("/")){
            url = url.substring(0,url.length-1);
        }
        url +="/run"; // 接收上传文件的后台地址
        if(isEmpty(info)){
            info="{}";
        }else{
            info = {
               info:info,
               type:'info',
            }
        }
        let _thispromise = {
            functionName:"uploadFile"
        };
        if (isNotEmpty(promise)) {
            _thispromise = promise;
        }
        _thispromise.functionName = "uploadFile";
        var info = JSON.stringify(info);
        var infoClass = JSON.stringify({ "id": "file" });
        _thispromise = JSON.stringify(_thispromise);
        var form = new FormData(); // FormData 对象
        form.append("file", fileObj); // 文件对象
        form.append("info", info);
        form.append("infoClass", infoClass);
        form.append("promise", _thispromise);
        
        startMark();//开启等待框
        
	    let thing = startAjax_thing({"thingName":"上传文件"}, url, form);

       let xhr = new XMLHttpRequest();  // XMLHttpRequest 对象
        
        xhr.open("post", url, true); //post方式，url为服务器请求地址，true 该参数规定请求是否异步处理。
        
        //页面进度等待
        modifyAjax_thing(thing, 1);
        // xhr.setRequestHeader('processData')
        
        // xhr.setRequestHeader("token", localStorage.getItem('token')); //token
        xhr.setRequestHeader("token", "visitor"); //token
        xhr.onload = function (evt) {
            //页面进度等待
			endAjax_thing(thing);
            let res = JSON.parse(evt.target.responseText);
            if (res.flag === 200) {
                if(callbacks){
                	callbacks(res);		
                }
            } else {
                if(failcallback){
                	failcallback(res);
                }
            }
        };
        xhr.onerror = function (evt) {
             //页面进度等待
			endAjax_thing(thing);
            let res = JSON.parse(evt.target.responseText);
            if(failcallback){
            	failcallback(res);
            }
        };
        xhr.upload.onprogress = function (evt) {
            // event.total是需要传输的总字节，event.loaded是已经传输的字节。如果event.lengthComputable不为真，则event.total等于0
            if (evt.lengthComputable) {
                let progressNum = Math.round(evt.loaded / evt.total * 100);
                if(progresscallback){
                    progresscallback(progressNum)
                }
            }
        };
        xhr.send(form); //开始上传，发送form数据
    }

    /**
     * 断点续传上传文件方法
     * @param {obj} fileObj 文件对象
     * @param {obj} info 文件参数
     * @param {obj} promise 约定
     * @param {Function} progresscallback 进度条回调
     * @param {Function} callbacks 上传成功回调
     * @param {Function} failcallback 失败条回调
     */
    static UpladFileBreakpointContinual (fileObj, info, promise, progresscallback, callbacks, failcallback) {
        //获取分片大小
        let fileChunkSize = sysSet.fileChunkSize;
        //分片
        let fileChunks = this.sliceFile(fileObj, fileChunkSize);
        //获取文件的唯一标识
        let fileMD5 = this.getFileMD5(fileObj);
        //已上传成功的分片数量
        let doneFileChunk = 0;
        let fileName = fileObj.name;
        let filesize = fileObj.size;
        let _this = this;
        //判断文件是否已上传
        _this.judgeFileISUpload(info, fileMD5, function (reuslt) {
            let isUpload = reuslt.infos[0].isUpload;
            let isRedis = reuslt.infos[0].isRedis;
            let uploaded_file_index = reuslt.infos[0]["uploaded_file_index"]? reuslt.infos[0]["uploaded_file_index"]:[];
            if (isRedis && !isUpload) {
                //并发上传分片文件
                for (let index = 0; index < fileChunks.length; index++) {
                    const file = fileChunks[index];
                    //检查分片是否已上传
                    if(uploaded_file_index.includes(index)){
                        doneFileChunk++;
                    }else{
                        //整理info参数
                        let fileChunkInfo ={
                            fileMD5 : fileMD5,
                            fileName : fileName,
                            filesize : filesize,
                            partIndex :index,
                            partNum : fileChunks.length
                        };
                        //合并info.info
                        info.info = {...info.info, ...fileChunkInfo};
                        
                        _this.UpladFileChunk(file, info, promise, function (res, info, fileObj) {
                            //已完成数+1
                            doneFileChunk++;
                            //上传记录本地保存
                            // _this.setFileUploadRecord(fileMD5, index);
                            //进度函数回调
                            progresscallback(res, info, fileObj);
                            //如果是最后一个分片完成
                            if(doneFileChunk == fileChunks.length){
                                //执行整体完成回调
                                callbacks(res, info, fileObj)
                            }
                        }, failcallback);
                    }
                    
                }
            }else if(!isRedis){
                //没有开启redis，无法使用分片功能，，FINXME:后面要改
                alert("没有开启redis，无法使用分片功能!");
            }else{
                //之前已上传过，不用再上传
                callbacks(res, info, fileObj)
            }

        }, function (reuslt) {

        })  
    }

    /**
     * 文件分片
     * @param {obj} fileObj 文件对象
     * @param {int} chunkSize 分片大小
     */
    static sliceFile(file, chunkSize) {
        const chunks = [];
        let offset = 0;
        while (offset< file.size) {
          const chunk = file.slice(offset, offset + chunkSize);
          chunks.push(chunk);
          offset += chunkSize;
        }
      
        return chunks;
    }

    /**
     * 获取文件的唯一标识
     * @param {obj} file 文件对象
     */
    static getFileMD5(file) {
        const fileName = file.name;
        const fileSize = file.size;
        const lastModified = file.lastModified;
        const fileMD5 = CryptoJS.MD5(fileName + fileSize + lastModified).toString();
        return fileMD5;
    }

    /**
     * 单个分片文件上传
     * @param {obj} fileObj 文件对象
     * @param {obj} info 文件参数
     * @param {obj} promise 约定
     * @param {Function} callbacks 上传成功回调
     * @param {Function} failcallback 失败条回调
     */
    static UpladFileChunk(fileObj, info, promise, callbacks, failcallback){
        let url = sysSet.dataUrl+"/run"; // 接收上传文件的后台地址
        if(isEmpty(info)){
            info="{}";
        }
        let _thispromise = {
            functionName:"uploadFileByPart"
        };
        if (isNotEmpty(promise)) {
            _thispromise = promise;
        }
        info = JSON.stringify(info);
        let infoClass = JSON.stringify({ "id": "file" });
        _thispromise = JSON.stringify(_thispromise);
        let form = new FormData(); // FormData 对象
        form.append("file", fileObj); // 文件对象
        form.append("info", info);
        form.append("infoClass", infoClass);
        form.append("promise", _thispromise);
        let xhr = new XMLHttpRequest();  // XMLHttpRequest 对象
        xhr.open("post", url, true); //post方式，url为服务器请求地址，true 该参数规定请求是否异步处理。
        xhr.setRequestHeader("token", localStorage.getItem('token')); //token
        xhr.onload = function (evt) {
            let res = JSON.parse(evt.target.responseText);
            callbacks(res, info, fileObj)//请求完成
        };
        xhr.onerror = function (evt) {
            let res = JSON.parse(evt.target.responseText);
            failcallback(res, info, fileObj)//请求失败
        };
        xhr.send(form); //开始上传，发送form数据
    }
    
    static judgeFileISUpload (info, fileMD5, callbacks, failcallback){
        if(isEmpty(info)){
            info = {}
        };   
        info["fileMD5"]=fileMD5;
        let infos={
            "id":"",
            "type":"info",
            "info":info
        };
   
      let params = {
          infoClass:JSON.stringify({ "id":"file"}),
          info:JSON.stringify(infos),
          promise:JSON.stringify({"functionName":"judgeFileISUpload"})
      }
        zjxxAjaxRun(params, function (result) {
            callbacks(result);
         }, function (result) {
            failcallback(result);
         }) 
    }



    /** 
     * 上传记录本地保存
     * @param {obj} info 文件相关参数
     */
    static setFileUploadRecord(fileMD5, index){
        //获取当前时间
        let nowTime = timeStampNow();
        //记录本地上传记录
        let zjxx_file_upload_record = localStorage.getItem('zjxx_file_upload_record');
        zjxx_file_upload_record = isEmpty(zjxx_file_upload_record) ?"{}":zjxx_file_upload_record;
        let zjxx_file_upload_record_obj = JSON.parse(zjxx_file_upload_record);
        zjxx_file_upload_record_obj[fileMD5] = isEmpty(zjxx_file_upload_record_obj[fileMD5])?{}:zjxx_file_upload_record_obj[fileMD5]
        let this_file_upload_record_list = zjxx_file_upload_record_obj[fileMD5]["uploaded_file_index"];
        this_file_upload_record_list = this_file_upload_record_list?this_file_upload_record_list:[];
        if (!this_file_upload_record_list.includes(index)) {
            this_file_upload_record_list.push(index);
        }
        this_file_upload_record_list = [...new Set(this_file_upload_record_list)]
        zjxx_file_upload_record_obj[fileMD5]["uploaded_file_index"] = this_file_upload_record_list;
        zjxx_file_upload_record_obj[fileMD5]["last_upload_time"] = nowTime;
        zjxx_file_upload_record = JSON.stringify(zjxx_file_upload_record_obj);
        localStorage.setItem('zjxx_file_upload_record', zjxx_file_upload_record);
        this.cleanExpiredRecords()
    }

    /** 
     * 判断文件是否上传过
     * @param {String} fileMD5 文件唯一标识
     * @param {int} index 文件相关参数
     */
    static checkFileUploaded(fileMD5, index){
        this.cleanExpiredRecords()
        let result = false;
        let zjxx_file_upload_record = localStorage.getItem('zjxx_file_upload_record');
        if(zjxx_file_upload_record){
            let zjxx_file_upload_record_obj = JSON.parse(zjxx_file_upload_record);
            zjxx_file_upload_record_obj[fileMD5] = isEmpty(zjxx_file_upload_record_obj[fileMD5])?{}:zjxx_file_upload_record_obj[fileMD5]
            let this_file_upload_record_list = zjxx_file_upload_record_obj[fileMD5]["uploaded_file_index"];
            if (this_file_upload_record_list && this_file_upload_record_list.includes(index)) {
                result = true;
            }
        }
        return result;
    }

     /** 
     * 清理过期记录
     */
     static cleanExpiredRecords(){
        //获取当前时间
        let nowTime = timeStampNow();
        let zjxx_file_upload_record = localStorage.getItem('zjxx_file_upload_record');
        zjxx_file_upload_record = zjxx_file_upload_record?"{}":zjxx_file_upload_record;
        let zjxx_file_upload_record_obj = JSON.parse(zjxx_file_upload_record);
        for (const key in zjxx_file_upload_record_obj) {
            const last_upload_time = zjxx_file_upload_record_obj[key]["last_upload_time"];
            if (nowTime - last_upload_time > sysSet.fileBreakpointContinualValidTime) {
                delete zjxx_file_upload_record_obj[key]
            }
        }
    }
}

// key="zjxx_file_upload_record"
// value=
// {
//     "文件唯一标识1": {
//         "uploaded_file_index":[0,1,2],//已上传片的index集合
//         "last_upload_time":1710914385//最后上传时间-时间戳，超过默认时间就要删除记录
//     },
//     "文件唯一标识2": {
//         "uploaded_file_index":[0,1,2],//已上传片的index集合
//         "last_upload_time":1710914385//最后上传时间-时间戳，超过默认时间就要删除记录
//     }
// }