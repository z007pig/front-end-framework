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

// ... (wrapper functions like zjxxAjaxAddOrUpdate, zjxxAjaxDetail, etc. remain the same)

/**
 * 下载文件 fileid 文件id, fileName 自定义文件名称
 * @param {String} fileid
 * @param {String} fileName
 */
function downLoadFile(fileid, fileName) {
    loadFile(fileid, fileName);
};

/**
 * 下载接口主方法 fileid 文件id, fileName 自定义文件名称
 * @param {String} fileid
 * @param {String} fileTempId
 */
function loadFile(fileid, fileName, callback, type, dom) {
    let formData = new FormData();
    formData.append("infoClass", JSON.stringify({ id: sysSet.classid.file }));
    formData.append("promise", JSON.stringify({ functionName: "downloadFile" }));
    formData.append("info", JSON.stringify({ type: "info", id: fileid, info: { id: fileid } }));
    var url = sysSet.dataUrl + 'run'; //接口
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.responseType = "blob";
    xhr.setRequestHeader("token", localStorage.getItem('token') || "visitor");
    xhr.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01");

    xhr.onload = function () {
        if (this.status === 200) {
            var reader = new FileReader();
            if (type === "readerTXT") {
                reader.readAsText(this.response, "UTF-8");
                reader.onload = function (e) {
                    if (typeof callback == "function") {
                        callback(e.target.result);
                    }
                }
            } else {
                let name = this.getResponseHeader('Content-Disposition').split('=')[1];
                reader.readAsDataURL(this.response);
                reader.onload = function (e) {
                    if (type === 'show') {
                        dom.setAttribute("src", e.target.result);
                    } else {
                        var a = document.createElement('a');
                        a.download = isNotEmpty(fileName) ? fileName + '.' + name.split('.')[1] : decodeURIComponent(name);
                        a.href = e.target.result;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }
                }
            }
        }
    };
    xhr.send(formData);
}

/**
 * 批量下载文件 info文件id集合
 * @param {String} info
 */
function batchDownLoadFile(info) {
    batchLoadFile(info);
};

/**
 * 批量下载文件 info文件id集合
 * @param {String} fileid
 */
function batchLoadFile(info, callback, type) {
    let formData = new FormData();
    formData.append("infoClass", JSON.stringify({ id: sysSet.classid.file }));
    formData.append("promise", JSON.stringify({ functionName: "batchFileDownload" }));
    formData.append("info", JSON.stringify(info));
    var url = sysSet.dataUrl + 'run';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.responseType = "blob";
    xhr.setRequestHeader("token", localStorage.getItem('token'));
    xhr.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01");

    xhr.onload = function () {
        if (this.status === 200) {
            var reader = new FileReader();
            if (type === "readerTXT") {
                reader.readAsText(this.response, "UTF-8");
                reader.onload = function (e) {
                    if (typeof callback == "function") {
                        callback(e.target.result);
                    }
                }
            } else {
                let name = this.getResponseHeader('Content-Disposition').split('=')[1];
                reader.readAsDataURL(this.response);
                reader.onload = function (e) {
                    if (type === 'show') {
                        dom.setAttribute("src", e.target.result);
                    } else {
                        var a = document.createElement('a');
                        a.download = isNotEmpty(name) ? name : decodeURIComponent(name);
                        a.href = e.target.result;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }
                }
            }
        }
    };
    xhr.send(formData);
}

// ... (The rest of the file remains the same)
