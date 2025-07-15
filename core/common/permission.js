/**
 * 某个信息与某个权限对比
 * @param {*} classid 
 * @param {*} infoid 
 * @param {*} type 权限类型
 * @param {*} info 某个信息
 * @param {*} permission  某个权限
 */
function getInfoPermissionOneByOne(classid, infoid, type, info, permission){
    var classHasPermission = false ; //栏目有权限
    var classNoPermission = false ; //栏目无权限
    var infoHasPermission = false ; //信息有权限
    var infoNoPermission = false ; //信息无权限
    const element = permission;
    //如果额外条件
    let extraCondition =true
    if(isNotEmpty(element.permission) && isNotEmpty(info)){
        extraPermission = JSON.parse(element.permission);
        if(!$.isEmptyObject(extraPermission) ){
            extraPermission.searchField = extraPermission.searchFieldArr;
            extraPermission.searchValue = extraPermission.searchValueArr;
            extraPermission.searchCondition = extraPermission.searchConditionArr;
            extraCondition = verifySearch(info, extraPermission)
        }
        
    }
    //栏目：infoClassid包含classid
    if(isNotEmpty(classid) && isNotEmpty(element.infoclassid) && element.infoclassid.indexOf(classid)>-1 && element.dotype == type){
        if(element.permissiontype.indexOf("允许")>-1 && extraCondition){
            classHasPermission = true;
        }else if(element.permissiontype.indexOf("禁止")>-1 && extraCondition ){
            classNoPermission = true;
        }
    }

    //栏目：infoClassid包含classid
    if(isNotEmpty(infoid)){
        if(element.infoid.indexOf(classid+"|"+infoid)>-1 && element.dotype == type){
            if(element.permissiontype.indexOf("允许")>-1 && extraCondition ){
                infoHasPermission = true;
            }else if(element.permissiontype.indexOf("禁止")>-1 && extraCondition ){
                infoNoPermission = true;
            }
        }
    }
   
   let result = {
     "classHasPermission" : classHasPermission, //栏目有权限
     "classNoPermission" : classNoPermission, //栏目无权限
     "infoHasPermission" : infoHasPermission, //信息有权限
     "infoNoPermission" : infoNoPermission, //信息无权限
   };
   return result;
}

/**
 * 分析某个信息与某个权限对比结果 返回true、false
 * @param {*} result  getInfoPermissionOneByOne的结果
 */
function getInfoPermissionOneByOneHasPermission(result){
    if (result["classHasPermission"]) {
        return true;
    }else if (result["classNoPermission"]) {
        return false;
    }else if (result["infoHasPermission"]) {
        return true;
    };
    return false;
}

/**
 * 某个信息的权限
 * @param {*} classid 
 * @param {*} infoid 
 * @param {*} type 
 * @param {*} info 某个信息
 */
function getInfoPermission(classid, infoid, type, info){
    var classHasPermission = 0 ; //栏目有权限
    var classNoPermission = 0 ; //栏目无权限
    var infoHasPermission = 0 ; //信息有权限
    var infoNoPermission = 0 ; //信息无权限
    //localStorage获取permissionList缓存
    var permissionList = localStorage.getItem("permissionList");
    permissionList = JSON.parse(permissionList);
    //循环permissionList
    for (let i = 0; i < permissionList.length; i++) {
        const element = permissionList[i];
        let result = getInfoPermissionOneByOne(classid, infoid, type, info, element);
        if (result["classHasPermission"]) {
            classHasPermission++;
        };
        if (result["classNoPermission"]) {
            classNoPermission++;
        };
        if (result["infoHasPermission"]) {
            infoHasPermission++;
        };
        if (result["infoNoPermission"]) {
            infoNoPermission++;
        };
        
    }
    //信息大于栏目
    //允许>禁止
   if(infoHasPermission > 0){
        return true;
   }else if(infoNoPermission > 0 ){
        return false;
   }else if(classHasPermission > 0){
        return true;
   }
   return false;
}

/**
 * 某个栏目的权限与某个权限对比
 * @param {*} classid 栏目id
 * @param {*} type 权限类型:查看=view、新增=add、导入=import、导出=export
 * @param {*} info 某个信息
 * @returns 
 */
