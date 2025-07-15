
/**
 * 获取搜索参数，整合配置和搜索的内容
 * 函数不对外开放
 * @param {String} id 
 */
 function getSeachParma(id) {
	var params = serializeListSearch(id); //页面搜索值
	//从配置里复制搜索配置
	var searchInfo1 = dataCenter['list'][id].searchInfo;
	var searchInfo = jQuery.extend(true, {}, searchInfo1);

	for (var k in params) {
		if (params[k].value && k == "zjxxSearchOrder") {
			searchInfo["orderType"] = params[k].value
		} else if (params[k].value) {
			searchInfo["searchField"].push(k);
			params[k].condition = params[k].condition ? params[k].condition : "like";
			switch (params[k].condition) {
				case "like":
					searchInfo["searchValue"].push("%" + params[k].value + "%");
					searchInfo["searchCondition"].push("and$$$like");
					break;
			
				default:
					searchInfo["searchValue"].push(params[k].value);
					searchInfo["searchCondition"].push("and$$$"+params[k].condition);
					break;
			}
			
		}
	}
	var page = dataCenter['list'][id].page;
	var promise = {};
	if (isNotEmpty(dataCenter['list'][id]["isNeedSubset"])) {
		promise.isNeedSubset = dataCenter['list'][id]["isNeedSubset"];
	}
	if (isNotEmpty(dataCenter['list'][id]["noCache"])) {
		promise.noCache = dataCenter['list'][id]["noCache"];
	}
	if (isNotEmpty(dataCenter['list'][id]["isleftjoin"])) {
		promise.isleftjoin = dataCenter['list'][id]["isleftjoin"];
	}
	if (isNotEmpty(dataCenter['list'][id]["isOrNotRead"])) {
		promise.isOrNotRead = dataCenter['list'][id]["isOrNotRead"];
	}
	if (isNotEmpty(dataCenter['list'][id]["isdelete"])) {
		promise.isdelete = dataCenter['list'][id]["isdelete"];
	}
	if (isNotEmpty(dataCenter['list'][id]["groupBy"])) {
		promise.groupBy = dataCenter['list'][id]["groupBy"];
	}
	let infoClass = { id: dataCenter['list'][id].classId };
	if (dataCenter.list[id]['isNeedTemp']) {
		infoClass["isNeedTemp"] = dataCenter.list[id]['isNeedTemp'];
	}
	let info = {
		fields: dataCenter.list[id]['fields'],
		type: dataCenter.list[id]['state'] ? dataCenter.list[id]['state'] : "info",
		_ES_highlight: dataCenter.list[id]['_ES_highlight'],
	};
	if (dataCenter.list[id]['info']) {
		info = Object.assign(info, dataCenter.list[id]['info']);
	}
	var search = {
		search: JSON.stringify(searchInfo),
		page: JSON.stringify(page),
		infoClass: JSON.stringify(infoClass),
		info: JSON.stringify(info),
		promise: JSON.stringify(promise),
	}
	return search;
}


/**
 * 调用后台方法获取数据，渲染列表
 * 这个函数可对外使用
 * @param {String} listId 块listId(与dataCenter.list里的字段对应)
 * @param {String} fomId 
 */
function getListBlockData(listId, fomId) {
	//接口调用开始时间
	dataCenter.list[listId]["beginTime"] = new Date();
	var getListParams = dataCenter.list[listId]['getParamFun'];
	if (getListParams) {
		var parmas = getListParams(listId);
	} else {
		var parmas = getSeachParma(listId);
	}
	zjxxAjaxList(parmas, function (result) {
		//接口调用结束时间
		dataCenter.list[listId]["endTime"] = new Date();
		dataCenter.list[listId]["ajaxTime"] = dataCenter.list[listId]["endTime"] - dataCenter.list[listId]["beginTime"];
		if (result.flag == 200) {
			//判断是否需要替换页面模版
			if (dataCenter.list[listId]['isNeedTemp']) {
				if (isNotEmpty(data["infoClass"]) && isNotEmpty(data["infoClass"]["temp"])) {
					$("#" + list).html(data["infoClass"]["temp"]);
				}
			}
			// dataCenter.list[listId].jsondata = result;
			dataCenter.list[listId].listDownInfos = result.infos; //存储原始数据
			dataCenter.list[listId].listInfos = result.infos; //将页面数据放在dataCenter.pageInfo
			for (var i = 0; i < dataCenter.list[listId].listInfos.length; i++) {
				var dataObj = dataCenter.list[listId].listInfos[i];
				escapeObjToHtmlObj(dataObj);
			}
			dataCenter.list[listId]['page']['total'] = result['page'] ? result['page']['infoCount'] : 0; //分页信息
			dataCenter.list[listId]['page']['pages'] = result['page'] ? result['page']['pageCount'] : 0; //总页数	
			//列表最后一页第五页删除全部数据后，页面只显示第四页，但列表未显示第四页的数据
			if (reloadListByLastPage(listId)) {
				return false;
			};

			renderList(listId, fomId);
		}
	}, function err(errMsg) {
		var err = "err" + firstCase(listId);
		if (typeof window[err] == "function") {
			eval(window[err]());
		} else {
			alert(errMsg);
		}

	});
}


/**
 * 列表中表单提交方法,检查必填项，并提示
 * @param {String} listId 
 * @param {Function} callback
 */
function checkListForm(listId, formId, callback) {
	var params = checkListFormMustInput(listId, formId);
	if (params.items.length > 0) {
		showDialog('mustInputPopup', 'mustInputForm');
		for (var i = 0; i < params.titles.length; i++) {
			params.titles[i] = { title: params.titles[i] }
		}
		renderListByData('mustInputPopup', params.titles);
		return;
	}
	callback();
}

/**
 * 保存数据列表数据
 * 提交整个列表数据，删除deleteIds中的数据
 * @param {String} listId 
 * @param {Function} callback 
 */
function submitListForm(listId, formId, callback) {
	checkListForm(listId, formId, function () {
		var listDataOld = getJsonFromListForm(listId, formId);
		var listData = [];
		listDataOld.map((item, index) => {
			listData.push(Object.assign({}, item, { classid: dataCenter.list[listId].classId }))
		})
		var deleteIds = dataCenter.list[listId].deleteIds ? dataCenter.list[listId].deleteIds : [];
		//FIXME: updateListInfoByClassId,deleteInfoByIds 需要做对应修改，后台要同步支持批量接口
		if (listData.length > 0 && deleteIds.length > 0) {
			zjxxAjaxAddOrUpdate(dataCenter.list[listId].classId, JSON.stringify(listData), function (result) {
				zjxxAjaxDelete(dataCenter.list[listId].classId, deleteIds.join(','), function () {
					dataCenter.list[listId].deleteIds = [];
					typeof callback != 'undefined' && callback();
				}, function () {
				})
			});
		} else if (listData.length > 0) {
			zjxxAjaxAddOrUpdate(dataCenter.list[listId].classId, JSON.stringify(listData), function (result) {
				typeof callback != 'undefined' && callback();
			});
		} else if (deleteIds.length > 0) {
			zjxxAjaxDelete(dataCenter.list[listId].classId, deleteIds.join(','), function () {
				dataCenter.list[listId].deleteIds = [];
				typeof callback != 'undefined' && callback();
			}, function () {
			})
		} else {
			typeof callback != 'undefined' && callback();
		}
	})
}

/**
 * 直接传数据
 * 这个函数对外使用
 * @param {String} listId 
 * @param {String} formId 
 * @param {Array} data 
 */
