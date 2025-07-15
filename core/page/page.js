//监听浏览器的回退。禁止页面回退。
if (window.history && window.history.pushState) {
    try {
        var oldSession = JSON.parse(sessionStorage.getItem('oldSession'));
        if(window.performance.navigation.type == 2){
            if (oldSession.length > 1) {
                var backSession = oldSession.pop();
                var backPageName = backSession['page']['pageName'];
                sessionStorage.setItem('oldSession', JSON.stringify(oldSession));
                window.history.pushState('forward', null, backPageName + ".html");
                //location.reload();
            }
        }
        if (oldSession.length > 1) {
            window.history.pushState('forward', null, window.location.href);
            window.history.forward(1);
        }
    } catch (e) {
        dataCenter['oldSession'] = [];
    }
}

//dataCenter初始化，主要是session初始化
dataCenter._init();

//页面生成
// pageReady();

$(document).ready(function (e) {

    $(document).on("blur", "input,select,textarea", function () {
        if (isNotEmpty($(this).val()) && $(this).val() != '请选择' && ($(this)[0].clientTop == "1" || $(this).css("border-width") == "1px") && $(this).attr("specialVertify") != "true") {
            $(this).css("border", "1px solid #ccc");
        }
    });

    //绑定列表中自动计算事件
    //FIXME:新增逻辑
    $("body").on("blur", "table .computingOfexpression", function () {
        var listId = $(this).attr('computingOflistid');
        var computing = dataCenter.list[listId].computing;
        recalculate(listId, $(this).parents('tr'), computing, true);
    })

    //新建按钮
	$("body .zjDC_addButton").unbind().click(function (e) {
		let pageUrl = $(this).attr('zj-pageUrl');
		let self = $(this).attr('zj-self');
        let state = $(this).attr('zj-state');
        //备份原始to，新开页面会改变当前页面的to
        let dataCenterTo =  jsonClone(dataCenter["to"]) ;
		dataCenter.to = {
            pageNode: 1,
            fromNode: "add",
            state: state?state:"info"
        }
		toUrl (pageUrl, self==0?false:true,false) ;
        //还原to
        dataCenter.to = dataCenterTo;
	});

    initPage();
    


});

//控制页面的input的状态（显示、隐藏、disable）
function initPage() {

    //加载模板到页面
    $("div[template]").each(function (item) {
        $(item).html(templateObj[$(item).attr("template")]);
    });
    //页面功能权限
    funPermission();
    $(".zj-funpermission-css").removeClass("zj-none-css")
    //page主信息权限
    getPageInfoPermission();
    //页面整体配置渲染
    initPageShowBlock() ;
    initPageHiddenBlock() ;
    // //插件初始化
    // initPagePlugIn();
    //语音切换
    switchLanguage();

    


    //img渲染，数据变化事件绑定
    const zj_img_list = document.querySelectorAll('img');
    zj_img_list.forEach(element => {
        renderImg(element);
        observer.observe(element, { attributes: true, attributeFilter: ['zjsrc'] });
    });
   

    var type = getPageType();
    Object.keys(dataCenter.form).forEach(function (formId) {
        if (formId.split("___").length < 2) {
            formPermission(formId);
            initFormPage(formId); //修改页面
        }
    });
    
    if (dataCenter.state == "draft") {
        getAllFormBlockData(sysSet.mainFormId);
    } else {
        if (type == 'form') {
            getAllFormBlockData(sysSet.mainFormId);
        }
        else if (type == 'list') {
            //获取数据并加载数据
            getListBlockData(sysSet.mainListId);
        }
    }

    
    
    
   
}

/**
 * 重新加载页面显示
 * @param {String} NAN
 */
function reloadPage() {
    Object.keys(dataCenter.form).forEach(function (formId) {
        if (formId.split("___").length < 2 && $("#" + formId).length > 0) {
            initFormPage(formId);
        }
    });
    Object.keys(dataCenter.list).forEach(function (listId) {
        if ($("#" + listId).length > 0) {
            var listData = getJsonFromListForm(listId);
            var deleteIds = typeof dataCenter.list[listId].deleteIds == 'undefined' ? [] : dataCenter.list[listId].deleteIds;
            if(!dataCenter.list[listId].listInfos){
                dataCenter.list[listId].listInfos = [];
            }
            var newListInfos = mergeTwoNewArray(dataCenter.list[listId].listInfos, listData, "id", deleteIds);
            renderListByData(listId, newListInfos);
        }
    });
}