function getClassPermissionOneByOne(classid, type, info, permission){
    var hasPermission = false ; //有权限
    var noPermission = false ; //无权限
    const element = permission;
    //如果额外条件
    let extraCondition =true
    if(isNotEmpty(element.permission) && isNotEmpty(info)){
        extraPermission = JSON.parse(element.permission);
        if(!$.isEmptyObject(extraPermission) ){
            extraPermission.searchField = extraPermission.searchFieldArr;
            extraPermission.searchValue = extraPermission.searchValueArr;
            extraPermission.searchCondition = extraPermission.searchConditionArr;
            extraCondition = verifySearch(info, extraPermission)
        }
        
    }
    //条件：infoClassid包含classid
    if(element.infoclassid.indexOf(classid)>-1 && element.dotype == type){
        if(element.permissiontype.indexOf("允许")>-1 && extraCondition ){
            hasPermission = true;
        }else if(element.permissiontype.indexOf("禁止")>-1 && extraCondition ){
            noPermission = true;
        }
    }
    
    return result = {
        "hasPermission" : hasPermission , //有权限
        "noPermission" : noPermission , //无权限
    };
    
}

/**
 *  * 某个栏目的权限与某个权限对比结果 返回true、false 
 * @param {*} result 
 * @returns 
 */
function getClassPermissionOneByOneHasPermission(result){
    //允许大于禁止
    if(result["noPermission"] > 0 && result["hasPermission"] == 0){
        return false;
    }
    return true;
    
}

/**
 * 某个栏目的权限
 * @param {*} classid 栏目id
 * @param {*} type 权限类型:查看=view、新增=add、导入=import、导出=export
 * @returns 
 */
function getClassPermission(classid, type, info){
    var hasPermission = 0 ; //有权限
    var noPermission = 0 ; //无权限
    //localStorage获取permissionList缓存
    var permissionList = localStorage.getItem("permissionList");
    permissionList = JSON.parse(permissionList);
    //循环permissionList
    for (let i = 0; i < permissionList.length; i++) {
        const element = permissionList[i];
        let result = getClassPermissionOneByOne(classid, type, info, element);
        if (result["hasPermission"]) {
            hasPermission++;
        };
        if (result["noPermission"]) {
            noPermission++;
        };
        
    }
    //允许大于禁止
    if(noPermission > 0 && hasPermission == 0){
        return false;
    }
    return true;
}
/**
 * 接口权限验证
 * @param {*} url 
 * @param {*} permissionCallback 
 * @returns 
 */
function intefacePermission(url, params, permissionCallback){
    var infoClass = params["infoClass"]? params["infoClass"]:"{}";
    infoClass = JSON.parse(infoClass);
    var info = params["info"]?params["info"]:"{}";
    info = JSON.parse(info);
    var classid = infoClass["id"]?infoClass["id"]:"";
    var infoid = info["id"]?info["id"]:"";

    //列表接口
    if(url.indexOf("list")>-1){
        //如果没有权限，调用权限回调
        if(!getClassPermission(classid, 'view', info))
        {
            permissionCallback();
            return;
        }
    }

    //新增修改接口
    if(url.indexOf("addOrUpdate") > -1){
        //如果没有权限，调用权限回调
        if(!getInfoPermission(classid, infoid, 'add', info))
        {
            permissionCallback();
            return;
        }
    }

    //详情接口
    if(url.indexOf("detail") > -1){
        //如果没有权限，调用权限回调
        if(!getInfoPermission(classid,infoid,'detail', info))
        {
            permissionCallback();
            return;
        }
    }

    //删除接口
    if(url.indexOf("delete") > -1){
        //如果没有权限，调用权限回调
        if(!getInfoPermission(classid,infoid,'delete', info))
        {
            permissionCallback();
            return;
        }
    }

    //导入接口
    if(url.indexOf("import") > -1){
        //如果没有权限，调用权限回调
        if(!getClassPermission(classid,'import', info))
        {
            permissionCallback();
            return;
        }
    }

    //导出接口
    if(url.indexOf("export") > -1){
        //如果没有权限，调用权限回调
        if(!getClassPermission(classid,'export', info))
        {
            permissionCallback();
            return;
        }
    }
}