function renderListByData(listId, data, formId) {
	if (isEmpty(formId)) {
		formId = "contentForm";
	}
	dataCenter.list[listId]['page']['total'] = data.length ? data.length : 0; //分页信息
	dataCenter.list[listId]['page']['pages'] = data.length == 0 ? 1 : Math.ceil(dataCenter['list'][listId]['page']['total'] / dataCenter['list'][listId]['page']['num']); //总页数	
	if (dataCenter.list[listId]['page']['page'] > dataCenter.list[listId]['page']['pages']) {
		dataCenter.list[listId]['page']['page'] = dataCenter.list[listId]['page']['page'] - 1;
	}
	if (dataCenter['list'][listId]['getPaginationConditions'] != null || $.isFunction(dataCenter['list'][listId]['getPaginationConditions'])) {
		dataCenter.list[listId].listInfos = data;;
	} else {
		dataCenter.list[listId].listInfos = getSubArrayByPage(data, dataCenter.list[listId]['page']['currPage'], dataCenter.list[listId]['page']['pageSize']);
	}
	renderList(listId, formId);
	//FIXME: 新增方法  需要修改对应的class
	//TODO:刘硕 
	//固定列
	if ($('#' + listId + " .colFixed").length > 0) {
		fixedCol(["colFixed"], listId);
	}
	//固定表头
	if ($('#' + listId).hasClass('theadFixed')) {
		tableFixing(listId);
	}
	// 重新计算 计算属性
	//FIXME:新增方法 dataCenter模版中没有这个属性
	var computing = dataCenter.list[listId].computing;
	if (typeof computing != 'undefined' && !dataCenter.list[listId].isRow) {
		var trs = $('#' + listId + " #" + formId);
		for (var i = 1; i < trs.length; i++) {
			for (var name in computing) {
				recalculate(listId, trs[i], computing, false);
			}
		}
		var trs2 = $('#' + listId + " #addForm");
		for (var i = 0; i < trs2.length; i++) {
			for (var name in computing) {
				recalculate(listId, trs2[i], computing, false);
			}
		}
		typeof afterRecalculateList != "undefined" && flag && afterRecalculateList(listId);
	}
	//FIXME:新增方法
	// 计算汇总字段
	// var countElems = $("#"+listId+" tfoot [count]");
	// var fields = {};
	// countElems.each(function(i,item){
	// 	fields[$(item).attr("count")]=$(item).attr("count");
	// })
	// var sums = summaryFields(fields, dataCenter.list[listId].listInfos);
	// for(var filed in fields){
	// 	$("#"+listId+" tfoot [count="+filed+"]").text(sums[filed]);
	// }
}


/**
 * 显示表格
 * listTableId中的table由三个部分组成，三个部分共用一个父级元素id
 * 1、搜索项class：listSearch，里面有class：item的子项，在子项中，class=title显示标题。在listSearch有几个特殊的input：。
 * orderType：排序类型、searchAttr :搜索方法的属性,如置顶等、startTime  :按时间段搜索newstime开始时间、endTime    : 按时间段搜索newstime结束时间。
 * listSearch通过searchRole结合当前用户的角色，来控制子项是否保留；
 * 若searchRole中定义的某一项，在页面上不存在，则新增一个class叫做item的input子项,
 * 并将此项的值赋给input的name(初步默认只新增input)。 
 * 搜索部分有几个按钮，class分别是，搜索按钮：searchButton、重置按钮：resetButton、取消按钮：cancelButton
 * 2、表格，表格现在有两种，一种含有table，一种没有table，每一行的有class为row
 * 2.1class：listTable。table中的Item，及tr项。table中的th和tr分开，
 * tr中的th增加name属性，具体这个属性对应的th是否要显示由权限决定，可在dataCenter中配置该列的显示权限。
 * 权限中含在thead中的不显示。
 * 还在modify部分的转成input
 * tr的模板直接从table中去取，在tr中的每一个td中的中用{{title}}记录需要的字段的值
 * 2.2没有table：每一行含有row的class
 * 3、分页项 class：pageCount共多少页，currentPage当前页，first第一页，last最后一页 当前选择页selected
 * preclick 上一页按钮，nextclick 下一页按钮
 * class=listPagination，里面有class=item（selected）的子项，对自相中的a标签修改。定义分页项的模板，就直接在这里定义，以后页面直接使用这个模板就行了
 * 4、listInfos 增加（infoFromSys(数据来源), infoRoleSys(角色), 默认1（infoNodeSys节点），infoStateSys(数据状态)）
 * 5、添加按钮.addButton 保存按钮.saveButton 批量保存按钮.saveAllButton 删除按钮.deleteButton 批量删除按钮
 * 不对外使用
 * @param {String} listId 
 * @param {String} formId 
*/
function renderList(listId, formId) {
	backupListState(listId);//备份权限配置
	concordanceList(listId); //整合权限
	if ($("#" + listId + " .zjDC_listSearch").length > 0) {
		renderListSearch(listId)
	}
	//给listForm设置默认值
	//FIXME:为什么要设置默认值？
	for (var i = 0; i < dataCenter.list[listId].listInfos.length; i++) {
		dataCenter.list[listId].listInfos[i].infoNodeSys = dataCenter.page.pageNode;
		dataCenter.list[listId].listInfos[i].infoStateSys = dataCenter.page.fromNode;
	}
	// var htmlBeforeRender = $("#"+listId).attr("beforeRender");
	// eval(htmlBeforeRender);

	// var beforeRender = "typeof beforeRender" + firstCase(listId) + " != 'undefined' && beforeRender" + firstCase(listId) + "(dataCenter.list[listId].listInfos);";
	// eval(beforeRender);

	//FIXME:权限
	// let permissionStartTime = new Date().getTime();
	// readylistPermissionInfo(listId);
	// let permissionEndTime = new Date().getTime();
	// let allTime = permissionEndTime - permissionStartTime;
	// console.warn(listId + "数据权限:" + allTime)
	// let permissionStartTime1 = new Date().getTime();
	// listPermission(listId);
	// let permissionEndTime1 = new Date().getTime();
	// let allTime1 = permissionEndTime1 - permissionStartTime1;
	// console.warn(listId + "功能权限:" + allTime1)

	dcEvent(listId, "beforeRender", "list", dataCenter.list[listId].listInfos)
	renderListItem(listId, formId);
	//用了新的分页组件，修改了对应代码，分页样式目前只保留renderPagination2
	if ($("#" + listId + " .zjDC_listPagination").length > 0) {
		if (dataCenter['list'][listId]['paginationType'] == 2) {
			renderPagination2(listId, formId);
		}
	}
	if ($("#" + listId + " .zjDC_listPagination").length > 0) {
		renderPagination2(listId, formId);
	}
	initListBlock(listId);
	// var htmlAfterRender = $("#"+listId).attr("afterRender");
	// eval(htmlAfterRender);

	// var afterRender = "typeof afterRender" + firstCase(listId) + " !== 'undefined' && afterRender" + firstCase(listId) + "(dataCenter.list[listId].listInfos);";
	// eval(afterRender);

	dcEvent(listId, "afterRender", "list", dataCenter.list[listId].listInfos)

	//编辑
	$("#" + listId + " .zjDC_updateButton").unbind().click(function (e) {
		let infoId = $(this).attr('zj-infoId');
		let pageUrl = $(this).attr('zj-pageUrl');
		let self = $(this).attr('zj-self');
		let state = $(this).attr('zj-state');
		state = state ? state : "info";
		dataCenter.to = {
			pageNode: 1,
			fromNode: "update",
			infoId: infoId,
			state: state
		}
		toUrl(pageUrl, self, false)
	});

	//删除
	$("#" + listId + " .zjDC_deleteButton").unbind().click(function (e) {
		list_DeleteSelectedInfo(listId, $(this)[0]);
	});

	

	//list选择框勾选事件委托
	listCheckboxCheckEvent(listId);

	//list标题行全选按钮事件
	listCheckboxAllCheckEvent(listId)

	//list选择框已选中数据默认勾选
	listCheckboxDefaultCheck(listId);

	//是否记住上一页勾选状态
	if (!dataCenter.list[listId]["reCheck"]) {
		dataCenter.list[listId]["listSelected"] = [];
	}


	//自动计算合计
	//FIXME:新增方法  
	// $('#' + listId + ' tbody input').unbind().change(function () {
	// 	var name = $(this).attr("name");
	// 	var elem = $("#"+listId+" tfoot [count='"+name+"']");
	// 	if(name && elem){
	// 		var fields = {};
	// 		fields[name]=name;
	// 		var jsonList = getJsonFromListForm(listId);
	// 		var sums = summaryFields(fields, jsonList);
	// 		elem.text(sums[name]);
	// 	}
	// });
}

/**
 * 哪些板块显示
 * 函数不对外开放，主要初始化表格中显示问题
 * @param {*} listId 
 */
