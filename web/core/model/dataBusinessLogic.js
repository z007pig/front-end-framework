//***************************************************************************************//
//*************************************对外公开*************************************//
//***************************************************************************************//

/**
 * 主接口ajax
 * @param {String} url 接口名
 * @param {Object} params 接口参数 
 * @param {Function} callback 接口成功的回调方法
 * @param {Function} err 接口失败的回调方法
 */
function zjxxAjax(url, params, callback, err) {
    var zjxxAjaxUrl = sysSet.dataUrl + url;
    dataLinkPostJson(zjxxAjaxUrl, params, callback, err);
}

  /**
 * 新增修改主接口ajax
 * @param {Object} params 接口参数 
 * @param {Function} callback 接口成功的回调方法
 * @param {Function} err 接口失败的回调方法
 */
  function zjxxAjaxAddOrUpdate(params, callback, err) {
    zjxxAjax("addOrUpdate", params, callback, err)
    }

  /**
 * 详情主接口ajax
 * @param {Object} params 接口参数 
 * @param {Function} callback 接口成功的回调方法
 * @param {Function} err 接口失败的回调方法
 */
 function zjxxAjaxDetail(params, callback, err) {
	zjxxAjax("detail", params, callback, err)
  }

/**
 * 删除主接口ajax
 * @param {Object} params 接口参数 
 * @param {Function} callback 接口成功的回调方法
 * @param {Function} err 接口失败的回调方法
 */
 function zjxxAjaxDelete(params, callback, err) {
	  zjxxAjax("delete", params, callback, err)
  }

/**
 * 列表主接口ajax
 * @param {Object} params 接口参数 
 * @param {Function} callback 接口成功的回调方法
 * @param {Function} err 接口失败的回调方法
 */
function zjxxAjaxList(params, callback, err) {
  zjxxAjax("list", params, callback, err)
} 
  
/**
 * 导出主接口ajax
 * @param {Object} params 接口参数 
 * @param {Function} callback 接口成功的回调方法
 * @param {Function} err 接口失败的回调方法
 */
function zjxxAjaxExport(params, callback, err) {
  zjxxAjax("export", params, callback, err)
} 
  
/**
 * 导入主接口ajax
 * @param {Object} params 接口参数 
 * @param {Function} callback 接口成功的回调方法
 * @param {Function} err 接口失败的回调方法
 */
function zjxxAjaxImport(params, callback, err) {
  zjxxAjax("import", params, callback, err)
} 
 
/**
* 批量处理主接口ajax
* @param {Object} params 接口参数 
* @param {Function} callback 接口成功的回调方法
* @param {Function} err 接口失败的回调方法
*/
function zjxxAjaxBatch(params, callback, err) {
 zjxxAjax("batch", params, callback, err)
} 
  
/**
* run主接口ajax
* @param {Object} params 接口参数 
* @param {Function} callback 接口成功的回调方法
* @param {Function} err 接口失败的回调方法
*/
function zjxxAjaxRun(params, callback, err) {
  zjxxAjax("run", params, callback, err)
 } 
  

  
/**
 * 下载报表 接口 fileid 文件id, fileName 自定义文件名称
 * @param {String} fileid
 * @param {String} fileTempId
 */
//FIXME:form提交无法设置hearder 

// function DownLoadFile(fileid, fileName) {
//   data = data.replace("'", "&#39");
//   data = data.replace("\"", "&quot;");
//   data = data.replace("\n", "<br/>");
//   var data = {
//     "infoClass": {
//       "classId": "file"
//       },
//     "info": {
//       "type": "info",
//       "id":fileid
//       },
//     "promise": {
//       "promise": "downloadFile"
//       }
//   };

//   if(isNotEmpty(fileName)){
//     data.info.info={"title": fileName};
//   }
//   var url = sysSet.dataUrl + 'run';
//   var options = {
//   'url': url,
//   'data': data
//   };
//   var config = $.extend(true, {
//   method: 'post'
//   }, options);
//   var $iframe = $('<iframe id="down-file-iframe" />');
//   var $form = $('<form target="down-file-iframe" accept-charset="UTF-8" method="' + config.method + '" />');
//   $form.attr('action', config.url);
//   for (var key in config.data) {
//   $form.append("<input type='hidden' name='" + key + "' value='" + config.data[key] + "' />");
//   }
//   $iframe.append($form);
//   $(document.body).append($iframe);
//   $form[0].submit();
//   $iframe.remove();
// }

/**
 * 下载文件 fileid 文件id, fileName 自定义文件名称
 * @param {String} fileid
 * @param {String} fileName
 */
function downLoadFile(fileid, fileName) {
    loadFile(fileid, fileName) ;
};


/**
 * 下载接口主方法 fileid 文件id, fileName 自定义文件名称
 * @param {String} fileid
 * @param {String} fileTempId
 */
