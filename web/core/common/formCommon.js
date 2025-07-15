/**
 * 注释方法说明
 * @method 方法名（全局方法不写此项）
 * @for 所属类名（全局方法不写此项）
 * @param{参数类型}参数名 参数说明
 * @return {返回值类型} 返回值说明（没有返回值不写此项）
 **参数类型说明
 * 1.Array/array：数组；2.String/string：字符串；3.Number/number：数组；
 * 4.Object/object对象；5.function/Function/Fun：函数；6.bool：布尔；7.直接表示结果，如[{id：111，classId：222}]
 */

/**
 * 根据配置获取详情数据+渲染表单
 * @param {String} formId 
 */
async function getAllFormBlockData (formId) {
    //判断是否有必须执行的前置函数--promise
    let functionMap = dataCenter.form[formId]["pre_function"];
    if (functionMap) {
        for (const funcName of functionMap) {
            // 确保 funcName 是一个非空字符串
            if (typeof funcName === 'string' && funcName.trim() !== '') {
                // 假设所有函数都在全局作用域中定义
                const func = window[funcName];
                // 检查属性是否是函数
                if (typeof func === 'function') {
                    await func();
                } else {
                    console.warn(`Function ${funcName} is not defined.`);
                }
            }
        }
    }

    // 接口参数
    var parmas = {};
    parmas.infoClass = {
        id : dataCenter.form[formId]['classid'],
        isNeedTemp : dataCenter.form[formId]['isNeedTemp']
    }
    
    let  type = dataCenter.form[formId]['state']?dataCenter.form[formId]['state']:"info";
    if(type == "task" || type == "startProcess"){
        type = "info";
    }
    parmas.info = { 
        id: dataCenter.form[formId]['infoId'],
        type:type,
        fileds:dataCenter.form[formId]['fileds'],
    };
    if (isNotEmpty(dataCenter.form[formId]['draftInfoId'])) {
        parmas.info = { id: dataCenter.form[formId]['draftInfoId'] };
        parmas.infoClass.id = "draft";
    }
    
    parmas.info = JSON.stringify(parmas.info);
    parmas.infoClass = JSON.stringify(parmas.infoClass);
    if (isNotEmpty(parmas["promise"])) {
        parmas.promise = JSON.stringify(parmas.promise);
    }
    if (isNotEmpty(dataCenter.form[formId]['draftInfoId']) || isNotEmpty(dataCenter.form[formId]['infoId'])) {
        zjxxAjaxDetail(parmas, function (data) {
            if (data.infos.length > 0) {
                //判断是否需要替换页面模版
                if(dataCenter.form[formId]['isNeedTemp']){
                   if (isNotEmpty(data["infoClass"]) && isNotEmpty(data["infoClass"]["temp"])) {
                     $("#"+formId).html(data["infoClass"]["temp"]);
                   }
                }
                //存储原始数据
                dataCenter.form[formId].down.info = data.infos[0];
                //如果是草稿，转换数据
                if (isNotEmpty(dataCenter.form[formId]['draftInfoId'])) {
                    var formInfo = jsonClone(data.infos[0].infojson);
                    formInfo.draftInfo = jsonClone(data.infos[0]);
                    data.infos[0] = formInfo;
                    data.infos[0] = JSON.parse(data.infos[0])
                }
                //根据配置将转码数据转回正常原始数据
                dataCenter['form'][formId]['decode'].forEach(function (name) {
                    if (data.infos[0].hasOwnProperty(name)) {
                        data.infos[0][name] = escape2Html(data.infos[0][name]);
                    }
                });
                // 储存数据
                dataCenter.form[formId].down.formInfo = data.infos[0];
                dataCenter.form[formId].down.formNewInfo = data.infos[0];
                // 渲染前钩子
                // var htmlBeforeInit =$("#"+formId).attr("beforeInit");
                // eval(htmlBeforeInit);

                // var beforeInit = "typeof beforeInit" + firstCase(formId) + " != 'undefined' && beforeInit" + firstCase(formId) + "(dataCenter.form[formId].down.formInfo);";
				// eval(beforeInit);

                dcEvent(formId, "beforeInit", "form", dataCenter.form[formId].down.formInfo)

                // 渲染表单
                renderForm(formId);
            }
            // 渲染后钩子
            //var htmlAfterInit = $("#"+formId).attr("afterInit");
            // eval(htmlAfterInit);

            // var afterInit = "typeof afterInit" + firstCase(formId) + " != 'undefined' && afterInit" + firstCase(formId) + "(dataCenter.form[formId].down.formInfo)";
			// eval(afterInit);

            dcEvent(formId, "afterInit", "form", dataCenter.form[formId].down.formInfo);
        }, function () {
            var err = "typeof err" + firstCase(formId) + " != 'undefined' && err" + firstCase(formId) + "();";
            eval(err);
        })
    } 
    else {
        dataCenter.form[formId].down.formInfo = {};
        dataCenter.form[formId].down.formNewInfo = {};
        // var htmlBeforeInit =$("#"+formId).attr("beforeInit");
        // eval(htmlBeforeInit);
        // var beforeInit = "typeof beforeInit" + firstCase(formId) + " != 'undefined' && beforeInit" + firstCase(formId) + "(dataCenter.form[formId].down.formInfo);";
		// eval(beforeInit);

        dcEvent(formId, "beforeInit", "form", dataCenter.form[formId].down.formInfo)
        // renderForm(formId);
        // var htmlAfterInit =  $("#"+formId).attr("afterInit");
        // eval(htmlAfterInit);
        // var afterInit = "typeof afterInit" + firstCase(formId) + " != 'undefined' && afterInit" + firstCase(formId) + "(dataCenter.form[formId].down.formInfo)";
		// eval(afterInit);

        dcEvent(formId, "afterInit", "form", dataCenter.form[formId].down.formInfo)

    }
}

/**
 * 根据前端数据来渲染From表单
 * @param {String} formId 
 * @param {Object} data 表单数据
 */
