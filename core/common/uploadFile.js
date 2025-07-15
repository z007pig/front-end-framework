/**
 * 文件上传
 * 依赖：jquery
 */

var upladFile = (function (_this) {
    var xhr;

    // 用户自定义回调(全局)
    var _customCallbacks = {
        // 单文件完成 对应type传1
        completeCallBack1: function (json) {
        },
        // 单文件进度 对应type传1
        progressCallBack1: function (num, domId) {
            console.log('p1')
        },
        // 单文件进度 对应type传2
        progressCallBack2: function (num, domId) {
            console.log('p2')
            $(".updatefileprogress-line").css("width", num + '%');
            if (num === 100) {
                $(".updatefileprogress").remove();
            }
        },
        startCallBack1: function () { },
    };
    // 自定义渲染方案
    var _renders = {

    }
    // 事件处理
    var _initEvent = {
        // 文件变化
        _changeEvent: function (domId, callback) {
            $("body").on("change", "#" + domId + ' input', function () {
                var file = $(this)[0].files[0];
                typeof callback === 'function' && callback(file);
            })
        },
        // 默认事件
        _defaultEven: function (domId) {
            // 经过
            $("body").on("dragover", "#" + domId, function (e) {
                e.preventDefault()
                e.stopPropagation()
            })
            // 进入
            $("body").on("dragenter", "#" + domId, function (e) {
                e.preventDefault()
                e.stopPropagation()
                $("#updatefilebox").removeClass("drag").addClass("dragenter updatefileboxback");
            })
            // 离开 
            $("body").on("dragleave", "#" + domId, function (e) {
                e.preventDefault()
                e.stopPropagation()
                $("#updatefilebox").removeClass("dragenter updatefileboxback").addClass("drag");
            })
        },


        // 1：先选文件再点上传按钮；---单文件
        1: function (domId, callbacks) {
            var fileCatch;
            var __this = this;
            this._defaultEven(domId)
            this._changeEvent(domId, function (file) {
                fileCatch = file;
                fileCatch.domId = domId;
            })
            $("body").on("drop", "#" + domId, function (e) {
                e.preventDefault()
                e.stopPropagation()
                var files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    fileCatch = files[0];
                    fileCatch.domId = domId;
                } else {
                    alert("文件无效！")
                }
            })
            $("body").on("click", "#" + domId + "+.fileUpload", function () {
                if (fileCatch) {
                    UpladFile(fileCatch, function (num) {

                    }, callbacks)
                } else {
                    alert("文件无效！")
                }
            })
        },
        // 2点选/拖动上传；---单文件
        2: function (domId, callbacks) {
            this._defaultEven(domId);
            var __this = this;
            $("body").on("drop", "#" + domId, function (e) {
                e.preventDefault()
                e.stopPropagation()
                var files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    files[0].domId = domId;
                    UpladFile(files[0], function (num) {

                    }, callbacks)
                } else {
                    alert("文件无效！")
                }
            })
            this._changeEvent(domId, function (file) {
                file.domId = domId;
                UpladFile(file, function (num) {

                }, callbacks)
                $("#update_file").attr("type", "text");
                $("#update_file").attr("type", "file")
            })
        },
        // 3：直接选择文件上传；---单文件
        3: function (domId, callbacks) {
            var __this = this;
            // 选择文件上传
            this._changeEvent(domId, function (file) {
                file.domId = domId;
                UpladFile(file, function (num) {

                }, callbacks)
                $("#update_file").attr("type", "text");
                $("#update_file").attr("type", "file")
            })
        },

        // 4：先选文件再点上传按钮；---多文件
        4: function (domId, callbacks) {
            var fileCatch;
            var __this = this;
            this._defaultEven(domId)
            this._changeEvent(domId, function (file) {
                fileCatch = file;
                fileCatch.domId = domId;
            })
            $("body").on("click", "#" + domId + "+.fileUpload", function () {
                if (fileCatch) {
                    UpladFile(fileCatch, function (num) {

                    }, callbacks)
                } else {
                    alert("文件无效！")
                }
            })
        },
        // 5点选/拖动上传；---多文件
        5: function (domId, callbacks) {
            this._defaultEven(domId);
            var __this = this;
            $("body").on("drop", "#" + domId, function (e) {
                e.preventDefault()
                e.stopPropagation()
                $("#" + domId).removeClass("dragenter updatefileboxback").append("<div class='updatefileprogress'><div class='updatefileprogress-line'></div><div class='updatefileprogressbtn'>取消上传</div></div>");
                var files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    files[0].domId = domId;
                    UpladFile(files[0], function (num) {

                    }, callbacks)
                } else {
                    alert("文件无效！")
                }
            })
            this._changeEvent(domId, function (file) {
                file.domId = domId;
                UpladFile(file, function (num) {

                }, callbacks)
                $("#update_file").attr("type", "text");
                $("#update_file").attr("type", "file")
            })
        },
        // 6：直接选择文件上传---多文件
        6: function (domId, callbacks) {
            var __this = this;
            // 选择文件上传
            this._changeEvent(domId, function (file) {
                file.domId = domId;
                UpladFile(file, function (num) {

                }, callbacks)
                $("#update_file").attr("type", "text");
                $("#update_file").attr("type", "file")
            })
        },
        default: function (domId, callbacks) {
            this._defaultEven(domId);
            var __this = this;
            $("body").on("drop", "#" + domId, function (e) {
                e.preventDefault()
                e.stopPropagation()
                $("#" + domId).removeClass("dragenter updatefileboxback").append("<div class='updatefileprogress'><div class='updatefileprogress-line'></div><div class='updatefileprogressbtn'>取消上传</div></div>");
                var files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    files[0].domId = domId;
                    UpladFile(files[0], function (num) {

                    }, callbacks)
                } else {
                    alert("文件无效！")
                }
            })
            this._changeEvent(domId, function (file) {
                file.domId = domId;
                UpladFile(file, function (num) {

                }, callbacks)
                $("#update_file").attr("type", "text");
                $("#update_file").attr("type", "file")
            })
        },
    }
    // 检测图片类型
    function isImage(type) {
        var reg = /(image\/jpeg|image\/jpg|image\/gif|image\/png)/gi;
        return reg.test(type)
    }
    