/**
 * 提交页面,先检查必填项
 * @param {String} listId
 * @param {Function} callback
 */
function checkPageForm(formIds, listIds, callback) {
	var titles = [];
	var items = [];
	// 校验指定表单的必填项
	if (formIds) {
		formIds = formIds.split(",");
		for (i = 0; i < formIds.length; i++) {
			var formId = formIds[i];
			dataCenter.form[formId]['down']['formNewInfo'] = serializeForm(formId);
			var params = checkMustInput(formId);
			if (params.items.length > 0) {
				items = items.concat(params.items);
				titles = titles.concat(params.titles);
			}
		}
	}
	// 校验指定列表的必填项
	if (listIds) {
		listIds = listIds.split(",");
		for (i = 0; i < listIds.length; i++) {
			var listId = listIds[i];
			var params = checkListFormMustInput(listId);
			if (params.items.length > 0) {
				items = items.concat(params.items);
				titles = titles.concat(params.titles);
			}
		}
	}
	// 提示
	if (items.length > 0) {
		showDialog('mustInputPopup', 'mustInputForm');
		for (var i = 0; i < titles.length; i++) {
			titles[i] = { title: titles[i] }
		}
		renderListByData('mustInputPopup', titles);
		return;
	}
	callback();
}

/*
=====================================================================================
=================================角色处理=================================
=====================================================================================
*/
/**
 * 角色处理
 * @param {*} type
 * @param {*} roleShow
 */
function getRole(roleShow, infoId, infoPid, infoPids) {
    var userRoles = [];
    if (dataCenter.user.roles.length < 1) {
        return 'allRole';
    }
    else {
        dataCenter.user.roles.forEach(function (role) {
            //TODO:先保证信息角色代码运行正常，项目角色，任务角色代码待讨论
            if(role.roleType == 1){//系统角色
                userRoles.push(role['roleName']);
            }else if(role.roleType == 2){//信息角色
                userRoles.push(role['roleName']);
            }else if(role.roleType == 2 && (role.orgId == infoId ||
                 role.orgId == infoPid )){//项目角色
                userRoles.push(role['roleName']);
            }else if(role.roleType == 2 && (role.orgId == infoId || 
                role.orgId == infoPid || 
                infoPids.indexOf(role.orgId)>-1)){//任务角色
                userRoles.push(role['roleName']);
            }
        });
    }
    userRoles = removeRepeatArray(userRoles);
    roleShow = removeRepeatArray(roleShow);
    var roles = roleShow.filter(function (item, index, self) {
        return userRoles.indexOf(item) > -1;
    });

    if (roles == null || roles.length == 0) {
        return "allRole";
    }
    else {
        roles = removeRepeatArray(roles);
        roles = roles.sort();
        return roles.join("+");
    }
}

/**
 * 根据人员角色名返回form表单的人员角色，如果角色不清晰，就使用allRole的通用角色
 * @param {*} formId
 */
function getFormRole(formId) {
    var roleShow = Object.keys(dataCenter['form'][formId]['roleShow']);
    var infoId = dataCenter['form'][formId]["down"]["formInfo"].id;
    var infoPid = dataCenter['form'][formId]["down"]["formInfo"].pid;
    return getRole(roleShow, infoId, infoPid);
}

/**
 * 根据人员角色名返回列表的人员角色，如果角色不清晰，就使用allRole的通用角色
 * @param {*} listId
 */
function getListSearchRole(listId) {
    var roleShow = Object.keys(dataCenter.list[listId]['show']['searchRole']);
    return getRole(roleShow);
}

/**
 * 获取控制列表表头的权限
 * @param {*} listId
 */
function getListListRole(listId) {
    try {
        var roleShow = Object.keys(dataCenter.list[listId]['show']['listRole']);
    }
    catch (e) {
        var roleShow = [];
    }
    return getRole(roleShow);
}