function loadFile(fileid, fileName, callback ,type ,dom) {
  let formData = new FormData();
  formData.append("infoClass", JSON.stringify({ id: sysSet.classid.file }));
  formData.append("promise", JSON.stringify({ functionName: "downloadFile" }));
  formData.append("info", JSON.stringify({ type: "info", id: fileid, info: {id: fileid} }));
  var url = sysSet.dataUrl + 'run'; //接口
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.responseType = "blob";  // 返回类型blob
  // xhr.setRequestHeader("token", localStorage.getItem('token')); //token
  xhr.setRequestHeader("token", "visitor"); //token

  //xhr.setRequestHeader("Content-type", "application/json;charset=utf-8"); //这个看后端接口情况决定要不要写   formData对象默认指定ContentType此处不在指定
  xhr.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01"); //这个看后端接口情况决定要不要写
  // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
  xhr.onload = function () {
    // 请求完成
    if (this.status === 200) {
      // 返回200
      // var blob = new Blob([this.response]);
      var reader = new FileReader();
        if(type=="readerTXT"){
            reader.readAsText(this.response,"UTF-8");
            reader.onload = function (e) {
                if(typeof callback == "function"){
                    callback(e.target.result)
                }
            }
        }else{   
            let name = this.getResponseHeader('Content-Disposition').split('=')[1];
            reader.readAsDataURL(this.response);  // 转换为base64，可以直接放入a表情href
            reader.onload = function (e) {    
                if (type == 'show') {
                    $(dom).attr({ "src":  e.target.result});
                } 
                else {
                    // 转换完成，创建一个a标签用于下载
                    var a = document.createElement('a');
                    a.download = isNotEmpty(fileName) ? fileName + '.' + name.split('.')[1] : decodeURIComponent(name);
                    a.href = e.target.result;
                    $("body").append(a);  // 修复firefox中无法触发click
                    a.click();
                    $(a).remove();
                }
            }
        }
 
    }
  };
  // 发送ajax请求
  xhr.send(formData);
}


/**
 * 批量下载文件 info文件id集合
 * @param {String} info
 */
function batchDownLoadFile(info) {
  batchLoadFile(info) ;
};


/**
* 批量下载文件 info文件id集合
* @param {String} fileid
*/
function batchLoadFile(info, callback,type) {
let formData = new FormData();
formData.append("infoClass", JSON.stringify({ id: sysSet.classid.file }));
formData.append("promise", JSON.stringify({ functionName: "batchFileDownload" }));
formData.append("info", JSON.stringify(info));
var url = sysSet.dataUrl + 'run'; //接口
var xhr = new XMLHttpRequest();
xhr.open('POST', url, true);
xhr.responseType = "blob";  // 返回类型blob
xhr.setRequestHeader("token", localStorage.getItem('token')); //token
//xhr.setRequestHeader("Content-type", "application/json;charset=utf-8"); //这个看后端接口情况决定要不要写   formData对象默认指定ContentType此处不在指定
xhr.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01"); //这个看后端接口情况决定要不要写
// 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
xhr.onload = function () {
  // 请求完成
  if (this.status === 200) {
    // 返回200
    // var blob = new Blob([this.response]);
    var reader = new FileReader();
      if(type=="readerTXT"){
          reader.readAsText(this.response,"UTF-8");
          reader.onload = function (e) {
              if(typeof callback == "function"){
                  callback(e.target.result)
              }
          }
      }else{   
          let name = this.getResponseHeader('Content-Disposition').split('=')[1];
          reader.readAsDataURL(this.response);  // 转换为base64，可以直接放入a表情href
          reader.onload = function (e) {    
              if (type == 'show') {
                  $(dom).attr({ "src":  e.target.result});
              } 
              else {
                  // 转换完成，创建一个a标签用于下载
                  var a = document.createElement('a');
                  a.download = isNotEmpty(name) ? name : decodeURIComponent(name);
                  a.href = e.target.result;
                  $("body").append(a);  // 修复firefox中无法触发click
                  a.click();
                  $(a).remove();
              }
          }
      }

  }
};
// 发送ajax请求
xhr.send(formData);
}




/**
 * 获取文件本体接口主方法
 * @param {String} fileid  文件id
 * @param {String} fileName  自定义文件名称
 */
function zjxxAjaxGetFile(fileid, fileName, callback) {
  let formData = new FormData();
  formData.append("infoClass", JSON.stringify({ id: sysSet.classid.file }));
  formData.append("promise", JSON.stringify({ functionName: "downloadFile" }));
  formData.append("info", JSON.stringify({ type: "info", id: fileid, info: {title: fileName} }));
  var url = sysSet.dataUrl + 'run'; //接口
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.responseType = "blob";  // 返回类型blob
  xhr.setRequestHeader("token", localStorage.getItem('token')); //token
  //xhr.setRequestHeader("Content-type", "application/json;charset=utf-8"); //这个看后端接口情况决定要不要写   formData对象默认指定ContentType此处不在指定
  xhr.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01"); //这个看后端接口情况决定要不要写
  // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
  xhr.onload = function () {
    // 请求完成
    if (this.status === 200) {
      // 返回200
      callback(this)
    }
  };
  // 发送ajax请求
  xhr.send(formData);
}

/**
 * 读取下载文件内容
 * @param {String} fileid  文件id
 * @param {String} fileName  自定义文件名称
 */
function readLoadFile(fileid, fileName, callback) {
  zjxxAjaxGetFile(fileid, fileName, function (result) {
      var reader = new FileReader();
      reader.readAsText(result.response,"UTF-8");
      reader.onload = function (e) {
          if(typeof callback == "function"){
              callback(e.target.result)
          }
      }
    })
}

/**
 * 直接下载文件到浏览器
 * @param {String} fileid  文件id
 * @param {String} fileName  自定义文件名称
 */
function downloadFile(fileid, fileName, callback) {
  zjxxDownloadFile(fileid, fileName, function (result) {
    var reader = new FileReader();
    let name = this.getResponseHeader('Content-Disposition').split('=')[1];
    reader.readAsDataURL(this.response);  // 转换为base64，可以直接放入a表情href
    reader.onload = function (e) {   
      // 转换完成，创建一个a标签用于下载
      var a = document.createElement('a');
      a.download = isNotEmpty(name) ? name : decodeURIComponent(name);
      a.href = e.target.result;
      $("body").append(a);  // 修复firefox中无法触发click
      a.click();
      $(a).remove();
    }
  })
}