function initListBlock(listId) {
	if (sysSet.developMode) {
		return;
	}
	var roleName = getListRole(listId);
	try {
		var showBlock = dataCenter['list'][listId]["show"]['showBlock'][roleName][dataCenter.page.pageNode][dataCenter.page.fromNode];
		if (showBlock && showBlock.length > 0) {
			showBlock.forEach(function (item) {
				// $("#" + listId + " #" + item).show();
				$("#" + listId + " ." + item).show();
				$("#" + listId + " ." + item).removeClass("zj-none-css");
			});
		}
		var hiddenBlock = dataCenter['list'][listId]['hiddenBlock'][roleName][dataCenter.page.pageNode][dataCenter.page.fromNode];
		if (hiddenBlock && hiddenBlock.length > 0) {
			hiddenBlock.forEach(function (item) {
				// $("#" + listId + " #" + item).hide();
				$("#" + listId + " ." + item).hide();
			});
		}

		//根据某个字段的值，配置块显示
		var field_showBlock = dataCenter['list'][listId]['show']['field_showBlock'][roleName][dataCenter.page.pageNode][dataCenter.page.fromNode];
		let listInfos = dataCenter['list'][listId].listInfos;
		if (isNotEmpty(field_showBlock)) {
			//字段
			for (let key in field_showBlock) {
				let field_obj = field_showBlock[key];
				//值
				for (let value in field_obj) {
					let field_obj_showBlock = field_obj[value];
					if (field_obj_showBlock && field_obj_showBlock.length > 0) {
						for (let index = 0; index < listInfos.length; index++) {
							const element = listInfos[index];
							if (element.hasOwnProperty(key) && isNotEmpty(element[key].toString()) && element[key].toString() == value) {
								field_obj_showBlock.forEach(function (item) {
									if (dataCenter.list[listId].isRow) {
										$("#" + listId + " .row:eq(" + (index + 1) + ")").find("." + item).show();
									} else {
										$("#" + listId + " .zjDC_listTable tbody tr:eq(" + (index + 1) + ")").find("." + item).show();
									}
								});
							}
						}
					}
				}
			}
		}

		//根据某个字段的值，配置块隱藏
		var field_hiddenBlock = dataCenter['list'][listId]['show']['field_hiddenBlock'][roleName][dataCenter.page.pageNode][dataCenter.page.fromNode];
		if (isNotEmpty(field_hiddenBlock)) {
			//字段
			for (let key in field_hiddenBlock) {
				let field_obj = field_hiddenBlock[key];
				//值
				for (let value in field_obj) {
					let field_obj_hiddenBlock = field_obj[value];
					if (field_obj_hiddenBlock && field_obj_hiddenBlock.length > 0) {
						for (let index = 0; index < listInfos.length; index++) {
							const element = listInfos[index];
							if (element.hasOwnProperty(key) && isNotEmpty(element[key].toString()) && element[key].toString() == value) {
								field_obj_hiddenBlock.forEach(function (item) {
									if (dataCenter.list[listId].isRow) {
										$("#" + listId + " .row:eq(" + (index + 1) + ")").find("." + item).hide();
									} else {
										$("#" + listId + " .zjDC_listTable tbody tr:eq(" + (index + 1) + ")").find("." + item).hide();
									}
								});
							}
						}
					}
				}
			}
		}

	} catch (e) {
		console.log('pageName:' + dataCenter['pageName'] + ",list:" + dataCenter['list'][listId] + ",没有配置showBlock");
	}
	var roleName2 = getListListListRole(listId);
	try {
		var hiddenBlock = dataCenter['list'][listId]['hiddenBlock'][roleName2][dataCenter.page.pageNode][dataCenter.page.fromNode];
		if (hiddenBlock && hiddenBlock.length > 0) {
			hiddenBlock.forEach(function (item) {
				$("#" + listId + " #" + item).hide();
			});
		}
	} catch (e) {
		console.log('pageName:' + dataCenter['pageName'] + ",list:" + dataCenter['list'][listId] + ",没有配置hiddenBlock");
	}
}

/**
 * 完善搜索项的功能，
 * 函数不对外开放
 * @param {*} listId 
 */
function renderListSearch(listId) {
	//显示的内容
	var role = getListSearchRole(listId);
	try {
		var isShow = dataCenter['list'][listId]['show']['searchRole'][role];
	} catch (e) {
		console.log('pageName:' + dataCenter['pageName'] + ",list:" + dataCenter['list'][listId] + ",没有配置searchRole");
	}
	var keys = Object.keys(isShow); //key的数组，方便操作
	if (keys && keys.length > 0) {
		$("#" + listId + " .zjDC_listSearch").find("input,select,textarea").each(function () {
			var name = $(this).attr("name");
			if (keys.indexOf(name) > -1) {
				$(this).parent().show();
			}
		});
	}

	//查询按钮
	$("#" + listId + " .zjDC_listSearch .zjDC_searchButton").unbind().click(function (e) {

		dataCenter['list'][listId]['page']['currPage'] = 1;
		//$('#' + listId + ' .currentPage').val(1).text(1);
		getListBlockData(listId);
	});

	//重置按钮
	$("#" + listId + " .zjDC_listSearch .zjDC_resetButton").unbind().click(function (e) {
		try {
			$("#" + listId + " .zjDC_listSearch input").each(function () {
				$(this).val('');

			});
			$("#" + listId + " .zjDC_listSearch select").each(function () {
				$(this).val('');

			});
			$("#" + listId + " .zjDC_listSearch textarea").each(function () {
				$(this).val('');
			});
		} catch (e) {
			console.log("deletePageCache");
		}
	});

	//取消按钮
	$("#" + listId + " .zjDC_listSearch .zjDC_cancelButton").unbind().click(function (e) {

	});

	//批量删除按钮
	$("#" + listId + " .zjDC_listSearch .zjDC_batchDeleteButton").unbind().click(function (e) {
		list_BatchDeleteSelectedInfos(listId);
	});


}


/**
 * 着色table中的tr部分
 * 函数不对外开放
 * @param {String} listId 
 * @param {String} formId 
 */
function renderListItem(listId, fomId) {
	// 记录表格红框
	if (fomId != undefined && fomId != null) {
		dataCenter['list'][listId]['redList'] = [];
		var borderColor = sysSet['color']['mustInput'];
		if (borderColor.indexOf("#") == 0) {
			borderColor = borderColor.colorRgb();
		}
		borderColor = borderColor.replace(/\s+/g, "").toLowerCase();
		$("#" + listId + " #" + fomId).each(function () {
			var id = $(this).find("input[name=id]").val();
			$(this).find("input,select,textarea").each(function () {
				//FIXME:border-color,borderTopColor 等CSS已经没有了，需要修改添加
				//TODO:刘硕 
				var inputBorderColor = $(this).css("border-color");
				//兼任ie
				var browserinfo = browserInfo();
				if (browserinfo.type == 'IE') {
					inputBorderColor = $(this).css('borderTopColor');
				}
				if (inputBorderColor.indexOf("#") == 0) {
					inputBorderColor = inputBorderColor.colorRgb();
				}
				inputBorderColor = inputBorderColor.replace(/\s+/g, "").toLowerCase();
				if (inputBorderColor == borderColor) {
					var name = $(this).attr("name");
					if (!isIncludeOfArray(dataCenter['list'][listId]['redList'], { 'id': id }, ['id'])) {
						dataCenter['list'][listId]['redList'].push({ 'id': id, 'redField': [] });
					}
					var jsonObj = getObjFromArrayById(dataCenter['list'][listId]['redList'], id);
					try {
						jsonObj['redField'].push(name);
					} catch (e) {
						jsonObj['redField'] = [];
						jsonObj['redField'].push(name);
					}
				}
			});
		});
	}
	// 表格数据
	var listInfos = dataCenter.list[listId].listInfos;
	if ((listInfos == null || listInfos.length == 0) && typeof (dataCenter.list[listId].getlistInfosData) == 'function') {
		listInfos = dataCenter.list[listId].listInfos = dataCenter.list[listId].getlistInfosData();
	}
	if (listInfos) {
		var listInfos = dataCenter.list[listId].listInfos;
		var sortByField = dataCenter.list[listId].sortByField;
		// 增加逻辑：按照指定指定排序 sortByField
		if (sortByField) {
			dataCenter.list[listId].listInfos = sortObjectArray(listInfos, sortByField);
		}
		// 前端筛选并处理分页
		if (dataCenter['list'][listId]['getPaginationConditions'] != null || $.isFunction(dataCenter['list'][listId]['getPaginationConditions'])) {
			var paginationConditions = dataCenter['list'][listId].getPaginationConditions();
			var newlistInfos = updateJsonArrayByCondition(listInfos, paginationConditions);
			dataCenter['list'][listId]['page']['total'] = newlistInfos.length; //筛选后的总数
			newlistInfos = getSubArrayByPage(newlistInfos, dataCenter['list'][listId]['page']['page'], dataCenter['list'][listId]['page']['num']);
			dataCenter['list'][listId]['page']['pages'] = newlistInfos.length == 0 ? 1 : Math.ceil(dataCenter['list'][listId]['page']['total'] / dataCenter['list'][listId]['page']['num']); //总页数
		} else {
			var newlistInfos = listInfos;
		}
		// 根据配置删除某些行数据
		var tempListInfos = newlistInfos;
		try {
			var roleList = dataCenter['list'][listId]['show']['listRole'][getListListRole(listId)];
			var deleteRows = roleList[dataCenter.page.pageNode][dataCenter.page.fromNode]['row'];
			if (deleteRows != undefined && deleteRows != null && deleteRows.length > 0) {
				var newDeletelistInfos = removeJsonArrayByPosArr(newlistInfos, deleteRows);
				if (newDeletelistInfos == undefined || newDeletelistInfos == null) {
					newDeletelistInfos = [];
				}
				newlistInfos = newDeletelistInfos;
			}
		}
		catch (e) {
			newlistInfos = tempListInfos;
		}
		// 渲染行
		if (dataCenter.list[listId].isRow) {
			renderListItemByRow(listId, newlistInfos);
		} else {
			renderListItemByData(listId, newlistInfos);
		}
		// 基础数据
		//FIXME:新增方法  先注释
		//renderDicListTable(listId);
		// 设置输入限制
		// inputSestrict(listId);
	} else {
		$("#" + listId + " .zjDC_listTable tbody tr").hide();
	}
	// 恢复红框
	if (fomId != undefined && fomId != null) {
		var borderColor = sysSet['color']['mustInput'];
		if (borderColor.indexOf("#") == 0) {
			borderColor = borderColor.colorRgb();
		}
		$("#" + listId + " #" + fomId).each(function () {
			var id = $(this).find("input[name=id]").val();
			var jsonObj = getObjFromArrayById(dataCenter['list'][listId]['redList'], id);
			if (jsonObj != undefined && jsonObj != null) {
				var arrName = jsonObj['redField'];
				$(this).find("input,select,textarea").each(function () {
					var name = $(this).attr("name");
					if (isInArray3(arrName, name)) {
						$(this).css("border", "1px solid " + sysSet.color.mustInput);
					}
				});
			}
		});
	}
}