//修改dataCenter中不同角色的权限
function pagePermission(){
    //page
    // dataCenter['showBlock']['allRole'].push();

    //form

    //list
}



//处理list每条数据的权限，将权限内容记录在每条数据中
function readylistPermissionInfo(listId){
    let permissionObj = {
        "delete":"删除",
        "update":"修改",
        "detail":"查看",
        // "download":"下载",
        // "review":"评论",
    };
    data=dataCenter["list"][listId].listInfos;
    classid = dataCenter["list"][listId].classId;
    if(data.length == 0){
        return false;
    }
    //localStorage获取permissionList缓存
    var permissionList = localStorage.getItem("permissionList");
    permissionList = JSON.parse(permissionList);
    data.forEach(function(item){
        infoid=item.id;
        for (var key in permissionObj) {  
            item["zj-dcPermission-"+key+"-infoHasPermission"] = 1;
            item["zj-dcPermission-"+key+"-infoNoPermission"] = 1;
            item["zj-dcPermission-"+key+"-classHasPermission"] = 1;
            item["zj-dcPermission-"+key+"-classNoPermission"] = 1;
            //循环permissionList
            for (let i = 0; i < permissionList.length; i++) {
                const element = permissionList[i]; 
                let result = getInfoPermissionOneByOne(classid, infoid, permissionObj[key], item, element);
                if(result["infoHasPermission"]){
                    item["zj-dcPermission-"+key+"-infoHasPermission"]++;
                } 
                if(result["infoNoPermission"]){
                    item["zj-dcPermission-"+key+"-infoNoPermission"]++;
                }
                if(result["classHasPermission"]){
                    item["zj-dcPermission-"+key+"-classHasPermission"]++;
                }
                if(result["classNoPermission"]){
                    item["zj-dcPermission-"+key+"-classNoPermission"]++;
                }
            }
            if(item["zj-dcPermission-"+key+"-infoHasPermission"]>1){
                item["zj-dcPermission-"+key] = true;
            }else if(item["zj-dcPermission-"+key+"-infoNoPermission"] >1){
                item["zj-dcPermission-"+key] = false;
            }else if(item["zj-dcPermission-"+key+"-classHasPermission"]>1){
                item["zj-dcPermission-"+key]= true;
            }else{
                item["zj-dcPermission-"+key]= false;
            }
        }
    });
}
function permissionCallback() {
    var noPermissionCallbackFun = "typeof onPermissionCallback() != 'undefined' && onPermissionCallback();";    
    eval(noPermissionCallbackFun);
}

function getPageInfoPermission() {
    
    
    if(isNotEmpty(dataCenter["page"]["classId"])&&isNotEmpty(dataCenter["page"]["infoId"])){
        dataCenter["page"]["zj_pagePermission_update"] = getInfoPermission(dataCenter["page"]["classId"],dataCenter["page"]["infoId"],"修改",{});
        dataCenter["page"]["zj_pagePermission_add"] = getInfoPermission(dataCenter["page"]["classId"],dataCenter["page"]["infoId"],"添加",{});
        dataCenter["page"]["zj_pagePermission_delete"] = getInfoPermission(dataCenter["page"]["classId"],dataCenter["page"]["infoId"],"删除",{});
    }
    //默认只处理1-normal
    let  pagePermissionList= ["zj_pagePermission_update","zj_pagePermission_add","zj_pagePermission_delete"];
    for (let index = 0; index < pagePermissionList.length; index++) {
        const element = pagePermissionList[index];
        if(dataCenter["page"][element]){
            dataCenter["showBlock"]["1"]["normal"].push(element)
        }else{
            dataCenter["hiddenBlock"]["1"]["normal"].push(element)
        }
    }


}
    