function renderFormByData(formId, data) {
	// 数据储存
	dataCenter.form[formId].infoId = data.id;
	dataCenter.form[formId].down.formInfo = data;
	dataCenter.form[formId].down.formNewInfo = data;
	// 渲染前钩子
	// var htmlBeforeInit =$("#"+formId).attr("beforeInit");
    // eval(htmlBeforeInit);
    // var beforeInit = "typeof beforeInit" + firstCase(formId) + " != 'undefined' && beforeInit" + firstCase(formId) + "(dataCenter.form[formId].down.formInfo);";
    // eval(beforeInit);

    dcEvent(formId, "beforeInit", "form", dataCenter.form[formId].down.formInfo)
	// 渲染
	renderForm(formId);
	// 渲染后钩子
	// var htmlAfterInit =  $("#"+formId).attr("afterInit");
	// eval(htmlAfterInit);

    // var afterInit = "typeof afterInit" + firstCase(formId) + " != 'undefined' && afterInit" + firstCase(formId) + "(dataCenter.form[formId].down.formInfo)";
    // eval(afterInit);
    dcEvent(formId, "afterInit", "form", dataCenter.form[formId].down.formInfo)
}


/**
 * 整合submit参数,返回接口参数
 * @param {String} formId 
 * @param {Function} callback
 */
function getFormParmas (formId) {
    // 接口参数
    var parmas = {};
    parmas.infoClass = {
        id : dataCenter.form[formId]['classid'],
    }
    parmas.infoClass = JSON.stringify(parmas.infoClass);
    parmas.info ={ 
        id: dataCenter.form[formId]['infoId'],
        type:dataCenter.form[formId]['state']?dataCenter.form[formId]['state']:"info",
        info :dataCenter.form[formId]['down']['formNewInfo'],
    };
    parmas.promise = JSON.stringify({
        "projectorg": dataCenter.form[formId].projectorg,
        "isAwaitPostPosition" : dataCenter.form[formId]['isAwaitPostPosition']
    });
    //启动流程
    if(parmas.info.type=="startProcess"){
        parmas.info.workflow = getStartProcessParmas(formId);
    };
    //任务提交
    if(parmas.info.type=="task"){
        parmas.info.workflow = getTaskParmas(formId,"submit");
    };
    parmas.info = JSON.stringify(parmas.info);
    return parmas;
}

/**
 * 整合启动流程参数
 * @param {String} formId 
 */
function getStartProcessParmas(formId) {
    var parmas = {};
	//获取form参数
	var formInfo = serializeForm(formId);
	//将哪些信息中的字段存到任务表的description中
	var taskField =  dataCenter.form[formId].workFlow["taskField"];
	var taskDescInfo = {};
	if(isNotEmpty(taskField)&&taskField.length>0){
		for (let index = 0; index < taskField.length; index++) {
			const element = taskField[index];
			taskDescInfo[element] = formInfo[element];
		}
	}
    //节点额外信息
    var nodeInfo = formInfo["zj_nodeInfo"]?formInfo["zj_nodeInfo"]:"";
	parmas={
		"moudleid": dataCenter.form[formId].workFlow.processkey,
		"infojson":taskDescInfo,
        "nodeInfo":nodeInfo,
        "createType":dataCenter.form[formId].workFlow.createType,
        "projectcn":formInfo["projectcn"]?formInfo["projectcn"]:"",
        "projecten":formInfo["projecten"]?formInfo["projecten"]:""
	};
	return parmas;
}


/**
 * 整合任务提交参数,返回接口参数
 * @param {String} formId 
 * @param {String} taskType 操作类型
 */
function getTaskParmas(formId, taskType) {
    var parmas = {};
	//获取form参数
	var formInfo = serializeForm(formId);
    //获取流转线
	let taskMsgtype = formInfo["taskMsgtype"];
	//获取form的workFlow设置
	var formWorkFlowInfo = dataCenter.form[formId].workFlow;
	//获取msgtype
	var msgtype = "";
    if(isNotEmpty(taskMsgtype)){
        try {
            msgtype = formWorkFlowInfo.msgtype[dataCenter.pageNode][dataCenter.fromNode][taskMsgtype];
        } catch (error) {
            msgtype = "";
        }
    }
	//下个任务处理人
	var assignee = formInfo["assigneeId"];
	//审批意见
	var approvalopinions = formInfo["approvalopinions"];
	//将哪些信息中的字段存到任务表的description中
	var taskField =  dataCenter.form[formId].workFlow["taskField"];
	var taskDescInfo = {};
	if(isNotEmpty(taskField)&&taskField.length>0){
		for (let index = 0; index < taskField.length; index++) {
			const element = taskField[index];
			taskDescInfo[element] = formInfo[element];
		}
	}
	parmas={
		"taskid": dataCenter.form[formId].taskId?dataCenter.form[formId].taskId:"",
       	"projectId":dataCenter.form[formId]['projectId']?dataCenter.form[formId]['projectId']:"",
		"msgtype":msgtype,
		"approvalopinions":approvalopinions,
		"operation":taskType?taskType:"submit",
		"infojson":taskDescInfo,
		"principal":assignee,
	};
	return parmas;
}


/**
 * 主form提交
 * @param {*} err 
 */
function mainFormSubmit(err) {
	submit(sysSet.mainFormId, err);
}

/**
 * 提交表单
 * 页面上传信息并跳转
 * style:submit->数据上传。save->数据保存到草稿箱
 * mustInputDialog必填项页面处理函数,如果没有就调用系统的formMustInputError函数
 * maybeInputDialog选填项页面处理函数，如果没有就调用系统的formMaybeInputError函数
 * err错误处理函数
 * @param {String} orign 
 * @param {Function} callback
 */
