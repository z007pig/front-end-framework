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

    const dialog = document.getElementById(formId);
    if (!dialog) return;

    const saveButton = dialog.querySelector(".saveButton");
    const closeButton = dialog.querySelector(".closeButton");

    const saveHandler = () => {
        checkDialogForm(formId, function () {
            dataCenter['form'][formId].setOutInput(formId, output);
            callback();
            dialog.remove();
            // 恢复备份
            recoveryInputState(formId);
            // 启用底层的body滚动
            document.body.style.height = 'unset';
            document.body.style['overflow-y'] = 'auto';
        });
    };

    const closeHandler = () => {
        dialog.remove();
        // 恢复备份
        recoveryInputState(formId);
        // 启用底层的body滚动
        document.body.style.height = 'unset';
        document.body.style['overflow-y'] = 'auto';
    };

    saveButton.addEventListener("click", saveHandler);
    closeButton.addEventListener("click", closeHandler);
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

    const dialog = document.getElementById(formId);
    if (!dialog) return;

    const saveButton = dialog.querySelector(".saveButton");
    const closeButton = dialog.querySelector(".closeButton");

    const saveHandler = () => {
        checkDialogForm(formId, function () {
            let jsons = JSON.parse(inputObj.value != null ? inputObj.value : '[]');
            const formJson = dataCenter['form'][formId]['down']['formNewInfo'];
            if (isEmpty(formJson.id)) {
                formJson['id'] = uuid();
            }
            updateJsonArrayById(jsons, formJson);
            inputObj.value = JSON.stringify(jsons);
            callback(formId);
            dialog.remove();
        });
    };

    const closeHandler = () => {
        dialog.remove();
    };

    saveButton.addEventListener("click", saveHandler);
    closeButton.addEventListener("click", closeHandler);
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

    const dialog = document.getElementById(formId);
    if (!dialog) return;

    const saveButton = dialog.querySelector(".saveButton");
    const closeButton = dialog.querySelector(".closeButton");

    const saveHandler = () => {
        checkDialogForm(formId, function () {
            let jsons = JSON.parse(inputObj.value != null ? inputObj.value : '[]');
            const formJson = dataCenter['form'][formId]['down']['formNewInfo'];
            if (isEmpty(formJson.id)) {
                formJson['id'] = uuid();
            }
            updateJsonArrayById(jsons, formJson);
            inputObj.value = JSON.stringify(jsons);
            callback(formId);
            dialog.remove();
        });
    };

    const closeHandler = () => {
        dialog.remove();
    };

    saveButton.addEventListener("click", saveHandler);
    closeButton.addEventListener("click", closeHandler);
}

//给dialog 附上id
function initCloneTemplateDialog(temName, dialogId) {
    const templateHtml = template[temName];
    const div = document.createElement('div');
    div.innerHTML = templateHtml.trim();
    const dialogElement = div.firstChild;
    dialogElement.id = dialogId;
    return dialogElement;
}

function showDialog(dialogId, temName, flag) {
    const existingDialog = document.getElementById(dialogId);
    if (existingDialog) {
        existingDialog.remove();
    }

    const newDialog = initCloneTemplateDialog(temName, dialogId);
    document.body.appendChild(newDialog);

    if (!flag) {
        initPagePlugIn(newDialog);
    }
    switchLanguage(newDialog);

    newDialog.style.display = 'block';
}

/** 
 * 类似alert弹出框
 * 有标题、内容、确定回调函数
 * @param {*} title 
 * @param {*} content 
 * @param {*} okCallback 
 */
function alertWarnDialog(title, content, okCallback) {
    const dialogId = 'alertWarnDialogId';
    showDialog(dialogId, 'alertWarnDialog', true);
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;

    dialog.querySelector(".alertTitle").innerHTML = title;
    dialog.querySelector(".alertItemContent").innerHTML = content;

    const sureButton = dialog.querySelector(".alertSure");
    sureButton.addEventListener('click', () => {
        if (okCallback && typeof okCallback === 'function') {
            okCallback();
        }
        dialog.remove();
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
    const dialogId = 'confirmDialogId';
    showDialog(dialogId, 'confirmDialog');
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;

    dialog.querySelector(".confirmTitle").innerHTML = title;
    dialog.querySelector(".confirmContent").innerHTML = content;

    const sureButton = dialog.querySelector(".confirmSure");
    sureButton.addEventListener('click', () => {
        if (okCallback && typeof okCallback === 'function') {
            okCallback();
        }
        dialog.remove();
    });

    const cancelButton = dialog.querySelector(".confirmCancel");
    cancelButton.addEventListener('click', () => {
        if (cancelCallback && typeof cancelCallback === 'function') {
            cancelCallback();
        }
        dialog.remove();
    });
}

//操作提示--没有确认按钮，延迟一秒弹框消失
function alertDialogHide(title, content, element, time, callback) {
    const dialogId = 'alertForOneSecondHide';
    showDialog(dialogId, "alertForOneSecondHideTemp");
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;

    dialog.querySelector('.alertTitle').textContent = title;
    dialog.querySelector('.alertItemContent').textContent = content;

    setTimeout(() => {
        dialog.remove();
        if (callback && typeof callback === 'function') {
            callback(element);
        }
    }, time);
}

//   弹窗隐藏
function modalHideAlert(classid) {
    const modals = isNotEmpty(classid) ? document.querySelectorAll("." + classid) : document.querySelectorAll(".zj-modal");
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    scrollMove();
}

// 禁止滚动
function scrollStop() {
    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventDefault, { passive: false });
}

// 取消滑动限制
function scrollMove() {
    document.body.style.overflow = "";
    document.removeEventListener("touchmove", preventDefault, { passive: false });
}

function preventDefault(e) {
    e.preventDefault();
}