/**
 * 着色table中的tr部分
 * 函数不对外开放
 * @param {String} listId 
 * @param {Array} listInfos 
 */
function renderListItemByData(listId, listInfos) {
	// 模板
	if (!dataCenter.list[listId].temphead) {
		dataCenter.list[listId].temphead = $("#" + listId + " .zjDC_listTable thead").length > 0 ? $("#" + listId + " .zjDC_listTable thead")[0].innerHTML : '';
	}
	if (!dataCenter.list[listId].temptfoot) {
		dataCenter.list[listId].temptfoot = $("#" + listId + " .zjDC_listTable tfoot").length > 0 ? $("#" + listId + " .zjDC_listTable tfoot")[0].innerHTML : '';
	}

	if (!dataCenter.list[listId].temprow) {
		dataCenter.list[listId].temprow = $("#" + listId + " .zjDC_listTable tbody tr").eq(0)[0].outerHTML;
	}
	// 隐藏行
	$("#" + listId + " .zjDC_listTable tbody tr").hide();
	// 删除第一行以外的行
	$("#" + listId + " .listTable tbody tr:gt(0)").remove();
	try {
		var tds = dataCenter.list[listId].show.listRole[getListListRole(listId)];
		tds = tds[dataCenter.page.pageNode][dataCenter.page.fromNode]['thead'];
		if (!tds) {
			tds = [];
		}
		// 隐藏的name
		var tdkeys = tds;
	} catch (e) {
		var tdkeys = [];
	}
	var head = $(dataCenter.list[listId].temphead);
	var tfoot = $(dataCenter.list[listId].temptfoot);
	// 先显示thead
	for (var i = head.find('th').length - 1; i >= 0; i--) {
		$(head).find("th").eq(i).show();
	}

	// 删除列信息
	var delDetails = [], delColSpans, maxRowspan;
	$(head).filter(function (i, data) {
		return data.nodeName == "TR"
	}).each(function (rowIndex) {
		var rowNum = 0, colNum = 0, trArray = [], tdInfo;
		$(this).find('th').each(function (colIndex) {
			var name = $(this).attr('name');
			var colSpan = $(this).attr("colspan") ? $(this).attr("colspan") * 1 : 1;
			var rowSpan = $(this).attr("rowspan") ? $(this).attr("rowspan") * 1 : 1;
			if (rowIndex == 0) {//第一行
				rowNum = rowSpan;
				colNum += colSpan;
				if (colIndex === 0) {
					maxRowspan = rowSpan;
				}
				tdInfo = { colSpan: colSpan, rowSpan: rowSpan, colNum: colNum, rowNum: rowNum, name: name };
				if (name && tdkeys.indexOf(name) > -1) {
					$(this).hide();
					tdInfo.isdelete = true;
				}
				trArray.push(tdInfo);
			} else {//不是第一行
				var rowLast = [].concat.apply([], delDetails);//前面所有行数据
				if (colIndex == 0) {//当前行第一个
					// 找到上面的td
					var tdDataArr = rowLast.filter(function (data) {
						return (data.rowNum + rowSpan) <= maxRowspan && data.colSpan >= colSpan && data.rowNum < rowIndex + 1;
					});
					if (tdDataArr.length === 0) {
						console.error('请检查thead，列表：' + listId)
					}
					var tdData = tdDataArr[0];
					rowNum = tdData.rowNum + rowSpan;
					colNum = tdData.colNum - tdData.colSpan + colSpan;
					tdInfo = { colSpan: colSpan, rowSpan: rowSpan, colNum: colNum, rowNum: rowNum, name: name };
					if (name && tdkeys.indexOf(name) > -1) {
						$(this).hide();
						tdInfo.isdelete = true;
					}
					trArray.push(tdInfo);
				} else {//
					// 前一个数据
					var colLast = trArray[trArray.length - 1];
					// 找到上面的td
					var tdDataArr = rowLast.filter(function (data) {
						return (data.rowNum + rowSpan) <= maxRowspan && data.colNum > colLast.colNum && data.rowNum < rowIndex + 1;
					});
					if (tdDataArr.length === 0) {
						console.error('请检查thead，列表：' + listId)
					} else {

						var tdData = tdDataArr[0];
						rowNum = tdData.rowNum + rowSpan;
						colNum = colLast.colNum + colSpan;
						tdInfo = { colSpan: colSpan, rowSpan: rowSpan, colNum: colNum, rowNum: rowNum, name: name };
						if (name && tdkeys.indexOf(name) > -1) {
							$(this).hide();
							tdInfo.isdelete = true;
						}
						trArray.push(tdInfo);
					}
				}
			}
		})
		if (trArray.length > 0) {
			delDetails.push(trArray);
		}
	})
	delColSpans = [].concat.apply([], delDetails).sort(function (a, b) {
		return a.colNum - b.colNum;
	}).filter(function (data) {
		return data.rowNum == maxRowspan;
	})
	// console.log(delColSpans)
	delColSpans = delColSpans.map(function (dt, index) {
		dt.num = index;
		return dt;
	}).filter(function (del) {
		return del.isdelete;
	}).map(function (del) {
		return del.num
	})
	// console.log('列listId：', listId, '删除信息：', delDetails, '配置：', tdkeys, '删除列序号', delColSpans)

	for (var i = tfoot.find('td').length - 1; i >= 0; i--) {
		$(tfoot).find("td").eq(i).show();
	}

	$("#" + listId + " .zjDC_listTable thead tr").remove();

	$("#" + listId + " .zjDC_listTable thead").append(head);

	$("#" + listId + " .zjDC_listTable tfoot tr").remove();

	$("#" + listId + " .zjDC_listTable tfoot").append(tfoot);

	$("#" + listId + " .zjDC_listTable thead tr").show();

	var tem = dataCenter.list[listId].temprow;
	if (listInfos.length == 0) {
		$("#" + listId + " .zjDC_listTable tbody tr:first").hide();
	}
	$("#" + listId + " .zjDC_listTable tbody tr:gt(0)").remove();
	for (let i = 0; i < listInfos.length; i++) {
		let info = listInfos[i];
		//info = escapeObjToHtmlObj(info);
		let item = tem.replace(/{{(.)+?}}/g, function (match) {
			var key = match.substring(2, match.length - 2).trim();

			//处理{{a.b.c}}这一类型
			let keyArr = key.split('[');
			// var keyArr = key.split('.');
			let val = info;

			for (let k in keyArr) {
				//框架在common.js中会在arry的上加上自定义属性
				if (k == "each" || k == "uniquelize" || k == "contains") {
					continue;
				}
				keyArr[k] = keyArr[k].replace(']', '')
				if (keyArr.hasOwnProperty(k) && isNotEmpty(val) && isNotEmpty(keyArr[k])) {
					if (isJSON(val[keyArr[k]])) {
						val = JSON.parse(val[keyArr[k]]);
					} else {
						val = val[keyArr[k]];
					}
				}
			}
			if (keyArr.length == 1) { // 值直接为json的情况
				val = info[key];
			}
			return val || val == 0 ? val : '';
		});
		//控制显示与隐藏
		var tr = $(item);
		// 删除tbody的列
		var colSpan_tbody = 0;
		tr.find('td').each(function () {
			if (delColSpans.indexOf(colSpan_tbody) > -1) {
				$(this).hide();
			}
			colSpan_tbody++;
		});

		$("#" + listId + " .zjDC_listTable tbody").append($(tr));

		$("#" + listId + " .zjDC_listTable tbody tr:last").show();
		/**作色list中的form */
		var id = $("#" + listId + " .zjDC_listTable tbody tr:last").attr("id");
		var oldId = id;
		var newFormId = listId + "___" + id;
		$("#" + listId + " .zjDC_listTable tbody tr:last").attr("id", newFormId);
		var pageNode = dataCenter.page.pageNode;
		var fromNode = dataCenter.page.fromNode;
		//dataCenter.user.addTempRole(info['infoRoleSys']);
		dataCenter.page.pageNode = info['infoNodeSys'];
		dataCenter.page.fromNode = info['infoStateSys'];
		if (typeof dataCenter.form[newFormId] != 'undefined') {
			initFormPage(newFormId);
		}
		dataCenter.page.pageNodeeNode = pageNode;
		dataCenter.page.fromNode = fromNode;
		//dataCenter.user.deleteTempRole();
		$("#" + listId + " .zjDC_listTable tbody tr:last").attr("id", oldId);
		/**作色list中的form结束 */
		if (i == 0) {
			$("#" + listId + " .zjDC_listTable tbody tr:first").hide();
		}
	}
	$("#" + listId + " .zjDC_listTable tfoot tr").each(function () {
		var colSpan_tfoot = 0;
		$(this).find('td').each(function () {
			if (delColSpans.indexOf(colSpan_tfoot) > -1) {
				$(this).hide();
			}
			colSpan_tfoot++;
		})
	});
	$("#" + listId + " .zjDC_listTable tbody").find("select").each(function () {
		var datavalue = $(this).attr("datavalue");
		$(this).val(datavalue);
	});
	$("#" + listId + " .zjDC_listTable tbody").find("input[type='checkbox']").each(function () {
		var datavalue = $(this).attr("datavalue");
		var value = $(this).val();
		if (value == datavalue) {
			$(this).prop('checked', true);
		}
	});
}