/**
 * 获取控制列表的权限
 * @param {*} listId
 */
function getListRole(listId) {
    try {
        var roleShow = Object.keys(dataCenter['list'][listId]['showBlock']);

    } catch (e) {
        var roleShow = [];
    }
    return getRole(roleShow);

}

/**
 * 获取控制列表的权限
 * @param {*} listId
 */
function getListListListRole(listId) {
    try {
        var roleShow = Object.keys(dataCenter['list'][listId]['hiddenBlock']);

    } catch (e) {
        var roleShow = [];
    }
    return getRole(roleShow);

}

/**
 * 整体页showBlock配置
 * @param {*}
 */
 function initPageShowBlock() {
    if (dataCenter.hasOwnProperty("showBlock") && dataCenter['showBlock'].hasOwnProperty(dataCenter.page.pageNode) && dataCenter['showBlock'][dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
        var showBlock = dataCenter['showBlock'][dataCenter.page.pageNode][dataCenter.page.fromNode];
        if (showBlock && showBlock.length > 0) {
            showBlock.forEach(function (item) {
                if(isNotEmpty(item)){
                    // $("#" + item).show();
                    $("#" + item).removeClass("zj-none-css");
                }
            });
        }
    }
}


/**
 * 整体页hiddenBlock配置
 * @param {*}
 */
 function initPageHiddenBlock() {
    if (dataCenter.hasOwnProperty("hiddenBlock") && dataCenter['hiddenBlock'].hasOwnProperty(dataCenter.page.pageNode) && dataCenter['showBlock'][dataCenter.page.pageNode].hasOwnProperty(dataCenter.page.fromNode)) {
        var hiddenBlock = dataCenter['hiddenBlock'][dataCenter.page.pageNode][dataCenter.page.fromNode];
        if (hiddenBlock && hiddenBlock.length > 0) {
            hiddenBlock.forEach(function (item) {
                if(isNotEmpty(item)){
                    // $("#" + item).hide();
                    $("#" + item).addClass("zj-none-css");
                }
            });
        }
    }
}

function renderImg(element) {
    let src = element.getAttribute("zjsrc");
    let thumbnail =element.getAttribute("zjthumbnail");
    zjxxSetImgSrc(element,src,thumbnail);
    // //如果是缩略图，就走缩略图逻辑
    // if(isNotEmpty(thumbnail) && thumbnail.indexOf("{{") == -1){
    //     if(isNotEmpty(src) && src.indexOf("{{") == -1){
    //         let token = localStorage.getItem("token");
    //         src = sysSet.dataUrl+"/"+src+"/"+token+"/"+thumbnail+"/download/"
    //         element.setAttribute("src",src);
    //     }
    // }else{
    //     if(isNotEmpty(src) && src.indexOf("{{") == -1){
    //         loadFile(src,'img',"",'show',element)
    //     }
    // }
}


 // 监听 img 元素的 zjsrc 属性变化
 const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'zjsrc') {
        console.log('img src changed');
        // 处理属性变化的逻辑
        let src = mutation.target.getAttribute("zjsrc");
        let thumbnail = mutation.target.getAttribute("zjthumbnail");
        zjxxSetImgSrc(mutation.target,src,thumbnail);
        // //如果是缩略图，就走缩略图逻辑
        // if(isNotEmpty(thumbnail) && thumbnail.indexOf("{{") == -1){
        //     if(isNotEmpty(src) && src.indexOf("{{") == -1){
        //         let token = localStorage.getItem("token");
        //         src = sysSet.dataUrl+"/"+src+"/"+token+"/"+thumbnail+"/download/"
        //         mutation.target.setAttribute("src",src);
        //     }
        // }else{
        //     if(isNotEmpty(src) && src.indexOf("{{") == -1){
        //         loadFile(src,'img',"",'show',mutation.target)
        //     }
        // }
        
      
      }
    }
  });


  const observer1 = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
            // 处理新增的子、孙节点及其属性变化的逻辑
            renderNodeIsImg(node);
        }
      }
    }
  });
  
  // 监听目标节点的子节点变化
  const html_targetNode = document.querySelector('body');
  observer1.observe(html_targetNode, { childList: true, subtree: true  });