/**
 * 上传文件方法
 * @param {obj} fileObj 文件对象
 * @param {obj} info 文件参数
 * @param {Function} callback 进度条回调
 * @param {Function} callbacks 上传成功回调
 */
    function UpladFile(fileObj,info, callback, callbacks, promise) {
        var domId = fileObj.domId;
        let url = sysSet.dataUrl;
        //如果url以“/”结尾，后续就不需要加“/”
        if(url.endsWith("/")){
            url = url.substring(0,url.length-1);
        }
        url += "/run";
        if(isEmpty(info)){
            info="{}";
        }else{
            info = {
               info:info,
               type:'info',
            }
        }
        var _thispromise = {};
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
        xhr = new XMLHttpRequest();  // XMLHttpRequest 对象
        xhr.open("post", url, true); //post方式，url为服务器请求地址，true 该参数规定请求是否异步处理。
        // xhr.setRequestHeader('processData')
        
        // xhr.setRequestHeader("token", localStorage.getItem('token')); //token
        xhr.setRequestHeader("token", "visitor"); //token

        xhr.onload = function (evt) {
            uploadComplete(evt, callbacks, fileObj)//请求完成
        };
        xhr.onerror = uploadFailed; //请求失败
        xhr.upload.onprogress = function (evt) {
            // event.total是需要传输的总字节，event.loaded是已经传输的字节。如果event.lengthComputable不为真，则event.total等于0
            if (evt.lengthComputable) {
                var progressNum = Math.round(evt.loaded / evt.total * 100);
                if(callback){
                    callback(progressNum)
                }
                callbacks.progressCallBack && callbacks.progressCallBack(progressNum, domId);
            }
        };
        xhr.upload.onloadstart = function () {//上传开始执行方法
            callbacks.startCallBack && callbacks.startCallBack(domId, isImage(fileObj.type))
        };
        xhr.send(form); //开始上传，发送form数据
    }
    // 导入数据函数1.0(废弃)
    function importExeclForReturnPlus(fileObj, callback) {
        var url = inputXlsxReturnfacePlus; // 接收上传文件的后台地址
        var info={
                
        };
        var user={
            orgId : dataCenter.user.orgid,
            depId : dataCenter.user.depId,
            roleId : dataCenter.user.roleId,
            userId : dataCenter.user.userId,
            tokentime : dataCenter.user.tokentime,
            token : dataCenter.user.token
        };
        user = JSON.stringify(user) 
        if(isEmpty(info)){
            info="";
        }else{
            info = JSON.stringify(info) 
        }
        var form = new FormData(); // FormData 对象
        form.append("file", fileObj); // 文件对象
        form.append("classid",fileObj.classid?fileObj.classid:'');
        form.append("fieldline",fileObj.fieldline?fileObj.fieldline:'');
        form.append("startline",fileObj.startline?fileObj.startline:'');
        form.append("endline",fileObj.endline?fileObj.endline:'');
        form.append("orgid",fileObj.orgid?fileObj.orgid:'');
        form.append("userid",fileObj.userid?fileObj.userid:'');
        xhr = new XMLHttpRequest();  // XMLHttpRequest 对象
        xhr.open("post", url, true); //post方式，url为服务器请求地址，true 该参数规定请求是否异步处理。
        xhr.onload = function (evt) {
            var res = JSON.parse(evt.target.responseText);
            callback(res)
        };
        xhr.send(form); //开始上传，发送form数据
    }
    // 导入数据函数2.0
    function importExeclForReturn(fileObj, callback) {
        var url = inputXlsxReturnfacePlus; // 接收上传文件的后台地址
        var form = new FormData(); // FormData 对象
        form.append("file", fileObj); // 文件对象
        form.append("fieldline",fileObj.fieldline?fileObj.fieldline:'');
        form.append("startline",fileObj.startline?fileObj.startline:'');
        form.append("endline",fileObj.endline?fileObj.endline:'');
   
        xhr = new XMLHttpRequest();  // XMLHttpRequest 对象
        xhr.open("post", url, true); //post方式，url为服务器请求地址，true 该参数规定请求是否异步处理。
        xhr.onload = function (evt) {
            var res = JSON.parse(evt.target.responseText);
            callback(res)
        };
        xhr.send(form); //开始上传，发送form数据
    }
    //上传成功响应
    function uploadComplete(evt, callbacks, fileObj) {
        //服务断接收完文件返回的结果
        var res = JSON.parse(evt.target.responseText);
        if (res.flag === 200) {
            var title = fileObj.name;
            var fileType = title.split('.')[title.split('.').length - 1]
            var pramas = {
                flag: 1,
                id: res.infos[0].id,
                title: title,
                fileType: fileType,
                filesize:fileObj.size
            }
            // if (isImage(fileObj.type)) {
            //     pramas.isImg = true;
            //     pramas.blob = fileObj;
            // }
            // console.log(callbacks.uploadCompleteCallBack)
            callbacks(pramas);
            callbacks.uploadCompleteCallBack && callbacks.uploadCompleteCallBack(pramas)
        } else {
            callbacks.uploadCompleteCallBack && callbacks.uploadCompleteCallBack({ flag: 0 })
        }

    }
    //上传失败
    function uploadFailed(evt) {
        alert("上传失败！");
    }
    //取消上传
    function cancleUploadFile() {
        xhr.abort();
    }
    // 设置回调（重置默认回调）
    function setCallBack(callbackName, type, callback) {
        if (callbackName && typeof callback === 'function') {
            _customCallbacks[callbackName + 'CallBack' + type] = callback
        }
    }
    // 设置初始化渲染方式
    function setRender(type, callback) {
        if (type && typeof callback === 'function') {
            _renders['render' + type] = callback
        }
    }
    /**
     * 初始化方法
     * @param {domid} domId 
     * @param {number} type 1：先选文件再点上传按钮；2点选/拖动上传；3：直接选择文件上传
     * @param {Object} callbacks 自定义回调
     */
    function init(domId, type, callbacks) {
        // 1. 使用回调和render 优先级：自定义>全局>默认
        if (!callbacks) {
            callbacks = {}
        }
        if (!callbacks.progressCallBack) {
            callbacks.progressCallBack = _customCallbacks['progressCallBack' + type]
        }
        if (!callbacks.uploadCompleteCallBack) {
            callbacks.uploadCompleteCallBack = _customCallbacks['completeCallBack' + type]
        }
        if (!callbacks.startCallBack) {
            callbacks.startCallBack = _customCallbacks['startCallBack' + type]
        }
        // 2. 渲染初始dom结构及样式
        if (callbacks.render) {
            callbacks.render(domId)
        } else if (_renders['render' + type]) {
            _renders['render' + type](domId)
        }
        // 3. 初始化 watch
        if (type <= 6 && type > 0) {
            _initEvent[type](domId, callbacks)
        } else {
            _initEvent['default'](domId, callbacks)
        }
    }

    
    // 图片：(image/*)
    // video：(video/*)
    // 音频：(audio/*)
    // excel：(.xls)或者(.xlsx)或者(.xls,.xlsx)
    // word：(.doc)或者(.docx)或者(.doc,.docx)
    // ppt：(.ppt)或者(.pptx)或者(.ppt,.pptx)
    // pdf：(.pdf)
    // zip：(.zip)
    var upfileobj={
        image:["svg","jpg","jpeg","ico","tiff","bmp","png","webp","gif"],
        video:["mp4","mov","avi","m4v","rmvb"],
        audio:["flac","wma","aac","mp3","wav","m4a","amr"],
        xls:["xls","xlsx","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
        xlsx:["xls","xlsx","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
        ppt:["ppt","pptx","application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation"],
        pptx:["ppt","pptx","application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation"],
        doc:["doc","docx","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        docx:["doc","docx","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        pdf:["pdf","application/pdf"],
        zip:["zip","application/x-zip-compressed"],
    }
    //限制文件类型函数
    function identifyFileType(fileObj,callback) {
        var accept=$("body").find("#"+fileObj.domId).attr("accept");
        var filetype=getfiletype(fileObj);
        var maxsize=accept&&accept.indexOf("video")>-1?500:50;
        if(fileObj.size<=maxsize*1024*1024){
            if(accept){
                if(filetype){
                    var acceptObj=[];
                    for(var key in upfileobj){
                        if(accept.indexOf(key)>-1){
                            acceptObj=acceptObj.concat(upfileobj[key]);
                        }
                    }
                    var islegal=false;
                    for(var i=0;i<acceptObj.length;i++){
                        if(filetype.indexOf(acceptObj[i])>-1){
                            islegal=true;
                        }
                    }
                    if(islegal){
                        callback();
                    }else{
                        alert("选择了非法类型的文件，请重新选择！")
                    }
                }else{
                    alert("无法识别文件类型，请重新选择或者尝试转换格式！")
                }
            }else{
                callback();
            }
        }else{
            alert("上传文件大小超过上限"+maxsize+"M，无法上传！");
            return;
        }
    }
    // 获取文件类型
    function getfiletype(file){
        if(file.type){
            return file.type
        }else{
            //获取最后一个.的位置
            var index= file.name.lastIndexOf(".");
            //获取后缀
            var ext = file.name.substr(index+1);
            //输出结果
            return ext
        } 
    }
    return {
        // identifyFileType:identifyFileType,
        UpladFile: UpladFile,
        importExeclForReturn:importExeclForReturn,
        setCallBack: setCallBack,
        setRender: setRender,
        init: init
    }
})(window)





/**
 * 多文件上传 
 */
var fileid;
function selectFile(e) {
    fileid = $(e).attr("id");
    $('.nowAddFileButtonPosition').removeClass('nowAddFileButtonPosition');
    $(e).addClass('nowAddFileButtonPosition');
    var title = $(e).get(0).files[0].name;
    var searchJson = JSON.stringify({
        fileName: title,
        creator: dataCenter.user.lastName + "(" + dataCenter.user.userId + ")" + dataCenter.user.firstName,
    }).replace(/\"/g, "'");
    //要上传的其他字段
    var jsondata = {
        pathid: sysSet.filefolder.projectmanagementfilefolder.id,
        searchJson: searchJson,
        userName: dataCenter.user.lastName + "(" + dataCenter.user.userId + ")" + dataCenter.user.firstName,
    };
    uploadfiles(fileid, function (data) {
        if (data.result.flag == 1) {
            var nowAddFileButtonElement = $('.nowAddFileButtonPosition:eq(0)')
            var id = data.infos[0].id;
            if (nowAddFileButtonElement.parent().parent().find('span.ahref').length == 0) {
                nowAddFileButtonElement.parent().after('<span class="ahref" style="line-height: 30px;"></div>')
            }
            nowAddFileButtonElement.parent().parent().find('.ahref').append('' +
                '<div style="overflow: hidden;">' +
                '<span class="fa fa-trash-o" style="min-width: 25px;display: block;float: left;margin: 0px;text-align: center;" onclick="delFile(this)"></span>' +
                '<a target="_blank" class="filename" path="' + id + '" title="' + title + '" href="' + sysSet.downloadUrl + id + '">' + title + '</a>' +
                '</div>');
            //添加path到隐藏的input
            var pathsArr = [];
            var titleArr = [];
            nowAddFileButtonElement.parent().parent().find('a').each((function (index, domEle) {
                pathsArr.push($(domEle).attr('path'));
                titleArr.push($(domEle).attr('title'))
            }));
            nowAddFileButtonElement.parent().parent().children('input:eq(0)').val(pathsArr.join(','));
            nowAddFileButtonElement.parent().parent().children('input:eq(1)').val(titleArr.join(','));
            nowAddFileButtonElement.val('');
            $('.nowAddFileButtonPosition').removeClass('nowAddFileButtonPosition');

        }
    }, jsondata)
}
//删除文件
function delFile(e) {
    var fileid = $(e).parent().parent().parent().find('div.fa-upload input').attr('id');
    var nowAddFileButtonElement = $(e).parent().parent().parent().find('div.fa-upload input');
    $(e).parent().remove();
    //添加path到隐藏的input
    var pathsArr = [];
    var titleArr = [];
    nowAddFileButtonElement.parent().parent().find('a').each((function (index, domEle) {
        pathsArr.push($(domEle).attr('path'));
        titleArr.push($(domEle).attr('title'))
    }));
    nowAddFileButtonElement.parent().parent().children('input:eq(0)').val(pathsArr.join(','))
    nowAddFileButtonElement.parent().parent().children('input:eq(1)').val(titleArr.join(','));
}


/**
 * 单文件上传 
 * 示例：<div class=" biaogecenter"><i class="fa fa-upload font-20 c-8BC34A hand relative"><input type="file" onchange="selectFileSingle(this)" name="file" id="fileId" style="width: 0px;height: 0px;position: absolute;padding: 30px 0px 0px 30px;left: -7px;top: -1px;opacity: 0;cursor: pointer;z-index: 999;"></i><input type="hidden" name="auditReport" value=""><span class="ahref" style="line-height: 30px;"></span></div>
 * 回调 fileCallBack(fileid,id)
 * 其他上传参数 jsondata
 */

function selectFileSingle(e) {
    var fileid;
    fileid = $(e).attr("id");
    $('.nowAddFileButtonPosition').removeClass('nowAddFileButtonPosition');
    $(e).addClass('nowAddFileButtonPosition');
    var title = $(e).get(0).files[0].name;//文件名
    var searchJson = JSON.stringify({
        fileName: title,
        creator: dataCenter.user.lastName + "(" + dataCenter.user.userId + ")" + dataCenter.user.firstName,
    }).replace(/\"/g, "'");
    var jsondata = {
        // pathid: sysSet.filefolder.projectmanagementfilefolder.id,
        searchJson: searchJson,
        userName: dataCenter.user.lastName + "(" + dataCenter.user.userId + ")" + dataCenter.user.firstName,
    };
    uploadfiles(fileid, function (data) {
        if (data.result.flag == 1) {

            var nowAddFileButtonElement = $('.nowAddFileButtonPosition:eq(0)')
            var isShow = nowAddFileButtonElement.attr('isShow')
            var id = data.infos[0].id;//文件id

            if (isShow == 0) {

            } else {

                if (nowAddFileButtonElement.parent().parent().parent().find('span.ahref').length == 0) {
                    nowAddFileButtonElement.parent().parent().after('<span class="ahref" style="line-height: 30px;"></div>')
                }
                nowAddFileButtonElement.parent().parent().parent().find('.ahref').html('' +
                    '<div style="overflow: hidden;justify-content: flex-start;align-items: center;">' +
                    '<span class="fa fa-trash-o" style="min-width: 25px;display: block;float: left;margin: 0px;text-align: center;margin-top: 5px;" onclick="delFile(this)"></span>' +
                    '<a target="_blank" class="filename" path="' + id + '" title="' + title + '" href="' + sysSet.downloadUrl + id + '">' + title + '</a>' +
                    '</div>');
                nowAddFileButtonElement.parent().parent().parent().find('.ahref').show();
            }

            nowAddFileButtonElement[0].value = null;
            if (typeof fileCallBack !== 'undefined') {
                fileCallBack(fileid, nowAddFileButtonElement, id);
            }
            // id, title
            nowAddFileButtonElement.parent().parent().children('input:eq(0)').val(id);
            nowAddFileButtonElement.parent().parent().children('input:eq(1)').val(title);
            $('.nowAddFileButtonPosition').removeClass('nowAddFileButtonPosition');
        }
    }, jsondata)
}

//多文件
function selectFileSingleWithCallBack(e) {
    var fileid;
    fileid = $(e).attr("id");
    $('.nowAddFileButtonPosition').removeClass('nowAddFileButtonPosition');
    $(e).addClass('nowAddFileButtonPosition');
    var title = $(e).get(0).files[0].name;//文件名


    uploadfiles(fileid, function (data) {
        if (data.result.flag == 1) {
            var nowAddFileButtonElement = $('.nowAddFileButtonPosition:eq(0)')
            var id = data.infos[0].id;//文件id
            nowAddFileButtonElement[0].value = null;
            if (typeof fileCallBack !== 'undefined') {
                fileCallBack(fileid, nowAddFileButtonElement, id, title);
            }
            $('.nowAddFileButtonPosition').removeClass('nowAddFileButtonPosition');
        }
    })
}

function _addTitle(formId) {
    console.log(formId)
    var seach = '#' + formId + ' input[type!=file]';
    $(seach).each(function (index, docEle) {
        var val = $(this).val()
        if (val) {
            $(this).attr('title', val)
        }
    })

    var seach = '#' + 'mainForm' + ' .input[type!=file]';
    $(seach).each(function (index, docEle) {
        var val = $(this).val()
        if (val) {
            $(this).attr('title', val)
        }
    })
}

//渲染文件内容（文件下载）
function _initfile(formId) {
    var seach = '.fa-download';
    if (formId) {
        seach = '#' + formId + ' .fa-download';
    } else {
        console.log('应该传formId或者listId')
    }
    $(seach).each(function (index, docEle) {
        var href = $(this).find('input:eq(0)').val();
        try {
            var name = $(this).find('input:eq(1)').val().split('\\');
            name = name[name.length - 1]
        } catch (error) {
            var name = $(this).find('input:eq(1)').val()
        }
        if (href) {
            $(this).show().parent().attr('href', sysSet.downloadUrl + href).attr('title', name).show();
        } else {
            $(this).hide()
        }
        // 查看状态不显示
        // 查看按钮显示状态
        var ubutton = $(this).parents('td').find('.fa-upload')
        var visible = ubutton.is(":visible")
        if (ubutton.length > 0 && visible) {
            $(this).hide();
        }

    })


    $('#' + formId + ' .fa-upload').each(function (index, docEle) {
        var id = $(this).parent().find('input:eq(0)').val();
        try {
            var name = $(this).parent().find('input:eq(1)').val().split('\\');
            var name = name[name.length - 1]
        } catch (error) {
            var name = $(this).parent().find('input:eq(1)').val()
        }
        if (id && name) {
            $(this).parent().find('.ahref').html('' +
                '<div style="overflow: hidden;justify-content: flex-start;align-items: center;">' +
                '<span class="fa fa-trash-o" style="min-width: 25px;display: block;float: left;margin: 0px;text-align: center;margin-top: 5px;" onclick="delFile(this)"></span>' +
                '<a target="_blank" class="filename" path="' + id + '" title="' + name + '" href="' + sysSet.downloadUrl + id + '">' + name + '</a>' +
                '</div>');
        } else {
            $(this).parent().find('.ahref').hide();
        }
    })

    // 处理图片
    $('#' + formId + ' .fa-play-circle').each(function (index, docEle) {
        var fileId = $(this).parent().find('input[name=componentPic]').val();
        console.log(fileId)
        if (!fileId) {
            $(this).hide();
        } else {
            $(this).show();
        }
    })
}