/**
 * 着色不含table的表格，每一行的class为row
 * 函数不对外开放
 * @param {String} listId 
 * @param {Array} listInfos 
 */
function renderListItemByRow(listId, listInfos) {
	if (!dataCenter.list[listId].temprow) {
		dataCenter.list[listId].temprow = $("#" + listId + " .row")[0].outerHTML;
	}
	$("#" + listId + " .row").hide();
	$("#" + listId + " .row:gt(0)").remove();
	var tem = dataCenter.list[listId].temprow;
	for (var i = 0; i < listInfos.length; i++) {
		var info = listInfos[i];
		//info = escapeObjToHtmlObj(info);
		let item = tem.replace(/{{(.)+?}}/g, function (match) {
			var key = match.substring(2, match.length - 2).trim();

			//处理{{a.b.c}}这一类型
			let keyArr = key.split('[');
			// var keyArr = key.split('.');
			let val = info;

			for (let k in keyArr) {
				//框架在common.js中会在arry的上加上自定义属性
				if (k == "each" || k == "uniquelize" || k == "contains") {
					continue;
				}
				keyArr[k] = keyArr[k].replace(']', '')
				if (keyArr.hasOwnProperty(k) && isNotEmpty(val)) {
					if (isJSON(val[keyArr[k]])) {
						val = JSON.parse(val[keyArr[k]]);
					} else {
						val = val[keyArr[k]];
					}
				}
			}
			if (keyArr.length == 1) { // 值直接为json的情况
				val = info[key];
			}
			return val || val == 0 ? val : '';
		});
		//控制显示与隐藏
		var row = $(item);
		if ($("#" + listId + " > .row:last-child").length == 1) {
			$("#" + listId + " > .row:last-child").after(item);
		} else if ($("#" + listId + " > * > .row:last-child").length == 1) {
			$("#" + listId + " > * > .row:last-child").after(item);
		} else {
			$(row).insertAfter("#" + listId + " .row:last");
		}
		$("#" + listId + " .row:last").show();
		/**作色list中的form */
		var id = $("#" + listId + " .row:last").attr("id");
		var oldId = id;
		var newFormId = listId + "___" + id;
		$("#" + listId + " .row:last").attr("id", newFormId);
		var pageNode = dataCenter.page.pageNode;
		var fromNode = dataCenter.page.fromNode;
		//dataCenter.user.addTempRole(info['infoRoleSys']);
		dataCenter.page.pageNode = info['infoNodeSys'];
		dataCenter.page.fromNode = info['infoStateSys'];
		if (typeof dataCenter.form[newFormId] != 'undefined') {
			initFormPage(newFormId);
		}
		dataCenter.page.pageNode = pageNode;
		dataCenter.page.fromNode = fromNode;
		//dataCenter.user.deleteTempRole();
		$("#" + listId + " .row:last").attr("id", oldId);
		/**作色list中的form结束 */
	}
	// if (i > 0) {
	// 	$("#" + listId + " .row:eq(0)").remove();
	// }
	$("#" + listId + " .row").find("select").each(function () {
		var datavalue = $(this).attr("datavalue");
		$(this).val(datavalue);
	});
	$("#" + listId + " .row").find("input[type='checkbox']").each(function () {
		var datavalue = $(this).attr("datavalue");
		var value = $(this).val();
		if (value == datavalue) {
			$(this).prop('checked', true);
		}
	});
}

function page_navgation(pagination, listId) {
	$('#' + listId + ' .M-box1').css('display', 'flex');
	var showData = pagination.pageSize;
	var TotalNumber = pagination.total;
	var endPage = Math.ceil(TotalNumber / showData);
	$('#' + listId + ' .M-box1').pagination({
		totalData: TotalNumber,
		jump: true,
		coping: true,
		showData: showData,
		homePage: '1',
		endPage: endPage,
		current: pagination.currPage,
		jumpBtnCls: 'jump-btn',
		jumpBtn: '跳转',
		callback: function (api) { }
	}, listId);
}
/**
 * 完善分页功能,显示多个页码，
 * 函数不对外开放
 * @param {String} listId 
 */
function renderPagination2(listId, formId) {
	//新版分页
	var pagination = dataCenter.list[listId].page; //分页信息
	$('#' + listId + ' .M-box1').css('display', 'flex');
	var endPage = Math.ceil(pagination.total / pagination.pageSize);
	$('#' + listId + ' .M-box1').pagination({
		totalData: pagination.total,
		jump: true,
		coping: true,
		showData: pagination.pageSize,
		homePage: '1',
		endPage: endPage,
		current: pagination.currPage,
		jumpBtnCls: 'jump-btn',
		jumpBtn: '跳转',
		callback: function (api) { }
	}, listId);
}

/**
 * 函数不对外开放
 */
function showPagination(listId) {
	var pagination = dataCenter['list'][listId]['page']; //分页信息
	$('#' + listId + ' .nextclick,#' + listId + ' .preclick').removeClass('layui-disabled');
	if (pagination.currPage <= 1) {
		$('#' + listId + ' .preclick').addClass('layui-disabled');
	} else if (pagination.currPage >= pagination.pages) {
		$('#' + listId + ' .nextclick').addClass('layui-disabled');
	}

	var total = pagination.total; //数据总量
	var currentPage = pagination.currPage; //当前页面
	var pages = pagination.pages;
	console.log(currentPage)
	//共多少页,当前页面,首页，最后一页
	$("#" + listId + " .zjDC_listPagination .pageCount").text('共' + total + '条');
	$("#" + listId + " .zjDC_listPagination .currentPage").val(currentPage);
	$("#" + listId + " .zjDC_listPagination .currentPage").text(currentPage);
	$("#" + listId + " .zjDC_listPagination .layui-laypage-next").attr('data-page', pages);
	$("#" + listId + " .zjDC_listPagination .first").val(1);
	$("#" + listId + " .zjDC_listPagination .last").text(pages);
}

/**
 * 获取formList集合json。
 * 对外开放
 * @param {String} tableListId 
 * @param {String} formId 
 * 如果是row，formId和class="row"共用一个标签，如果是table，formId在tr上设置
 */