// 渲染当前节点img
  function renderNodeIsImg(node) {
    if (node.nodeName === 'IMG') {
        // 处理属性变化的逻辑
        let src = node.getAttribute("zjsrc");
        let thumbnail =node.getAttribute("zjthumbnail");
        zjxxSetImgSrc(node,src,thumbnail);
        // if(isNotEmpty(thumbnail) && thumbnail.indexOf("{{") == -1){
        //     if(isNotEmpty(src) && src.indexOf("{{") == -1){
        //         let token = localStorage.getItem("token");
        //         src = sysSet.dataUrl+"/"+src+"/"+token+"/"+thumbnail+"/download/"
        //         node.setAttribute("src",src);
        //     }
        // }else{
        //     if(isNotEmpty(src) && src.indexOf("{{") == -1){
        //         loadFile(src,'img',"",'show',node)
        //     }
        // }
        // 处理 img 标签被添加的逻辑
        observer.observe(node, { attributes: true, attributeFilter: ['zjsrc'] });
      }
      //递归处理子、孙节点
      recursionRenderNodeIsImg(node)
  }

  //设置图片src属性
  function zjxxSetImgSrc(node, zjsrc , thumbnail){
    if(isNotEmpty(zjsrc) && zjsrc.indexOf("{{") == -1){
        let token = localStorage.getItem("token");
        token = token ? token : "visitor";
        let src = sysSet.dataUrl+""+zjsrc+"/"+token+"/download/"	
        if(isNotEmpty(thumbnail) && thumbnail.indexOf("{{") == -1){
            src += thumbnail
        }
        node.setAttribute("src",src);
    }
  }

  // 递归处理子、孙节点
  function recursionRenderNodeIsImg(node) {
    if(node.childNodes.length>0){
        node.childNodes.forEach(function(item){
            if(item.nodeName == 'IMG'){
                let src = item.getAttribute("zjsrc");
                let thumbnail =item.getAttribute("zjthumbnail");
                zjxxSetImgSrc(item,src,thumbnail);
                //如果是缩略图，就走缩略图逻辑
                // if(isNotEmpty(thumbnail) && thumbnail.indexOf("{{") == -1){
                //     if(isNotEmpty(src) && src.indexOf("{{") == -1){
                //         let token = localStorage.getItem("token");
                //         src = sysSet.dataUrl+"/"+src+"/"+token+"/"+thumbnail+"/download/"
                //         item.setAttribute("src",src);
                //     }
                // }else{
                //     if(isNotEmpty(src) && src.indexOf("{{") == -1){
                //         loadFile(src,'img',"",'show',item)
                //     }
                // }
                // 处理 img 标签被添加的逻辑
                observer.observe(item, { attributes: true, attributeFilter: ['zjsrc'] });
            }else{
                recursionRenderNodeIsImg(item);
            }
        })
    }
  }