function submit (formId, err) {
    if(dataCenter.form[formId]['antiShake']){  //代码防抖
        if(dataCenter.form[formId]['submitted']){  //已提交过，就不能提交

        }else{
            // 执行提交前钩子
            // var htmlBeforeSubmit =  $("#"+formId).attr("beforeSubmit");
            // eval(htmlBeforeSubmit);
            // var beforeSubmit = "typeof beforeSubmit" + firstCase(formId) + " !== 'undefined' && beforeSubmit" + firstCase(formId) + "();";
            // eval(beforeSubmit);
            dcEvent(formId, "beforeSubmit", "form")
            // 检查必填项
            checkDialogForm(formId, function () {
                //获取参数
                var parmas = getFormParmas(formId);
                var afterGetFormParmas = "typeof afterGetFormParmas" + firstCase(formId) + " !== 'undefined' && afterGetFormParmas" + firstCase(formId) + "(parmas);";
                eval(afterGetFormParmas);
                if(dataCenter.form[formId]['antiShake']){  //代码防抖
                    if(!dataCenter.form[formId]['submitted']){ 
                        dataCenter.form[formId]['submitted'] = true;
                        // 更新数据
                        dataSubmitInterface(parmas, formId, err);
                    } 
                }else{
                    // 更新数据
                    dataSubmitInterface(parmas, formId, err);
                }
            });
        }

    }else{
        // 执行提交前钩子
        // var htmlBeforeSubmit = $("#"+formId).attr("beforeSubmit");
        // eval(htmlBeforeSubmit);
        // var beforeSubmit = "typeof beforeSubmit" + firstCase(formId) + " !== 'undefined' && beforeSubmit" + firstCase(formId) + "();";
        // eval(beforeSubmit);

        dcEvent(formId, "beforeSubmit", "form")
        // 检查必填项
        checkDialogForm(formId, function () {
            //获取参数
            var parmas = getFormParmas(formId);
            var afterGetFormParmas = "typeof afterGetFormParmas" + firstCase(formId) + " !== 'undefined' && afterGetFormParmas" + firstCase(formId) + "(parmas);";
            eval(afterGetFormParmas);
            // 更新数据
            dataSubmitInterface(parmas, formId, err);
        });
    }
}

/**
 * 提交表单
 * @param {*} formId 
 * @param {*} err 
 */
function dataSubmitInterface (parmas, formId, err) {
    zjxxAjaxAddOrUpdate(parmas, function (data) { //false表示列表
        if (data.flag == 200) {
            // var htmlAfterSubmit = $("#"+formId).attr("afterSubmit");
            // eval(htmlAfterSubmit);
            // var afterSubmit = "typeof afterSubmit" + firstCase(formId) + " !== 'undefined' && afterSubmit" + firstCase(formId) + "(data);";
			// eval(afterSubmit);

            dcEvent(formId, "afterSubmit", "form", data)
        } else {
            if (typeof err !== 'undefined') {
                err(data);
            }
        }
    });
}


/**
 * 任务操作提交--run接口
 * @param {String}  formId
 * @param {obj} element 按钮dom对象
 */
function operationTask (formId, taskType, err) {
    if(dataCenter.form[formId]['antiShake']){  //代码防抖
        if(dataCenter.form[formId]['submitted']){  //已提交过，就不能提交

        }else{
            // 执行提交前钩子
            // var htmlBeforeSubmit =  $("#"+formId).attr("beforeSubmit");
            // eval(htmlBeforeSubmit);
            // var beforeSubmit = "typeof beforeSubmit" + firstCase(formId) + " !== 'undefined' && beforeSubmit" + firstCase(formId) + "();";
            // eval(beforeSubmit);

            // dcEvent(formId, "beforeSubmit", "form");
            // 检查必填项
            checkDialogForm(formId, function () {
                //获取参数
                var parmas = getFormOperationTaskParmas(formId, taskType);
                if(dataCenter.form[formId]['antiShake']){  //代码防抖
                    if(!dataCenter.form[formId]['submitted']){ 
                        dataCenter.form[formId]['submitted'] = true;
                        // 更新数据
                        operationTaskSubmitInterface(parmas, formId, err);
                    } 
                }else{
                    // 更新数据
                    operationTaskSubmitInterface(parmas, formId, err);
                }
            });
        }

    }else{
        // 执行提交前钩子
        // var htmlBeforeSubmit = $("#"+formId).attr("beforeSubmit");
        // eval(htmlBeforeSubmit);
        // var beforeSubmit = "typeof beforeSubmit" + firstCase(formId) + " !== 'undefined' && beforeSubmit" + firstCase(formId) + "();";
        // eval(beforeSubmit);

        // dcEvent(formId, "beforeSubmit", "form")
        // 检查必填项
        checkDialogForm(formId, function () {
            //获取参数
            var parmas = getFormOperationTaskParmas(formId, taskType);
            // 更新数据
            operationTaskSubmitInterface(parmas, formId, err);
        });
    }
}

/**
 * 任务操作提交--run接口提交表单
 * @param {*} formId 
 * @param {*} err 
 */
function operationTaskSubmitInterface (parmas, formId, err) {
    zjxxAjaxRun(parmas, function (data) { //false表示列表
        if (data.flag == 200) {
            // var htmlAfterSubmit = $("#"+formId).attr("afterSubmit");
            // eval(htmlAfterSubmit);
            // var afterSubmit = "typeof afterSubmit" + firstCase(formId) + " !== 'undefined' && afterSubmit" + firstCase(formId) + "(data);";
			// eval(afterSubmit);

            dcEvent(formId, "afterSubmit", "form", data)
        } else {
            if (typeof err !== 'undefined') {
                err(data);
            }
        }
    });
}

/**
 * 整合operationTask参数,返回接口参数
 * @param {String} formId 
 * @param {String} taskType 操作类型
 */
function getFormOperationTaskParmas (formId, taskType) {
    var parmas = {info:{}};
    parmas.infoClass = {
        id : dataCenter.form[formId]['classid'],
    }
    
    //项目操作
    //终止：closeProject
    //冻结：frozenProject
    //解冻：thawProject
//    if ("closeProject,frozenProject,thawProject".indexOf(taskType)>-1) {
//         parmas.info.workflow = getFormProjectParmas(formId);
//    } else {
        parmas.info.workflow = getTaskParmas(formId,taskType);
//    }
   parmas.info.type = "info";
   parmas.info = JSON.stringify(parmas.info);
   parmas.promise = JSON.stringify({
        "functionName":taskType
   });
   parmas.infoClass = JSON.stringify(parmas.infoClass);
    return parmas;
}

/**
 * 项目操作参数,返回接口参数
 * @param {String} formId 
 * @param {String} taskType 操作类型
 */
// function getFormProjectParmas (formId) {
//     var parmas = {};
//     parmas = {
//         "projectId":dataCenter.form[formId]['projectId']
//     };
   
//     return parmas;
// }


/**
 * 提交表单
 * @param {*} formId 
 * @param {*} err 
 */
function dataSubmitDraftInterface (parmas, formId, err) {
    zjxxAjaxAddOrUpdate(parmas, function (data) { //false表示列表
        if (data.flag == 200) {
            // var htmlAfterSubmitDraft =$("#"+formId).attr("afterSubmitDraft");
            // eval(htmlAfterSubmitDraft);
            // var afterSubmitDraft = "typeof afterSubmitDraft" + firstCase(formId) + " !== 'undefined' && afterSubmitDraft" + firstCase(formId) + "(data);";
			// eval(afterSubmitDraft);

            dcEvent(formId, "afterSubmitDraft", "form", data)
        } else {
            if (typeof err !== 'undefined') {
                err(data);
            }
        }
    });
}