function getJsonFromListForm(tableListId, formId) {
	if (isEmpty(formId)) {
		formId = "contentForm";
	}
	var formListJson = [];
	if (dataCenter.list[tableListId].isRow) {
		var rowList = $("#" + tableListId + " .row");
		for (var i = 1; i < rowList.length; i++) {
			var newFormId = tableListId + " .row:eq(" + i + ")#" + formId;
			nowTrJson = serializeForm(newFormId);
			formListJson.push(nowTrJson);
		}
	} else {
		var trList = $("#" + tableListId + " table tbody tr");
		for (var i = 1; i < trList.length; i++) {
			var newFormId = tableListId + " table tbody tr:eq(" + i + ")#" + formId;
			nowTrJson = serializeForm(newFormId);
			formListJson.push(nowTrJson);
		}
	}
	var listInfos = typeof dataCenter.list[tableListId].listInfos == "undefined" ? [] : dataCenter.list[tableListId].listInfos;
	for (var i = 0; i < listInfos.length; i++) {
		for (var j = 0; j < formListJson.length; j++) {
			if (formListJson[j].id == listInfos[i].id) {
				formListJson[j]['infoRoleSys'] = listInfos[i].infoRoleSys;
				formListJson[j]['infoNodeSys'] = listInfos[i].infoNodeSys;
				formListJson[j]['infoStateSys'] = listInfos[i].infoStateSys;
			}
		}
	}
	return formListJson;
}

/**
 * 检查list必填项
 * 对外开放
 * @param {String} tableListId 
 * @param {String} formId 
 * @returns {object} //{items:items,titles:titles}
 */
function checkListFormMustInput(tableListId, formId) {
	var listInfos = getJsonFromListForm(tableListId, formId);
	var items = [];
	var titles = [];
	for (var i = 0; i < listInfos.length; i++) {
		var info = listInfos[i];
		info = escapeObjToHtmlObj(info);
		if (dataCenter.list[tableListId].isRow) {
			$("#" + tableListId + " .row:eq(" + (i + 1) + ")").attr("id", newFormId);
		} else {
			$("#" + tableListId + " .zjDC_listTable tbody tr:eq(" + (i + 1) + ")").attr("id", newFormId);
		}
		var pageNode = dataCenter.page.pageNode;
		var fromNode = dataCenter.page.fromNode;
		//dataCenter.user.addTempRole(info['infoRoleSys']);
		dataCenter.page.pageNode = info['infoNodeSys'];
		dataCenter.page.fromNode = info['infoStateSys'];
		dataCenter.form[formId].down.formNewInfo = serializeForm(newFormId);
		var param = checkMustInput(newFormId);
		if (param.items.length > 0) {
			items = items.concat(param.items);
			titles = titles.concat(param.titles);
			formMustInputError(param.items, formId);
		}
		dataCenter.page.pageNode = pageNode;
		dataCenter.page.fromNode = fromNode;
		//dataCenter.user.deleteTempRole();
		if (dataCenter.list[tableListId].isRow) {
			$("#" + tableListId + " .row:eq(" + (i + 1) + ")").attr("id", "contentForm");
		} else {
			$("#" + tableListId + " .zjDC_listTable tbody tr:eq(" + (i + 1) + ")").attr("id", "contentForm");
		}
	}
	items = removeRepeatArray(items);
	titles = removeRepeatArray(titles);
	return { items: items, titles: titles };
}

/**
 * 根据模板和数据生成dom
 * 对外开放
 * @param {String} listId 
 * @param {Array} listInfos 
 * @returns {jqdom} 
 */
function returnListTempByData(listId, listInfos) {
	var items = "";
	var tem = dataCenter.list[listId].temprow;
	for (let i = 0; i < listInfos.length; i++) {
		let info = listInfos[i];
		//info = escapeObjToHtmlObj(info);
		let item = tem.replace(/{{(.)+?}}/g, function (match) {
			var key = match.substring(2, match.length - 2).trim();

			//处理{{a.b.c}}这一类型
			let keyArr = key.split('[');
			// var keyArr = key.split('.');
			let val = info;

			for (let k in keyArr) {
				//框架在common.js中会在arry的上加上自定义属性
				if (k == "each" || k == "uniquelize" || k == "contains") {
					continue;
				}
				keyArr[k] = keyArr[k].replace(']', '')
				if (keyArr.hasOwnProperty(k) && isNotEmpty(val)) {
					if (isJSON(val[keyArr[k]])) {
						val = JSON.parse(val[keyArr[k]]);
					} else {
						val = val[keyArr[k]];
					}
				}
			}
			if (keyArr.length == 1) { // 值直接为json的情况
				val = info[key];
			}
			return val || val == 0 ? val : '';
		});
		items += item;
	}
	return $(items);
}


/**
 * 备份list的权限配置
 * @param {String} formId
 */
function backupListState(listId) {
	if (typeof dataCenter.list[listId]['showBlockBack'] == 'undefined') {
		dataCenter.list[listId]['showBlockBack'] = {};
		$.extend(true, dataCenter.list[listId]['showBlockBack'], dataCenter.list[listId]['showBlock']);
	};
	if (typeof dataCenter.list[listId]['hiddenBlockBack'] == 'undefined') {
		dataCenter.list[listId]['hiddenBlockBack'] = {};
		$.extend(true, dataCenter.list[listId]['hiddenBlockBack'], dataCenter.list[listId]['hiddenBlock']);
	};
	if (typeof dataCenter.list[listId]['showBack'] == 'undefined') {
		dataCenter.list[listId]['showBack'] = {};
		$.extend(true, dataCenter.list[listId]['showBack'], dataCenter.list[listId]['show']);
	};
}

/**
 * 恢复List的权限配置
 * @param {String} listId
 */
function recoveryListState(listId) {
	if (typeof dataCenter.list[listId]['showBlockBack'] != 'undefined') {
		dataCenter.list[listId]['showBlock'] = {};
		$.extend(true, dataCenter.list[listId]['showBlock'], dataCenter.list[listId].showBlockBack);
	};
	if (typeof dataCenter.list[listId]['hiddenBlockBack'] != 'undefined') {
		dataCenter.list[listId]['hiddenBlock'] = {};
		$.extend(true, dataCenter.list[listId]['hiddenBlock'], dataCenter.list[listId].hiddenBlockBack);
	};
	if (typeof dataCenter.list[listId]['showBack'] != 'undefined') {
		dataCenter.list[listId]['show'] = {};
		$.extend(true, dataCenter.list[listId]['show'], dataCenter.list[listId].showBack);
	};
}

/**
 * 动态添加listRole,showBlock,hiddenBlock的数据
 * @param {String} listId
 */
//FIXME:新增方法  待了解
function concordanceList(listId) {
	recoveryListState(listId);
	var role = getListRole(listId);
	if (typeof dataCenter.list[listId].showBlock != "undefined" && typeof dataCenter.list[listId].showBlock[role] == 'undefined') {
		var data = concordanceListData(listId, 0);
		var showBlock = {};
		showBlock[dataCenter.page.pageNode] = {};
		showBlock[dataCenter.page.pageNode][dataCenter.page.fromNode] = data.showBlock;
		dataCenter.list[listId].showBlock[role] = showBlock;
	}
	var role2 = getListListRole(listId);
	if (typeof dataCenter.list[listId].show.listRole != "undefined" && typeof dataCenter.list[listId].show.listRole[role2] == 'undefined') {
		var data = concordanceListData(listId, 1);
		var listRole = {};
		listRole[dataCenter.page.pageNode] = {};
		listRole[dataCenter.page.pageNode][dataCenter.page.fromNode] = {};
		listRole[dataCenter.page.pageNode][dataCenter.page.fromNode]['thead'] = data.thead;
		listRole[dataCenter.page.pageNode][dataCenter.page.fromNode]['row'] = data.row;
		dataCenter.list[listId].show.listRole[role2] = listRole;
	}
	var role3 = getListListListRole(listId);
	if (typeof dataCenter.list[listId].hiddenBlock != "undefined" && typeof dataCenter.list[listId].hiddenBlock[role3] == 'undefined') {
		var data = concordanceListData(listId, 2);
		var hiddenBlock = {};
		hiddenBlock[dataCenter.page.pageNode] = {};
		hiddenBlock[dataCenter.page.pageNode][dataCenter.page.fromNode] = data.hiddenBlock;
		dataCenter.list[listId].hiddenBlock[role3] = hiddenBlock;
	}
}

/**
 * 多角色权限合并
 * listRole--thead:取交集(array)1
 * listRole--row:取交集(array)1
 * hiddenBlock:取交集(array)1
 * showBlock:取合集(array)1
 * 
 * @param {*} listId 
 * @param {0|1|2} type  0:showBlock 1:listRole 2:hiddenBlock 
 */