//form在接口层就已经拦截
function formPermission(formId){
    classid = dataCenter["form"][formId].classId;
    infoid = dataCenter["form"][formId].infoid;
    let permissionObj = {
        "update":"修改",
        "delete":"删除",
        // "download":"下载",
        // "review":"评论",
    };
    //localStorage获取permissionList缓存
    var permissionList = localStorage.getItem("permissionList");
    if(isJSON(permissionList)){
        permissionList = JSON.parse(permissionList);
        //循环permissionList
        for (let i = 0; i < permissionList.length; i++) {
            const element = permissionList[i]; 
            for (var key in permissionObj) {  
                let result = getInfoPermissionOneByOne(classid, infoid, permissionObj[key], "", element);
                if(getInfoPermissionOneByOneHasPermission(result))
                {
                    dataCenter.form[formId]["zj-dcPermission-update"]=true;
                    // objHasPropertyTree(dataCenter.form[formId],
                    //     [
                    //         {property:"classPermission",value:{}},
                    //         {property:"allRole",value:{}},
                    //         {property:"view",value:{}},
                    //         {property:"1",value:{}},
                    //         {property:"normal",value:false}
                    //     ]
                    // );
                    // dataCenter.form[formId]['classPermission']["allRole"]['view']["1"]["normal"] = false;
                    objHasPropertyTree(dataCenter.form[formId],
                        [
                            {property:"roleShow",value:{}},
                            {property:"allRole",value:{}},
                            {property:"showBlock",value:{}},
                            {property:"1",value:{}},
                            {property:"normal",value:[]}
                        ]
                    )
                    dataCenter.form[formId]['roleShow']["allRole"]['showBlock']["1"]["normal"].push("zj-dcPermission-update");
                }else{
                    dataCenter.form[formId]["zj-dcPermission-update"]=false;
                    // dataCenter.form[formId]['classPermission']["allRole"]['view']["1"]["normal"] = true;
                    // objHasPropertyTree(dataCenter.form[formId],
                    //     [
                    //         {property:"classPermission",value:{}},
                    //         {property:"allRole",value:{}},
                    //         {property:"view",value:{}},
                    //         {property:"1",value:{}},
                    //         {property:"normal",value:true}
                    //     ]
                    // );
                    // dataCenter.form[formId]['classPermission']["allRole"]['view']["1"]["normal"] = false;
                    objHasPropertyTree(dataCenter.form[formId],
                        [
                            {property:"roleShow",value:{}},
                            {property:"allRole",value:{}},
                            {property:"hidden",value:{}},
                            {property:"1",value:{}},
                            {property:"normal",value:[]}
                        ]
                    )
                    dataCenter.form[formId]['roleShow']["allRole"]['hidden']["1"]["normal"].push("zj-dcPermission-update");
                }
            }
        }
    }
}

//
function listPermission(listId){
    classid = dataCenter["list"][listId].classId;
    let permissionObj = {
        "add":"投稿",
        "import":"导入",
        "export":"导出",
    };
    //localStorage获取permissionList缓存
    var permissionList = localStorage.getItem("permissionList");
    permissionList = JSON.parse(permissionList);
    //循环permissionList
    for (let i = 0; i < permissionList.length; i++) {
        const element = permissionList[i]; 
        for (var key in permissionObj) {  
            let result = getInfoPermissionOneByOne(classid, "", permissionObj[key], "", element);
            if(getInfoPermissionOneByOneHasPermission(result))
            {
                dataCenter["list"][listId]["zj-dcPermission-"+key]=true;
                objHasPropertyTree(dataCenter.list[listId],
                    [
                        {property:"show",value:{}},
                        {property:"showBlock",value:{}},
                        {property:"allRole",value:{}},
                        {property:"1",value:{}},
                        {property:"normal",value:[]}
                    ]
                )
                dataCenter['list'][listId]["show"]['showBlock']["allRole"]["1"]["normal"].push("zj-dcPermission-"+key);
            }
        }
    }

}


function objHasPropertyTree(obj, propertyList) {
    for (let index = 0; index < propertyList.length; index++) {
        const element = propertyList[index];
        let property = element.property;
        let value =  element.value;    
        objHasProperty(obj, property, value);
        obj = obj[property];
    }
}

function objHasProperty(obj, property, value) {
    if (!obj.hasOwnProperty(property)) {  
        obj[property] = value;  
      } 
}