//FIXME:funPermission
//页面整合功能权限
function funPermission() {
    //功能权限数据
    let permissionList = localStorage.getItem("permissionList"); 
    if(isNotEmpty(permissionList)){
        permissionList = JSON.parse(permissionList);
    }else{
        return false;
    }
    for (let index = 0; index < permissionList.length; index++) {
        //当前页面权限，或者全部页面权限
        if((permissionList[index].title == "all" || permissionList[index].title == dataCenter.page.pageName) && permissionList[index].permissionobj =="功能" ){
            permissionList[index].ftitle = "1|normal"
            //判断权限作用模块，页面(body)、list、form
            switch (permissionList[index].infoclassid) {
                case "body":
                    funPermission_body(permissionList[index]);
                    break;
                case "list":
                    funPermission_list(permissionList[index]);
                    break;
                // case "form":
                //     funPermission_form(permissionList[index]);
                //     break;
                default:
                    break;
            }  
        }
    }
}
//FIXME:funPermission
//页面功能权限
//暂时只处理角色、显示
//判断权限类型：显示、隐藏
//将权限内容写入dataCenter
function funPermission_body(info) {
    //判断权限类型
    switch (info.dotype) {
        case "11":
            //拆分functionid 写入dataCenter对应属性中
            dataCenter["showBlock"] = dataCenter["showBlock"]?dataCenter["showBlock"]:{};
            var showBlockNow = dataCenter["showBlock"];
            var functionidArr = info.functionid.split(',');
            var pageNode = info.ftitle.split('|')[0];
            var fromNode = info.ftitle.split('|')[1];
            showBlockNow[pageNode] = showBlockNow[pageNode]?showBlockNow[pageNode]:{};
            showBlockNow[pageNode][fromNode] = showBlockNow[pageNode][fromNode]?showBlockNow[pageNode][fromNode]:[];
            var oldArr = showBlockNow[pageNode][fromNode];
            for(var i=0;i<functionidArr.length;i++){
                var isExist = 0;
                for(var j=0;j<oldArr.length;j++){
                    if(functionidArr[i]==oldArr[j]){
                        isExist = 1;
                        break;
                    }
                }
                if(isExist == 0){
                    showBlockNow[pageNode][fromNode].push(functionidArr[i]);
                }
            }
            break;
        // case "22":
        //     //拆分functionid 写入dataCenter对应属性中
        //     var hiddenBlockNow = dataCenter.show.hiddenBlock_blank;
        //     var functionidArr = info.functionid.split(',')
        //     for(var key in hiddenBlockNow){
        //         for(var key2 in hiddenBlockNow[key]){
        //             var oldArr = hiddenBlockNow[key][key2];
        //             for(var i=0;i<functionidArr.length;i++){
        //                 var isExist = 0;
        //                 for(var j=0;j<oldArr.length;j++){
        //                     if(functionidArr[i]==oldArr[j]){
        //                         isExist = 1;
        //                         break;
        //                     }
        //                 }
        //                 if(isExist == 0){
        //                     hiddenBlockNow[key][key2].push(functionidArr[i]);
        //                 }
        //             }
        //         }
        //     }
        //     break;
        default:
            break;
    }
}

//FIXME:funPermission
//list功能权限
function funPermission_list(info) {
    //判断权限范围是页面所有list，还是某个list
    if(info.infoid == "all" ){//页面所有list
        //遍历所有list
        $.each(dataCenter["list"], function(val, i) {
            setFunPermission_list(val, info);
        });
    }else{
        //判断list是否存在，不存在就不管
        var infoIdList = info.infoid.split(",");
        infoIdList.forEach(function(val, i){
            if(dataCenter["list"][val]){
                setFunPermission_list(val, info);
            }
        })
        
    }
}

//FIXME:funPermission
//form功能权限
// function funPermission_form(info) {
//      //判断权限范围是页面所有form，还是某个form
//      if(infoId == "all" ){//页面所有form
//         //循环页面所有form
//         for (let index = 0; index < 页面所有form.length; index++) {
//             setFunPermission_form(form[i], info)
//         }
//     }else{
//         //判断form是否存在，不存在就不管
//         if(form存在){
//             setFunPermission_form(formId, info)
//         }
//     }
// }

//FIXME:funPermission
//list和form写入功能权限数据可以各自提成一个公共方法