//FIXME:新增方法
function concordanceListData(listId, type) {
	if (type == 0) {
		var showBlock = [];
		var roles = getListRole(listId).split('+');
		roles.forEach(function (role, index) {
			var show = [];
			if (dataCenter.list[listId].hasOwnProperty('showBlock') && dataCenter.list[listId]['showBlock'].hasOwnProperty(role) && dataCenter.list[listId].showBlock[role].hasOwnProperty(dataCenter.page.pageNode) && dataCenter.list[listId].showBlock[role][dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
				show = dataCenter.list[listId].showBlock[role][dataCenter.page.pageNode][dataCenter.page.fromNode];
				showBlock = showBlock.concat(show);
			}
		})
		showBlock = removeRepeatArray(showBlock);
		return {
			'showBlock': showBlock,
		}
	} else if (type == 1) {
		var thead;
		var row;
		var roles = getListListRole(listId).split('+');
		roles.forEach(function (role, index) {
			var listRole = dataCenter.list[listId].show.listRole[role];
			var shead = [];
			if (listRole.hasOwnProperty(dataCenter.page.pageNode) && listRole[dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode) && listRole[dataCenter.page.pageNode][dataCenter.page.fromNode].hasOwnProperty('thead')) {
				shead = listRole[dataCenter.page.pageNode][dataCenter.page.fromNode].thead;
				if (typeof thead == 'undefined') {
					thead = shead;
				} else {
					thead = Array.intersect(thead, shead);
				}
			}
			var srow = [];
			if (listRole.hasOwnProperty(dataCenter.page.pageNode) && listRole[dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode) && listRole[dataCenter.page.pageNode][dataCenter.page.fromNode].hasOwnProperty('row')) {
				srow = listRole[dataCenter.page.pageNode][dataCenter.page.fromNode].row;
				if (typeof srow == 'undefined') {
					row = srow;
				} else {
					row = Array.intersect(row, srow);
				}
			}
		})

		thead = removeRepeatArray(thead);
		row = removeRepeatArray(row);
		return {
			'thead': thead,
			'row': row,
		}
	} else if (type == 2) {
		var hiddenBlock;
		var roles = getListListListRole(listId).split('+');
		roles.forEach(function (role, index) {
			var hidden = [];
			if (dataCenter.list[listId].hasOwnProperty('hiddenBlock') && dataCenter.list[listId]['hiddenBlock'].hasOwnProperty(role) && dataCenter.list[listId].hiddenBlock[role].hasOwnProperty(dataCenter.page.pageNode) && dataCenter.list[listId].hiddenBlock[role][dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
				hidden = dataCenter.list[listId].hiddenBlock[role][dataCenter.page.pageNode][dataCenter.page.fromNode];
				if (typeof hiddenBlock == 'undefined') {
					hiddenBlock = hidden;
				} else {
					hiddenBlock = Array.intersect(hiddenBlock, hidden);
				}
			}
		})
		hiddenBlock = removeRepeatArray(hiddenBlock);
		return {
			'hiddenBlock': hiddenBlock,
		}
	}
}

/**
 * 表格内容计算
 * @param {String} listId
 * @param {$dom} tr
 * @param {Object} computing
 */
//FIXME:新增方法
function recalculate(listId, tr, computing) {
	for (var name in computing) {
		var expression = computing[name].expression;
		var point = typeof computing[name].point != 'undefined' ? computing[name].point : 2;
		var item = expression.replace(/{{(.)+?}}/g, function (match) {
			var key = match.substring(2, match.length - 2).trim();
			$(tr).find("[name=" + key + "]").addClass("computingOfexpression").attr('computingOflistid', listId);
			return "thousands2Num($(tr).find('[name=" + key + "]').val())";
		})
		var goal = eval(item);
		if (isNaN(goal) || goal == Infinity || thousands2Num(goal) == 0 || thousands2Num(goal) < 0.000001) {
			goal = 0;
		} else if (goal.toFixed(point).split('.').length > 1) {
			goal = formatText(goal.toFixed(point).split('.')[0]) + "." + goal.toFixed(point).split('.')[1];
		} else {
			goal = formatText(goal.toFixed(point).split('.')[0])
		}
		$(tr).find("[name=" + name + "]").val(goal);
	}
}

/**
 * 表头固定
 * @param {String} id
 *///FIXME:新增方法 修改
//TODO:刘硕 
function tableFixing(id) {
	var tableCont = document.querySelector("#" + id + " .zjDC_listTable");
	function scrollHandle(e) {
		// console.log(this);            
		var scrollTop = this.scrollTop;
		this.querySelector('thead').style.transform = 'translateY(' + scrollTop + 'px)';
	}
	tableCont.addEventListener('scroll', scrollHandle);
}

/**
 * 表格固定列
 * @param {Array} arr
 * @param {String} listId
 */
//FIXME:新增方法 修改
//TODO:刘硕 
function fixedCol(arr, listId) {
	var colArr = arr || [];
	colArr.forEach(function (val) {
		$("#" + listId + " .zjDC_listTable").scroll(function () {
			var left = $("#" + listId + " .zjDC_listTable").scrollLeft(); // 获取盒子滚动距离
			var trsThead = $("#" + listId + " .zjDC_listTable table thead tr");   // 获取表格所有的tr
			var trsTbody = $("#" + listId + " .zjDC_listTable table tbody tr");
			var trsTfoot = $("#" + listId + " .zjDC_listTable table tfoot tr");
			// 获取每一行下面的td或者th,设置相对定位，偏移距离为盒子滚动的距离即 left
			trsThead.each(function (i) {
				$(this).find("." + val).css({ "position": "relative", "top": "0px", "left": left, "background": "white" });
			});
			trsTbody.each(function (i) {
				$(this).find("." + val).css({ "position": "relative", "top": "0px", "left": left, "background": "white" });
			});
			trsTfoot.each(function (i) {
				$(this).find("." + val).css({ "position": "relative", "top": "0px", "left": left, "background": "white" });
			});
		});
	});
}


/**
 * 获取listSearch表单中所有的input的键值对
 * @param {String} listId
 * @return {Object} 表单中所有的input，slect,textarea的name-value键值对
 */
function serializeListSearch(listId) {
	// 创建空的表单对象
	var vs = {};
	// 遍历input
	$("#" + listId + ' .zjDC_listSearch  input').each(function () {
		var name = $(this).attr('name');
		var value = trim($(this).val(), 2);
		var condition = $(this).attr('condition');
		// 表单配置对象infoId有值，则不再处理id属性
		if (name == "id" && isNotEmpty(vs['id'])) {

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
		vs[name] = {
			'value': vs[name],
			'condition': condition,
		}
	});
	// 遍历select
	$("#" + listId + ' .zjDC_listSearch select').each(function () {
		if (isNotEmpty($(this).attr('name')) && isNotEmpty($(this).val())) {
			var condition = $(this).attr('condition');
			vs[$(this).attr('name')] = {
				'value': trim($(this).val(), 2),
				'condition': condition, 
			}
			// vs[$(this).attr('name')] = trim($(this).val(), 2);
		}
	});
	// 遍历 textarea
	$("#" + listId + ' .zjDC_listSearch textarea').each(function () {
		var name = $(this).attr('name');
		var condition = $(this).attr('condition');
		if (isNotEmpty(name) && isNotEmpty($(this).val())) {
			vs[name] = trim($(this).val(), 2);
		}
		else if (isNotEmpty(name)) {
			//if (isNotEmpty(trim(formInfo[name], 2))) {
			vs[name] = '';
			//}
		}
		vs[name] = {
			'value': vs[name],
			'condition': condition, 
		}
	});
	return vs;
}

/**
 * list选择框勾选事件委托
 * @param {String} listId
 */
function listCheckboxCheckEvent(listId) {
	$('#' + listId + ' .zjDC_listCheckBox').unbind().click(function () {
		//获取当前行信息id
		let infoId = $(this).attr('zjDC_infoId');
		let listSelected = dataCenter.list[listId]["listSelected"]
		if (isEmpty(listSelected)) {
			listSelected = [];
		};
		//勾选
		if ($(this).prop("checked")) {
			//获取数据
			var info = getJsonArrayById(dataCenter.list[listId]["listInfos"], infoId)
			if (!$.isEmptyObject(info)) {
				listSelected.push(info);
			};

		} else {
			//删除数据
			listSelected = deleteJsonArrayById(listSelected, infoId)
		}
		dataCenter.list[listId]["listSelected"] = listSelected;
		checkIsAllSelected(listId);
		//每行勾选框回调--可以重载
		listCheckboxCheckCallBack(listId);
	});

}
//每行勾选框回调--可以重载
function listCheckboxCheckCallBack(listId) {

}


/**
 * list选择框已选中数据默认勾选
 * @param {String} listId
 */
function listCheckboxDefaultCheck(listId) {
	$('#' + listId + ' .zjDC_listCheckBox').each(function () {
		//获取当前行信息id
		let infoId = $(this).attr('zjDC_infoId');
		if (isEmpty(infoId)) {
			return false;
		};
		let listSelected = dataCenter.list[listId]["listSelected"]
		if (isEmpty(listSelected)) {
			listSelected = [];
			return false;
		};
		for (let index = 0; index < listSelected.length; index++) {
			const element = listSelected[index];
			let selectedId = element.id;
			if (infoId == selectedId) {
				$(this).prop('checked', true);
			}
		}
	});
	checkIsAllSelected(listId);
}

/**
 * list标题行全选按钮事件
 * @param {String} listId
 */
function listCheckboxAllCheckEvent(listId) {
	$('#' + listId + ' .zjDC_listAllCheckBox').unbind().click(function () {
		let listSelected = dataCenter.list[listId]["listSelected"]
		if (isEmpty(listSelected)) {
			listSelected = [];
		};
		//勾选
		if ($(this).prop("checked")) {
			$('#' + listId + ' .zjDC_listCheckBox').each(function () {
				//获取当前行信息id
				let infoId = $(this).attr('zjDC_infoId');

				//勾选
				if (!$(this).prop("checked")) {
					//获取数据
					var info = getJsonArrayById(dataCenter.list[listId]["listInfos"], infoId)
					if (!$.isEmptyObject(info)) {
						listSelected.push(info);
					}
					$(this).prop('checked', true);
				}
			});
		} else {
			$('#' + listId + ' .zjDC_listCheckBox').each(function () {
				//获取当前行信息id
				let infoId = $(this).attr('zjDC_infoId');
				//取消勾选
				if ($(this).prop("checked")) {
					//删除数据
					listSelected = deleteJsonArrayById(listSelected, infoId)
					$(this).prop('checked', false);
				}
			});
		}
		dataCenter.list[listId]["listSelected"] = listSelected
		//全选按钮回调--可以重载
		listCheckboxAllCheckCallBack(listId);
	});
}
//全选按钮回调--可以重载 
function listCheckboxAllCheckCallBack(listId) {

}

/*
* 当任一checkBox勾选，查看是否所有checkbox都已经选中
* 是：勾选全选按钮  否：取消勾选全选按钮
*/
function checkIsAllSelected(listId) {
	var isChecked = true;
	$('#' + listId + ' .zjDC_listCheckBox').each(function () {
		//模版行不统计 FIXME:模版行的判断待确认
		if (!($(this).attr("zjDC_infoId") == "{{id}}")) {
			if (!$(this).prop("checked")) {
				isChecked = false;
			}
		}

	})
	if ($('#' + listId + ' .zjDC_listCheckBox').length == 0) {
		isChecked = false;
	}
	if (isChecked) {
		$('#' + listId + ' .zjDC_listAllCheckBox').prop('checked', true);
	} else {
		$('#' + listId + ' .zjDC_listAllCheckBox').prop('checked', false);
	}

}

/*
 * list批量删除
 * @param {String} listId
 * @param {arry} list 已勾选数据
*/
function list_BatchDeleteSelectedInfos(listId) {
	let list = dataCenter.list[listId]["listSelected"];
	if (isEmpty(list) || list.length == 0) {
		alertDialogHide("提示", "请选择内容!", $(this)[0], 1500, function (element) {

		})
	} else {
		confirmDialog("提示", "请确认是否删除!", function () {
			dcEvent(listId, "beforeBatchDelete", "list", list);
			if (dataCenter['list'][listId]['isPersist']) {
				let ids = "";
				list.forEach(element => {
					ids += element.id + ",";
				});
				ids = ids.substring(0, ids.length - 1);
				batchDelete(dataCenter.list[listId]['classId'], ids,
					function (data) {
						alertDialogHide("提示", "删除成功！", "", 1000, function () {
							getListBlockData(listId);
							dcEvent(listId, "afterBatchDelete", "list", list);
						})
					},
					function () {

					}
				)
			} else {
				var newListInfos = [];
				list.forEach(element => {
					dataCenter.list[listId].deleteIds.push(id);
					newListInfos = deleteJsonArrayById(dataCenter.list[listId].listInfos, infoId);
				});
				alertDialogHide("提示", "删除成功！", element, 1000, function (element) {
					renderListByData(listId, newListInfos);
				})

				dcEvent(listId, "afterBatchDelete", "list", list);
			}
		}, function () {
			$("#confirmDialogId").remove();
			$(".zj-modal").hide();
		})
	}
}

/*
 * list删除某行数据
 * @param {String} listId
 * @param {arry} list 已勾选数据
*/
function list_DeleteSelectedInfo(listId, element) {
	let infoId = $(element).attr('zj-infoId');
	confirmDialog("提示", "请确认是否删除！", function () {
		dcEvent(listId, "beforeDelete", "list", infoId)
		if (dataCenter['list'][listId]['isPersist']) {
			//持久化代码
			let parmas = {};
			parmas.infoClass = {
				id: dataCenter.list[listId]['classId'],
			}
			parmas.infoClass = JSON.stringify(parmas.infoClass);
			parmas.info = JSON.stringify({
				id: infoId,
			});
			zjxxAjaxDelete(parmas, function (data) {
				alertDialogHide("提示", "删除成功！", "", 1000, function () {
					getListBlockData(listId);
					dcEvent(listId, "afterDelete", "list", infoId);
				})
			}, function () {

			})
		} else {
			dataCenter.list[listId].deleteIds.push(id);
			var newListInfos = deleteJsonArrayById(dataCenter.list[listId].listInfos, infoId);
			alertDialogHide("提示", "删除成功！", element, 1000, function (element) {
				renderListByData(listId, newListInfos);
			})

			dcEvent(listId, "afterDelete", "list", infoId)
		}

	}, function () {
		$("#confirmDialogId").remove();
		$(".zj-modal").hide();
	})
}

//列表最后一页第五页删除全部数据后，页面只显示第四页，但列表未显示第四页的数据
//最后一页，且不是第一页，当前页数据为0，页码--，重新getListBlockData
function reloadListByLastPage(listId) {
	var pageObj = dataCenter.list[listId]['page'];
	//最后一页，且不是第一页，数据为0  pageObj.pages   && dataCenter.list[listId].listInfos.length == 0
	if (pageObj.currPage >= pageObj.pages && pageObj.currPage != 1 && dataCenter.list[listId].listInfos.length == 0) {
		pageObj.currPage--;
		getListBlockData(listId);
		return true;
	}
	return false;
}


//获取数据返dom结构
function getListBlockDataReturnDom(listId, fomId, callback) {
	//接口调用开始时间
	dataCenter.list[listId]["beginTime"] = new Date();
	var getListParams = dataCenter.list[listId]['getParamFun'];
	if (getListParams) {
		var parmas = getListParams(listId);
	} else {
		var parmas = getSeachParma(listId);
	}
	zjxxAjaxList(parmas, function (result) {
		//接口调用结束时间
		dataCenter.list[listId]["endTime"] = new Date();
		dataCenter.list[listId]["ajaxTime"] = dataCenter.list[listId]["endTime"] - dataCenter.list[listId]["beginTime"];
		if (result.flag == 200) {
			//判断是否需要替换页面模版
			if (dataCenter.list[listId]['isNeedTemp']) {
				if (isNotEmpty(data["infoClass"]) && isNotEmpty(data["infoClass"]["temp"])) {
					$("#" + list).html(data["infoClass"]["temp"]);
				}
			}
			// dataCenter.list[listId].jsondata = result;
			dataCenter.list[listId].listDownInfos = result.infos; //存储原始数据
			dataCenter.list[listId].listInfos = result.infos; //将页面数据放在dataCenter.pageInfo
			for (var i = 0; i < dataCenter.list[listId].listInfos.length; i++) {
				var dataObj = dataCenter.list[listId].listInfos[i];
				escapeObjToHtmlObj(dataObj);
			}
			dataCenter.list[listId]['page']['total'] = result['page'] ? result['page']['infoCount'] : 0; //分页信息
			dataCenter.list[listId]['page']['pages'] = result['page'] ? result['page']['pageCount'] : 0; //总页数	
			//列表最后一页第五页删除全部数据后，页面只显示第四页，但列表未显示第四页的数据
			if (reloadListByLastPage(listId)) {
				return false;
			};
			dcEvent(listId, "beforeRender", "list", dataCenter.list[listId].listInfos)
			let dom = returnListTempByData(listId, dataCenter.list[listId].listInfos)
			callback(dataCenter.list[listId].listInfos,dom)
		}
	}, function err(errMsg) {
		var err = "err" + firstCase(listId);
		if (typeof window[err] == "function") {
			eval(window[err]());
		} else {
			alert(errMsg);
		}

	});
}