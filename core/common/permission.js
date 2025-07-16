/**
 * Checks if an object is empty (has no own properties).
 * @param {Object} obj The object to check.
 * @returns {boolean} True if the object is empty, false otherwise.
 */
function isObjectEmpty(obj) {
    if (obj == null) return true;
    return Object.keys(obj).length === 0;
}

/**
 * 某个信息与某个权限对比
 * @param {*} classid 
 * @param {*} infoid 
 * @param {*} type 权限类型
 * @param {*} info 某个信息
 * @param {*} permission  某个权限
 */
function getInfoPermissionOneByOne(classid, infoid, type, info, permission) {
    var classHasPermission = false;
    var classNoPermission = false;
    var infoHasPermission = false;
    var infoNoPermission = false;
    const element = permission;
    let extraCondition = true;
    if (isNotEmpty(element.permission) && isNotEmpty(info)) {
        let extraPermission = JSON.parse(element.permission);
        if (!isObjectEmpty(extraPermission)) {
            extraPermission.searchField = extraPermission.searchFieldArr;
            extraPermission.searchValue = extraPermission.searchValueArr;
            extraPermission.searchCondition = extraPermission.searchConditionArr;
            extraCondition = verifySearch(info, extraPermission);
        }
    }
    // ... (rest of the function is the same)
    return {
        "classHasPermission": classHasPermission,
        "classNoPermission": classNoPermission,
        "infoHasPermission": infoHasPermission,
        "infoNoPermission": infoNoPermission,
    };
}

/**
 * 某个栏目的权限与某个权限对比
 * @param {*} classid 栏目id
 * @param {*} type 权限类型:查看=view、新增=add、导入=import、导出=export
 * @param {*} info 某个信息
 * @returns 
 */
function getClassPermissionOneByOne(classid, type, info, permission) {
    var hasPermission = false;
    var noPermission = false;
    const element = permission;
    let extraCondition = true;
    if (isNotEmpty(element.permission) && isNotEmpty(info)) {
        let extraPermission = JSON.parse(element.permission);
        if (!isObjectEmpty(extraPermission)) {
            extraPermission.searchField = extraPermission.searchFieldArr;
            extraPermission.searchValue = extraPermission.searchValueArr;
            extraPermission.searchCondition = extraPermission.searchConditionArr;
            extraCondition = verifySearch(info, extraPermission);
        }
    }
    // ... (rest of the function is the same)
    return {
        "hasPermission": hasPermission,
        "noPermission": noPermission,
    };
}

// ... (The rest of the file remains unchanged as it doesn't use jQuery)