function applyDrawing(data) {
    var field = $(".pageForm [name]");
    field.each(function () {
        var value = data[$(this).attr("name")];
        $(this).val(value);

    });
    if (field.find('input[type="radio"]')) {
        field.find('input[type="radio"]').filter("[value='" + data.type + "']").attr("checked", true);
    }
}

/**
 * 弹框中form表单，检查必填项，并提示
 * @param {String} formId 
 * @param {Function} callback
 */
function checkDialogForm(formId, callback) {
	dataCenter.form[formId]['down']['formNewInfo'] = serializeForm(formId);
	var params = checkMustInput(formId);
	if (params.items.length > 0) {
        showDialog('mustInputPopup', 'mustInputForm');
		for (var i = 0; i < params.titles.length; i++) {
			params.titles[i] = { title: params.titles[i] }
		}
		renderListByData('mustInputPopup', params.titles);
		return;
	}
	callback(formId);
}

/**
 * 获取页面上formId表单中所有的input的键值对
 * @param {String} formId 
 * @return {Object} 表单中所有的input，slect,textarea的name-value键值对
 */
function serializeForm(formId) {
	// 创建空的表单对象
	var vs = {};
	// 如果form表单有对应的dataCenter配置，且infoId配置有值，则将infoId配置的值赋给表单对象的id属性
	try {
		if (dataCenter['form'][formId].hasOwnProperty('infoId') && dataCenter['form'][formId]['infoId']) {
			vs['id'] = dataCenter['form'][formId].infoId;
		}
	} catch (e) {
	}
	// 表单对应配置对象
	var formInfo = {};
	if (dataCenter['form'].hasOwnProperty(formId)) {
		formInfo = dataCenter['form'][formId]['down']['formInfo'];
	}
	// 遍历input
	$("#" + formId + ' input').each(function () {
		var name = $(this).attr('name');
		var value = trim($(this).val(), 2);
		// 表单配置对象infoId有值，则不再处理id属性
		if(name == "id" && isNotEmpty(vs['id'])){

        } else if ($(this).attr('type') == 'richTextEditor') {//富文本类型
             let val = serializeRichTextEditor($(this)[0]);
             vs[name] = trim(val, 2);
        } 
        else if (isNotEmpty(name) && isNotEmpty(value)) {
            // checkbox输入框值用逗号隔开
            if ($(this).attr('type') == 'checkbox') {
                if ((vs[name] == null || vs[name] == '') && $(this).is(':checked')) {
                    vs[name] = value;
                } else if ($(this).is(':checked')) {
                    vs[name] = vs[name] + "$$$" + value;
                }
            } else if ($(this).attr('type') == 'radio') {
                if ($(this).is(':checked')) {
                    vs[name] = value;
                }
            } else {
                vs[name] = trim($(this).val(), 2);
            }
        }
        else if (isNotEmpty(name)) {
            //if (isNotEmpty(trim(formInfo[name], 2))) {
            vs[name] = '';
            //}
        }
    });
    // 遍历select
    $("#" + formId + ' select').each(function () {
        if (isNotEmpty($(this).attr('name')) && isNotEmpty($(this).val())) {
            vs[$(this).attr('name')] = trim($(this).val(), 2);
        }
    });
    // 遍历 textarea
    $("#" + formId + ' textarea').each(function () {
        var name = $(this).attr('name');
        if (isNotEmpty(name) && isNotEmpty($(this).val())) {
            vs[name] = trim($(this).val(), 2);
        }
        else if (isNotEmpty(name)) {
            //if (isNotEmpty(trim(formInfo[name], 2))) {
            vs[name] = '';
            //}
        }
    });
    //escape
    if (dataCenter['form'][formId] && dataCenter['form'][formId].hasOwnProperty('decode')) {
        dataCenter['form'][formId]['decode'].forEach(function (name) {
            if (vs.hasOwnProperty(name)) {
                vs[name] = html2Escape(vs[name]);
            }
        });
    }
    return vs;
}

/**
 * 渲染表单。1.通过dom查找input， 根据name属性，分别修改value.
 * 2.加载基础数据并显示.
 * 3.根据配置，设置输入限制，如小数，整数等
 * @param {String} formId
 */
function renderForm (formId) {
    // 表单数据
    var data = dataCenter.form[formId].down.formInfo;
    //根据sysSet中的全局设置，转义对应的数据的字段 
    data = escapeObjToHtmlObj(data);
    var keys = Object.keys(data);
    $("#" + formId + " input").each(function () {
        var name = $(this).attr('name');
        if (name != 'file' && isInArray3(keys, name)) {
            var value = data[name];
            //type=checkbox,如果值存在，就将输入框勾选上
            if ($(this).attr("type") == "checkbox") {
                if (isNotEmpty(value) || value == 0) {
                    //int数据无法split
                    value = value + "";
                    var values = value.split("$$$");
                    var checkboxValue = $(this).attr('datavalue');
                    if (isInArray3(values, checkboxValue)) {
                        $(this).prop('checked', true);
                    }
                    var val = $(this).val();
                    if (isInArray3(values, val)) {
                        $(this).prop('checked', true);
                    }
                }
            } else if ($(this).attr("type") == "radio") {
                if (isNotEmpty(value) || value == 0) {
                    var val = $(this).val();
                    if (val == value) {
                        $(this).prop('checked', true);
                    }
                }
            } else if ($(this).attr("type") == "richTextEditor") { //富文本类型
                renderRichTextEditor($(this)[0], value)
            } else {
                //FIXME:为什么要加这个判断？？？
                if (name == "id" && formId =="mainForm" &&isNotEmpty($('#mainForm input[name=id]').eq(0).val())) {

                } else {
                    $(this).val(trim(value, 2));
                }
            }
        }
    });
    $("#" + formId + " select").each(function () {
        var name = $(this).attr('name');
        if (isInArray3(keys, name)) {
            var name = $(this).attr('name');
            $(this).attr("datavalue", data[name]);
            $(this).val(data[name]);
            renderSelect($(this)[0])
        }
    });
    $("#" + formId + " textarea").each(function () {
        var name = $(this).attr('name');
        if (isInArray3(keys, name)) {
            var name = $(this).attr('name');
            if (isNotEmpty(data[name])) {
                $(this).val(escape2Html(data[name]));
            }
        }
    });
    $("#" + formId + " span").each(function () {
        var name = $(this).attr('name');
        if (isInArray3(keys, name)) {
            var name = $(this).attr('name');
            $(this).text(data[name]);
        }
    });
    //设置输入限制
    // inputSestrict(formId);
}

