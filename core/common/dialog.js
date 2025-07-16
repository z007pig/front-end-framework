/*!
 * 弹出框核心代码
 */

/** 
 * 1、显示dialog 针对的是Form 
 * 2、根据dataCenter['form'][formId]['down']['formNewInfo']初始化dialog中的input。
 * 3、当点击保存按钮时，dataCenter['form'][formId].setOutInput或者“回调函数”中完成后续任务!
 * 4、callback 当点击保存按钮的回调方法
 * @param {*} formId 
 * @param {*} temName 
 * @param {*} output 
 * @param {*} callback 
 */
function showFormDialog(formId, temName, output, callback) {
    //页面添加dialog的DOM
    showDialog(formId, temName);
    //初始化Form
    initFormPage(formId);
    //渲染Form
    renderForm(formId);
    // 禁止底层的body滚动
    document.body.style.height = '100vh';
    document.body.style['overflow-y'] = 'hidden';
    //绑定提交方法
    $("#" + formId).on("click", ".saveButton", function () {
        checkDialogForm(formId, function () {
            dataCenter['form'][formId].setOutInput(formId, output);
            callback();
            $("#" + formId).remove();
            // 恢复备份
            recoveryInputState(formId);
            // 启用底层的body滚动
            document.body.style.height = 'unset';
            document.body.style['overflow-y'] = 'auto';
        });
    });
    //绑定关闭方法
    $("#" + formId).on("click", ".closeButton", function () {
        $("#" + formId).remove();
        // 恢复备份
        recoveryInputState(formId);
        // 启用底层的body滚动
        document.body.style.height = 'unset';
        document.body.style['overflow-y'] = 'auto';
    });
}


/**
 * 1、显示dialog 
 * 2、根据dataCenter['form'][formId]['down']['formNewInfo']初始化dialog中的input。
 * 3、当点击保存按钮时，收集dialog数据，并与数组数据合并绑定在页面上input上面!
 * @param {*} formId 
 * @param {*} temName 
 * @param {*} inputObj 
 * @param {*} callback 
 */
function showFormDialogToList(formId, temName, inputObj, callback) {
    showDialog(formId, temName);
    initFormPage(formId);
    renderForm(formId);
    $("#" + formId).on("click", ".saveButton", function () {
        checkDialogForm(formId, function () {
            var jsons = JSON.parse($(inputObj).val() != null ? $(inputObj).val() : '[]');
            var formJson = dataCenter['form'][formId]['down']['formNewInfo'];
            if (isEmpty(formJson.id)) {
                formJson['id'] = uuid();
            }
            updateJsonArrayById(jsons, formJson);
            $(inputObj).val(JSON.stringify(jsons));
            callback(formId);
            $("#" + formId).remove();
        });
    });
    $("#" + formId).on("click", ".closeButton", function () {
        $("#" + formId).remove();
    });
}

/**
 * 1、显示dialog 
 * 2、根据服务器数据来初始化dialog中的input。
 * 3、当点击保存按钮时，收集dialog数据，并与数组数据合并绑定在页面上input上面!
 * @param {*} formId 
 * @param {*} temName 
 * @param {*} inputObj 
 * @param {*} callback 
 */
function initAjaxFormDialog(formId, temName, inputObj, callback) {
    showDialog(formId, temName);
    initFormPage(formId);
    getAllFormBlockData(formId);
    $("#" + formId).on("click", ".saveButton", function () {
        checkDialogForm(formId, function () {
            var jsons = JSON.parse($(inputObj).val() != null ? $(inputObj).val() : '[]');
            var formJson = dataCenter['form'][formId]['down']['formNewInfo'];
            if (isEmpty(formJson.id)) {
                formJson['id'] = uuid();
            }
            updateJsonArrayById(jsons, formJson);
            $(inputObj).val(JSON.stringify(jsons));
            callback(formId);
            $("#" + formId).remove();
        });
    });
    $("#" + formId).on("click", ".closeButton", function () {
        $("#" + formId).remove();
    });
}

//给dialog 附上id
function initCloneTemplateDialog(temName, dialogId) {
    var tem = template[temName];
    $(tem).attr('id', dialogId);
    return $(tem);
}

// flag:如果为true，就不需要默认初始化插件
// 原因:默认有富文本，就会生成编辑器，然后调用该弹窗，弹窗中没有富文本，
// 就会导致页面中其他弹窗的编辑器重复，因为不是所有的弹窗都用了这个方法（页面默认的弹窗有富文本的情况）
// 或者每次生成前默认销毁编辑器
function showDialog(dialogId, temName, flag) {
    $("#" + dialogId).remove();
    $("body").append(initCloneTemplateDialog(temName, dialogId));
    //先显示再初始化，否则富文本初始化报错
    //初始化插件
    if (!flag) {
        initPagePlugIn($("#" + dialogId)[0])
    }
    //语言切换
    switchLanguage($("#" + dialogId)[0])

    $("#" + dialogId).show();

}
/** 
 * 类似alert弹出框
 * 有标题、内容、确定回调函数
 * @param {*} title 
 * @param {*} content 
 * @param {*} okCallback 
 * @param {*} cancelCallback 
 */
function alertWarnDialog(title, content, okCallback) {
    var dialogId = 'alertWarnDialogId';
    showDialog(dialogId, 'alertWarnDialog', true);
    $("#" + dialogId + " .alertTitle").html(title);
    $("#" + dialogId + " .alertItemContent").html(content);
    $("#" + dialogId + " .alertSure").click(function () {
        if (okCallback != null || typeof (okCallback) == 'function') {
            okCallback();
        }
        $("#" + dialogId).remove();
    });
}

/**
 * 二次确认弹出框，有标题、内容、确定回调函数、取消回调函数
 * @param {*} title
 * @param {*} content
 * @param {*} okCallback
 * @param {*} cancelCallback
 */

function confirmDialog(title, content, okCallback, cancelCallback) {
    var dialogId = 'confirmDialogId';
    showDialog(dialogId, 'confirmDialog');
    $("#" + dialogId + " .confirmTitle").html(title);
    $("#" + dialogId + " .confirmContent").html(content);
    $("#" + dialogId + " .confirmSure").click(function () {
        if (okCallback != null || typeof (okCallback) == 'function') {
            okCallback();
        }
        $("#" + dialogId).remove();
    });
    $("#" + dialogId + " .confirmCancel").click(function () {
        if (cancelCallback != null || typeof (cancelCallback) == 'function') {
            cancelCallback();
        }
        $("#" + dialogId).remove();
    });
}

//操作提示--没有确认按钮，延迟一秒弹框消失
function alertDialogHide(title, content, element, time, callback) {
    var dialogId = 'alertForOneSecondHide';
    showDialog(dialogId, "alertForOneSecondHideTemp");
    $('#' + dialogId + ' .alertTitle').text(title);
    $('#' + dialogId + ' .alertItemContent').text(content);
    setTimeout(function () {
        $("#" + dialogId).remove();
        callback(element);
    }, time);

}


//   弹窗隐藏
function modalHideAlert(classid) {
    if (isNotEmpty(classid)) {
        $("." + classid).hide();
    } else {
        $(".zj-modal").hide();
    }
    scrollMove();
}

// 禁止滚动
function scrollStop() {
    let mo = function (e) {
        e.preventDefault();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", mo, false); //禁止页面滑动
}

// 取消滑动限制
function scrollMove() {
    let mo = function (e) {
        e.preventDefault();
    };
    document.body.style.overflow = ""; //出现滚动条
    document.removeEventListener("touchmove", mo, false);
}