//list写入权限数据
function setFunPermission_list(listId, info) {
    switch (info.dotype) {
        case "11":
            //拆分functionid 
            //根据pageNode、formNode、roleId
            //将权限写入list对应属性中
             //拆分functionid 写入dataCenter对应属性中
             dataCenter["list"][listId]["show"] = dataCenter["list"][listId]["show"] ? dataCenter["list"][listId]["show"] : {};
             dataCenter["list"][listId]["show"]["showBlock"] = dataCenter["list"][listId]["show"]["showBlock"] ? dataCenter["list"][listId]["show"]["showBlock"] : {};
             dataCenter["list"][listId]["show"]["showBlock"]["allRole"] = dataCenter["list"][listId]["show"]["showBlock"]["allRole"] ? dataCenter["list"][listId]["show"]["showBlock"]["allRole"] : {};
             var showBlockNow = dataCenter["list"][listId]["show"]["showBlock"]["allRole"];
             var functionidArr = info.functionid.split(',');
             var pageNode = info.ftitle.split('|')[0];
             var fromNode = info.ftitle.split('|')[1];
             showBlockNow[pageNode] = showBlockNow[pageNode]?showBlockNow[pageNode]:{};
             showBlockNow[pageNode][fromNode] = showBlockNow[pageNode][fromNode]?showBlockNow[pageNode][fromNode]:[];
             var oldArr = showBlockNow[pageNode][fromNode];
             for(var i=0;i<functionidArr.length;i++){
                 var isExist = 0;
                 for(var j=0;j<oldArr.length;j++){
                     if(functionidArr[i]==oldArr[j]){
                         isExist = 1;
                         break;
                     }
                 }
                 if(isExist == 0){
                     showBlockNow[pageNode][fromNode].push(functionidArr[i]);
                 }
             }
            break;
        // case "22":
        //     var hiddenBlockNow = dataCenter.show.fieldhiddenBlock;//目前没有，
        //     var functionidArr = info.functionid.split(',')
        //     for(var key in hiddenBlockNow){//key 角色
        //         for(var key2 in hiddenBlockNow[key]){//key2 pageNode
        //             for(var key3 in hiddenBlockNow[key][key2]){//key3 formNode
        //                 var oldArr = hiddenBlockNow[key][key2][key3];
        //                 for(var i=0;i<functionidArr.length;i++){
        //                     var isExist = 0;
        //                     for(var j=0;j<oldArr.length;j++){
        //                         if(functionidArr[i]==oldArr[j]){
        //                             isExist = 1;
        //                             break;
        //                         }
        //                     }
        //                     if(isExist == 0){
        //                         hiddenBlockNow[key][key2][key3].push(functionidArr[i]);
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     break;
        default:
            break;
    }
}

//form写入权限数据/
function setFunPermission_form(formId, info) {
    //  //判断权限类型
    //  switch (info.dotype) {
    //     case "显示":
    //         //拆分functionid 
    //         //根据pageNode、formNode、roleId
    //         //将权限写入form对应属性中
    //         var showBlockNow = dataCenter.show.fieldshowBlock;//目前没有，
    //         var functionidArr = info.functionid.split(',')
    //         for(var key in showBlockNow){//key 角色
    //             for(var key2 in showBlockNow[key]){//key2 pageNode
    //                 for(var key3 in showBlockNow[key][key2]){//key3 formNode
    //                     var oldArr = showBlockNow[key][key2][key3];
    //                     for(var i=0;i<functionidArr.length;i++){
    //                         var isExist = 0;
    //                         for(var j=0;j<oldArr.length;j++){
    //                             if(functionidArr[i]==oldArr[j]){
    //                                 isExist = 1;
    //                                 break;
    //                             }
    //                         }
    //                         if(isExist == 0){
    //                             showBlockNow[key][key2][key3].push(functionidArr[i]);
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //         break;
    //     case "隐藏":
    //         var hiddenBlockNow = dataCenter.show.fieldhiddenBlock;//目前没有，
    //         var functionidArr = info.functionid.split(',')
    //         for(var key in hiddenBlockNow){//key 角色
    //             for(var key2 in hiddenBlockNow[key]){//key2 pageNode
    //                 for(var key3 in hiddenBlockNow[key][key2]){//key3 formNode
    //                     var oldArr = hiddenBlockNow[key][key2][key3];
    //                     for(var i=0;i<functionidArr.length;i++){
    //                         var isExist = 0;
    //                         for(var j=0;j<oldArr.length;j++){
    //                             if(functionidArr[i]==oldArr[j]){
    //                                 isExist = 1;
    //                                 break;
    //                             }
    //                         }
    //                         if(isExist == 0){
    //                             hiddenBlockNow[key][key2][key3].push(functionidArr[i]);
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //         break;
    //     default:
    //         break;
    // }
}

 //监听token变化
window.addEventListener('storage', function(event) {
	if (event.key === 'token') {
        alertWarnDialog("温馨提示", "登录信息已过期，请刷新页面", function () {
            window.location.reload();
        }) 
	}
  });