/**
 * 初始化页面效果.设置必填项，选填项，显示隐藏块等
 * @param {String} formId
 */
function initFormPage (formId) {
    // 备份Form的roleShow
    backupInputState(formId);
    // 动态添加roleShow的数据
    concordanceForm(formId);
    // 清除页面上input原有的状态
    initCancelInputState(formId);
    // 初始化显示项
    initViewInput(formId);
    // 初始化隐藏项
    initHiddenClass(formId);
    // 初始化显示板块
    initFormBlock(formId);
    // 初始化必填项
    initMustInput(formId);

    //初始化相关方法  submit submitDraf等
    $('.zjDC_submitButton').unbind().click(function () {
        submit("mainForm");
    });

    $('.zjDC_submitDraftButton').unbind().click(function () {
        submitDraft("mainForm")
    });

    $('.zjDC_resetButton').unbind().click(function () {
        resetForm("mainForm")
    });

    $('.zjDC_operationTask').unbind().click(function () {
        let taskType = $(this).attr("taskType");
        operationTask("mainForm", taskType)
    });

}

/**
 * 清除页面的输入缓存
 * @param {String} formId
 */
function deletePageCache(formId) {
	try{
		// 需要清除的缓存配置项
		var notDeleteCache = dataCenter.form[formId]['notDeleteCache'];
		$("#" + formId + " input").each(function () {
			var name = $(this).attr('name');
			if (isEmpty(notDeleteCache) || notDeleteCache.length < 1 || notDeleteCache.indexOf(name) <0) {
				$(this).val('');
			}
		});
		$("#" + formId + " select").each(function () {
			var name = $(this).attr('name');
			if (isEmpty(notDeleteCache) || notDeleteCache.length < 1 || notDeleteCache.indexOf(name) <0) {
				$(this).val('');
			}
		});
		$("#" + formId + " textarea").each(function () {
			var name = $(this).attr('name');
			if (isEmpty(notDeleteCache) || notDeleteCache.length < 1 || notDeleteCache.indexOf(name) <0) {
				$(this).val('');
			}
		});
	}catch(e){
		console.log("deletePageCache");
	}
}

/**
 * 重置form
 * @param {String} formId
 */
function resetForm(formId) {
	try{
		$("#" + formId + " input").each(function () {
			$(this).val('');
		});
		$("#" + formId + " select").each(function () {
			$(this).val('');
		});
		$("#" + formId + " textarea").each(function () {
			$(this).val('');
		});
	}catch(e){
		console.log("resetForm");
	}
}


/**
 * 初始化显示板块
 * @param {String} formId
 */
function initFormBlock (formId) {
    var roleName = getFormRole(formId);
    var formData = dataCenter.form[formId]['roleShow'][roleName];
    if(isEmpty(formData)){
        return false;
    }
    if (formData.hasOwnProperty("showBlock") && formData['showBlock'].hasOwnProperty(dataCenter.page.pageNode) && formData['showBlock'][dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
        var showBlock = formData['showBlock'][dataCenter.page.pageNode][dataCenter.page.fromNode];
        if (showBlock && showBlock.length > 0) {
            showBlock.forEach(function (item) {
                $("#" + formId + " #" + item).show();
                $("#" + formId + " ." + item).removeClass("zj-none-css");
            });
        }
    }
}


/**
 * 备份Form的roleShow
 * @param {String} formId
 */
function backupInputState(formId) {
	if (typeof dataCenter.form[formId]['roleShowBack'] == 'undefined') {
		dataCenter.form[formId]['roleShowBack'] = {};
		$.extend(true, dataCenter.form[formId]['roleShowBack'], dataCenter.form[formId].roleShow);
	};
	// 重置配置
	var resetFields = dataCenter.form[formId]['resetFields'];
	if (resetFields != null && resetFields != '' && resetFields.length > 0) {
		resetFields.forEach(function (field) {
			$("#" + formId + " input[name=" + field + "]").val("");
		});
	}
}

/**
 * 恢复Form的roleShow
 * @param {String} formId
 */
function recoveryInputState (formId) {
    if (typeof dataCenter.form[formId]['roleShowBack'] != 'undefined') {
        dataCenter.form[formId]['roleShow'] = {};
        $.extend(true, dataCenter.form[formId]['roleShow'], dataCenter.form[formId].roleShowBack);
    };
}

/** FIXME:现在的规则是在文字标签上添加class就可以  需要做对应的修改--测评中心先不动
 * 清除页面上input原有的状态
 * @param {String} formId
 */
function initCancelInputState (formId) {
    var strCommand = '$("#' + formId + ' input,#' + formId + ' textarea,#' + formId + ' select' + '")' + sysSet.deleteStarShow + '.remove()';
    eval(strCommand);
}

/**
 * 初始化显示项
 * 初始化input，select,textare不可编辑项-也就是做成disbale状态,  其中input有日期的在disbale时候隐藏日历图标，
 * 如果input中有show="stateNonEditable",这一项的显示属性将不能编辑
 * @param {String} formId
 */
function initViewInput (formId) {
    var role = getFormRole(formId);
    //判断这个栏目的权限
    if (dataCenter.form[formId].hasOwnProperty("classPermission") && dataCenter.form[formId]['classPermission'].hasOwnProperty(role)){
        var formData = dataCenter.form[formId].classPermission[getFormRole(formId)];
        if (formData.hasOwnProperty("view") && formData.view.hasOwnProperty(dataCenter.page.pageNode) && formData.view[dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
            if(formData.view[dataCenter.page.pageNode][dataCenter.page.fromNode]){
                //所有输入元素只读
                $("#" + formId + " input").each(function () {
                    $(this).attr("readonly", "readonly");
                });
                $("#" + formId + " select").each(function () {
                    $(this).attr("disabled", "disabled");
                    removeArray.call("disabled", 'disabled');
                    initViewSelect($(this)[0]);
                })
                $("#" + formId + " textarea").each(function () {
                    $(this).attr("disabled", "disabled");
                    removeArray.call("disabled", 'disabled');
                })
            }
        }
    }
    if (dataCenter.form[formId].hasOwnProperty("roleShow") && dataCenter.form[formId]['roleShow'].hasOwnProperty(role)) {
        // roleShow配置
        var formData = dataCenter.form[formId].roleShow[getFormRole(formId)];
        if (formData.hasOwnProperty("view") && formData.view.hasOwnProperty(dataCenter.page.pageNode) && formData.view[dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
            //FIXME:页面直接写死disabled，会因为这段代码变成  非disable状态
            // $("#" + formId + " input," + "#" + formId + " select," + "#" + formId + " textarea").each(function () {
            //     var show = $(this).attr("show");
            //     if (show != 'stateNonEditable') {
            //         $(this).removeAttr('disabled');
            //     }
            // })
            // view配置
            var viewInput = formData.view[dataCenter.page.pageNode][dataCenter.page.fromNode];
            for (var name in viewInput) {
                $("#" + formId + " input[name='" + name + "']").each(function () {
                    // var properties = viewInput[name].split(",");
                    // if ((properties, "disabled")) {
                    //     $(this).attr("disabled", "disabled");
                    //     removeArray.call(properties, 'disabled');
                    // }
                    //FIXME:20230322修改
                    var properties = viewInput[name];
                    $(this).attr(properties, properties);

                    // 文件上传 FIXME:button_file_upload 没用到过
                    // for (var i = 0; i < properties.length; i++) {
                    //     var _arrS = sysSet[properties[i]].split('||');
                    //     // 设置唯一id
                    //     if (properties[i] == "button_file_upload") {
                    //         _arrS[2] = _arrS[2].replace("fileId", uuid());
                    //     }
                    //     // 执行操作
                    //     if ($(this).parent().find('span.ahref').length == 0) {
                    //         var strCommand = '$(this)' + _arrS[0] + '.' + _arrS[1] + '("' + _arrS[2] + '")';
                    //         eval(strCommand);
                    //         $(this).parent().find("div.empty").remove();
                    //     }
                    // }
                })
                $("#" + formId + " select[name='" + name + "']").each(function () {
                    var properties = viewInput[name].split(",");
                    if (isInArray3(properties, "disabled")) {
                        $(this).attr("disabled", "disabled");
                        removeArray.call(properties, 'disabled');
                        // $(this).css({
                        // 	"border": "none",
                        // 	"background": "transparent",
                        // 	"cursor": "default",
                        // 	"color": "#000"
                        // }).removeAttr("unselectable").removeAttr("readonly");
                        initViewSelect($(this)[0])
                    }
                    for (var i = 0; i < properties.length; i++) {
                        var _arrS = sysSet[properties[i]].split('||');
                        var strCommand = '$(this)' + _arrS[0] + '.' + _arrS[1] + '("' + _arrS[2] + '")';
                        eval(strCommand);
                        $(this).parent().find("div.empty").remove();
                    }
                })
                $("#" + formId + " textarea[name='" + name + "']").each(function () {
                    var properties = viewInput[name].split(",");
                    if (isInArray3(properties, "disabled")) {
                        $(this).attr("disabled", "disabled");
                        removeArray.call(properties, 'disabled');
                    }
                    for (var i = 0; i < properties.length; i++) {
                        var _arrS = sysSet[properties[i]].split('||');
                        var strCommand = '$(this)' + _arrS[0] + '.' + _arrS[1] + '("' + _arrS[2] + '")';
                        eval(strCommand);
                        $(this).parent().find("div.empty").remove();
                    }
                })
            }
        }
    }
}

/**
 * 初始化隐藏项
 * @param {String} formId
 */
function initHiddenClass(formId) {
	var role = getFormRole(formId);
	if (dataCenter.form[formId].hasOwnProperty("roleShow") && dataCenter.form[formId]['roleShow'].hasOwnProperty(role)) {
		var formData = dataCenter.form[formId].roleShow[getFormRole(formId)];
		if (formData.hasOwnProperty("hidden") && formData.hidden.hasOwnProperty(dataCenter.page.pageNode) && formData.hidden[dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
			var hidden = formData['hidden'][dataCenter.page.pageNode][dataCenter.page.fromNode];
			if(typeof hidden != 'undefined'){
				hidden.forEach(function (className) {
					$("#" + formId + " ." + className).hide();
				});
			}
		}
	}
}

/**
 * 初始化必填项
 * @param {String} formId
 */
function initMustInput (formId) {
    var _arrS = sysSet.starShow.split('||');
    var formData = dataCenter.form[formId].roleShow[getFormRole(formId)];
    if (formData.hasOwnProperty("mustInput") && formData.mustInput.hasOwnProperty(dataCenter.page.pageNode) && formData.mustInput[dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
        var mustInput = formData.mustInput[dataCenter.page.pageNode][dataCenter.page.fromNode];
        var initnames = [];
        $("#" + formId + " input").each(function () {
            var name = $(this).attr('name');
            if (mustInput.indexOf(name) > -1 && $(this).attr("disabled") != "disabled" && initnames.indexOf(name) < 0) {
                var strCommand = '$(this)' + _arrS[0] + '.' + _arrS[1] + '(' + _arrS[2] + ')';
                eval(strCommand);
                initnames.push(name);
            }
        });
        $("#" + formId + " select").each(function () {
            var name = $(this).attr('name');
            if (mustInput.indexOf(name) > -1 && $(this).attr("disabled") != "disabled" && initnames.indexOf(name) < 0) {
                var strCommand = '$(this)' + _arrS[0] + '.' + _arrS[1] + '(' + _arrS[2] + ')';
                eval(strCommand);
                initnames.push(name);
            }
        });
        $("#" + formId + " textarea").each(function () {
            var name = $(this).attr('name');
            if (mustInput.indexOf(name) > -1 && $(this).attr("disabled") != "disabled" && initnames.indexOf(name) < 0) {
                var strCommand = '$(this)' + _arrS[0] + '.' + _arrS[1] + '(' + _arrS[2] + ')';
                eval(strCommand);
                initnames.push(name);
            }
        });
    }
}

/**
 * 动态添加roleShow的数据 整合多角色权限  role1+role2
 * 可能roleShow 为undefined
 * @param {String} formId
 */
function concordanceForm (formId) {
    var role = getFormRole(formId);

    recoveryInputState(formId);
    // 整合多角色权限
    if (typeof dataCenter.form[formId].roleShow[role] == 'undefined') {
        var data = concordanceFormData(formId);
        var formData = {};
        formData['view'] = {};
        formData['mustInput'] = {};
        formData['maybeInput'] = {};
        formData['showBlock'] = {};
        formData['hidden'] = {};
        formData['view'][dataCenter.page.pageNode] = {};
        formData['mustInput'][dataCenter.page.pageNode] = {};
        formData['maybeInput'][dataCenter.page.pageNode] = {};
        formData['showBlock'][dataCenter.page.pageNode] = {};
        formData['hidden'][dataCenter.page.pageNode] = {};
        formData['view'][dataCenter.page.pageNode][dataCenter.page.fromNode] = data.view;
        formData['mustInput'][dataCenter.page.pageNode][dataCenter.page.fromNode] = data.mustInput;
        formData['maybeInput'][dataCenter.page.pageNode][dataCenter.page.fromNode] = data.maybeInput;
        formData['showBlock'][dataCenter.page.pageNode][dataCenter.page.fromNode] = data.showBlock;
        formData['hidden'][dataCenter.page.pageNode][dataCenter.page.fromNode] = data.hidden;
        dataCenter.form[formId].roleShow[role] = formData;
    }
}

/**
 * 提交时检验必填项,将所有的没有填写的必填项返回
 * @param {String} formId
 * @return {Array} {items:['name1','name2']}
 */
function checkMustInput (formId) {
    var formData = dataCenter.form[formId].roleShow[getFormRole(formId)];
    var items = [];
    var titles = [];
    if (formData.hasOwnProperty("mustInput") && formData.mustInput.hasOwnProperty(dataCenter.page.pageNode) && formData.mustInput[dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
        typeof beforeMustInputCheck !== 'undefined' && beforeMustInputCheck(formId);
        var mustShow = formData.mustInput[dataCenter.page['pageNode']][dataCenter.page['fromNode']];
        let formNewInfo = dataCenter.form[formId].down.formNewInfo;
        mustShow.forEach(function (item) {
            if ((isEmpty(formNewInfo[item]) || formNewInfo[item] == '请选择')) {
                items.push(item);
                var musttitle = $("#" + formId + " [name='" + item + "']").attr("musttitle");
                if (musttitle) {
                    titles.push(musttitle);
                }
            }
        });
    }
    items = removeRepeatArray(items);
    titles = removeRepeatArray(titles);
    if (items.length > 0) {
        formMustInputError(items, formId);
    }
    return { items: items, titles: titles };
}

/**
 * 提交时检验可填项项,将所有的没有填写的可填项返回
 * @param {String} formId
 * @return {String} // 'name1,name2'
 */
function checkMaybeInput (formId) {
    var formData = dataCenter.form[formId].roleShow[getFormRole(formId)];
    var items = false;
    if (formData.hasOwnProperty("maybeInput") && formData.maybeInput.hasOwnProperty(dataCenter.page.pageNode) && formData.maybeInput[dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
        var maybeShow = formData.maybeInput[dataCenter.page.pageNode][dataCenter.page.fromNode];
        let formNewInfo = dataCenter.form[formId].down.formNewInfo;
        maybeShow.forEach(function (item) {
            if ((isEmpty(formNewInfo[item]) || (formNewInfo[item] == "0" && $("#" + formId + " [name=" + item + "]").is('select')) || formNewInfo[item] == '请选择')) {
                if (!items) {
                    items = item;
                } else {
                    items += "," + item;
                }
            }
        });
    }
    return items;
}

/**
 * 必须输入的input没有输入时的错误提示（红框标出）
 * @param {String} formId 
 * @param {Array[{Object}]} item
 */
function formMustInputError (items, formId) {
    $("#" + formId + " input,#" + formId + " select,#" + formId + " textarea").each(function (i, elem) {
        if (isInArray(items, elem.name)) {
            $(elem).css('border', "1px solid " + sysSet.color.mustInput);
        }
    })
}

/**
 * 动态修改必填选填项
 * @param {String} formId 
 * @param {Array} array 要转换的name
 * @param {'to_must'|'to_maybe'|'to_read'} type 转换成什么类型。
 */
function reloadInputState(formId, array, type) {
	var newmaybeShow = [];
	var newmustShow = [];
	var formData = dataCenter.form[formId].roleShow[getFormRole(formId)];

	if (typeof formData.maybeInput == 'undefined') {
		formData.maybeInput = {};
		formData.maybeInput[dataCenter.page.pageNode] = {}
		formData.maybeInput[dataCenter.page.pageNode][dataCenter.page.fromNode] = []
	}else if(typeof formData.maybeInput[dataCenter.page.pageNode] == 'undefined'){
		formData.maybeInput[dataCenter.page.pageNode] = {}
		formData.maybeInput[dataCenter.page.pageNode][dataCenter.page.fromNode] = []
	}else if(typeof formData.maybeInput[dataCenter.page.pageNode][dataCenter.page.fromNode] == 'undefined'){
		formData.maybeInput[dataCenter.page.pageNode][dataCenter.page.fromNode] = []
	}

	if (typeof formData.mustInput == 'undefined') {
		formData.mustInput = {};
		formData.mustInput[dataCenter.page.pageNode] = {}
		formData.mustInput[dataCenter.page.pageNode][dataCenter.page.fromNode] = []
	}else if(typeof formData.mustInput[dataCenter.page.pageNode] == 'undefined'){
		formData.mustInput[dataCenter.page.pageNode] = {}
		formData.mustInput[dataCenter.page.pageNode][dataCenter.page.fromNode] = []
	}else if(typeof formData.mustInput[dataCenter.page.pageNode][dataCenter.page.fromNode] == 'undefined'){
		formData.mustInput[dataCenter.page.pageNode][dataCenter.page.fromNode] = []
	}

	var maybeShow = formData.maybeInput[dataCenter.page.pageNode][dataCenter.page.fromNode];
	var mustShow = formData.mustInput[dataCenter.page.pageNode][dataCenter.page.fromNode];

	if (maybeShow != undefined) {
		maybeShow.forEach(function (item) {
			if (!isInArray3(array, item)) {
				newmaybeShow.push(item);
			}
		});
	}
	if (mustShow != undefined) {
		mustShow.forEach(function (item) {
			if (!isInArray3(array, item)) {
				newmustShow.push(item);
			}
		});
	}

	if (type == "to_must") {
		newmustShow = newmustShow.concat(array);

	} else if (type == "to_maybe") {
		newmaybeShow = newmaybeShow.concat(array);
	} else if (type == "to_read") { }

	formData.mustInput[dataCenter.page.pageNode][dataCenter.page.fromNode] = newmustShow;
	formData.maybeInput[dataCenter.page.pageNode][dataCenter.page.fromNode] = newmaybeShow;
	initCancelInputState(formId);
}


/**
 * 整合多角色权限，规则如下：
 * roleType=concordance
 * roleType:add角色相加，priority:根据角色优先级来返回权限
 * 整合多角色formData数据
 * view: disabled取交集 其他取合集(map)
 * mustInput: 取合集(array)1
 * maybeInput:取合集 和mustInput取不相交部分(array)1
 * hidden:取交集(array)1
 * showBlock:取合集(array)1
 * @param {String} formId 
 */
function concordanceFormData(formId) {
	var mustInput = [];
	var maybeInput = [];
	var hidden;
	var showBlock = [];
	var view = {};
	var disabledView;
	var viewOther = {};
	var roles = getFormRole(formId).split('+');
	roles.forEach(function (role, index) {
		var formData = dataCenter.form[formId].roleShow[role];
		var mInput = [];
		if (formData.hasOwnProperty('mustInput') && formData.mustInput.hasOwnProperty(dataCenter.page.pageNode) && formData.mustInput[dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
			mInput = formData.mustInput[dataCenter.page.pageNode][dataCenter.page.fromNode];
			mustInput = mustInput.concat(mInput); // 取合集
		}
		var myInput = [];
		if (formData.hasOwnProperty('maybeInput') && formData.maybeInput.hasOwnProperty(dataCenter.page.pageNode) && formData.maybeInput[dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
			myInput = formData.maybeInput[dataCenter.page.pageNode][dataCenter.page.fromNode];
			maybeInput = maybeInput.concat(myInput); // 取合集
		}
		var sBlock = [];
		if (formData.hasOwnProperty('showBlock') && formData.showBlock.hasOwnProperty(dataCenter.page.pageNode) && formData.showBlock[dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
			sBlock = formData.showBlock[dataCenter.page.pageNode][dataCenter.page.fromNode];
			showBlock = showBlock.concat(sBlock); // 取合集
		}
		var hide = [];
		if (formData.hasOwnProperty('hidden') && formData.hidden.hasOwnProperty(dataCenter.page.pageNode) && formData.hidden[dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
			hide = formData.hidden[dataCenter.page.pageNode][dataCenter.page.fromNode];
			if (typeof hidden == 'undefined') {
				hidden = hide;
			} else {
				hidden = Array.intersect(hidden, hide); // 取交集
			}
		}
		var viewi = [];
		if (formData.hasOwnProperty('view') && formData.view.hasOwnProperty(dataCenter.page.pageNode) && formData.view[dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
			viewi = formData.view[dataCenter.page.pageNode][dataCenter.page.fromNode];
			var viewiDisabled = [];
			for (var name in viewi) {
				if (viewi[name] !== 'disabled') {
					viewOther[name] = viewi[name];
				} else {
					viewiDisabled.push(name);
				}
			}
			if (typeof disabledView == 'undefined') {
				disabledView = viewiDisabled;
			} else {
				disabledView = Array.intersect(disabledView, viewiDisabled)
			}
		}
	})

	maybeInput = removeRepeatArray(maybeInput);
	mustInput = removeRepeatArray(mustInput);
	showBlock = removeRepeatArray(showBlock);
	maybeInput = maybeInput.filter(function (name) {
		return (mustInput.indexOf(name) === -1);
	})
	view = viewOther;
	if (typeof disabledView == 'undefined') {
		disabledView =[];
	}
	disabledView.forEach(function (name) {
		view[name] = 'disabled'
	})
	return {
		'view': view,
		'mustInput': mustInput,
		'maybeInput': maybeInput,
		'hidden': hidden,
		'showBlock': showBlock
	}
}

/************************************************ 草稿箱相关联方法  ************************************/

/**
 * 整合草稿箱submit参数
 * @param {String} orign 
 * @param {Function} callback
 */
function getDraftSubmitParmas (formId) {
    var formNewInfo = serializeForm(formId);
    var searchJson = [];
    dataCenter.form[formId]['draftSearchField'].forEach(element => {  
        for(key in formNewInfo){
            if(element == key){
                searchJson.push({
                    key:formNewInfo[key]
                })
            } 
        }
     }); 
    // 接口参数
    var parmas = {};
    parmas.infoClass = {
        id : "draft",
    }
    parmas.infoClass = JSON.stringify(parmas.infoClass);
    parmas.info = { 
        id: dataCenter.form[formId]['draftInfoId'],
        type:"info",
        info :{
            id: dataCenter.form[formId]['draftInfoId'],
            infojson: JSON.stringify(formNewInfo),
            creatorid: dataCenter.user.id,
            title: formNewInfo.draftTitle,
            pagename: dataCenter.page.pageName,
            pagenode: dataCenter.page.pageNode,
            fromnode: dataCenter.page.fromNode,
            state: dataCenter.base.state,
            draftsession: JSON.stringify(dataCenter.session),
            classid: dataCenter.form[formId].classid,
            searchjson: searchJson,
            infoid: formNewInfo["id"] ? formNewInfo["id"]:"" ,
        }, 
    };
    parmas.info = JSON.stringify(parmas.info);
    return parmas;
}

/**
 * 保存数据到草稿箱
 * 页面上传信息并跳转
 * style:submit->数据上传。save->数据保存到草稿箱
 * mustInputDialog必填项页面处理函数,如果没有就调用系统的formMustInputError函数
 * maybeInputDialog选填项页面处理函数，如果没有就调用系统的formMaybeInputError函数
 * err错误处理函数
 * @param {*} orign 
 * @param {*} callback 
 * @param {*} err 
 */
function submitDraft (formId, err) {
    // 执行提交前钩子
    // var beforeSubmit = $("#"+formId).attr("beforeSubmit");
    // eval(beforeSubmit);

    dcEvent(formId, "beforeSubmit", "form")
    //获取相关参数  
    var parmas = getDraftSubmitParmas(formId);
    // 更新数据
    dataSubmitDraftInterface(parmas, formId, err);
}
