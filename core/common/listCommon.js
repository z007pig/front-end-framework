/**
 * 获取搜索参数，整合配置和搜索的内容
 * @param {String} id 
 */
function getSeachParma(id) {
    // ... (logic remains, but without jQuery.extend)
    const searchInfo1 = dataCenter['list'][id].searchInfo;
    const searchInfo = JSON.parse(JSON.stringify(searchInfo1)); // Deep copy
    // ... (rest of the function)
    return search;
}

/**
 * 调用后台方法获取数据，渲染列表
 * @param {String} listId 
 */
function getListBlockData(listId, fomId) {
    // ... (logic remains, but without jQuery)
}

/**
 * 渲染列表的主函数
 * @param {String} listId 
 * @param {String} formId 
 */
function renderList(listId, formId) {
    backupListState(listId);
    concordanceList(listId);

    const listContainer = document.getElementById(listId);
    if (!listContainer) return;

    if (listContainer.querySelector(".zjDC_listSearch")) {
        renderListSearch(listId);
    }

    dcEvent(listId, "beforeRender", "list", dataCenter.list[listId].listInfos);
    renderListItem(listId, formId);

    if (listContainer.querySelector(".zjDC_listPagination")) {
        renderPagination2(listId, formId);
    }

    initListBlock(listId);
    dcEvent(listId, "afterRender", "list", dataCenter.list[listId].listInfos);

    // Event Delegation for update/delete buttons
    listContainer.addEventListener('click', function(e) {
        if (e.target.matches('.zjDC_updateButton')) {
            // ... (update logic)
        }
        if (e.target.matches('.zjDC_deleteButton')) {
            list_DeleteSelectedInfo(listId, e.target);
        }
    });

    listCheckboxCheckEvent(listId);
    listCheckboxAllCheckEvent(listId);
    listCheckboxDefaultCheck(listId);
}

/**
 * 渲染列表项（表格或行）
 * @param {String} listId 
 * @param {String} formId 
 */
function renderListItem(listId, fomId) {
    const listInfos = dataCenter.list[listId].listInfos || [];
    const container = document.getElementById(listId);
    if (!container) return;

    if (dataCenter.list[listId].isRow) {
        renderListItemByRow(listId, listInfos);
    } else {
        renderListItemByData(listId, listInfos);
    }
}

/**
 * 渲染表格（table）数据
 * @param {String} listId 
 * @param {Array} listInfos 
 */
function renderListItemByData(listId, listInfos) {
    const tableContainer = document.getElementById(listId).querySelector('.zjDC_listTable');
    if (!tableContainer) return;

    const thead = tableContainer.querySelector('thead');
    const tbody = tableContainer.querySelector('tbody');
    const tfoot = tableContainer.querySelector('tfoot');

    if (!dataCenter.list[listId].temprow) {
        dataCenter.list[listId].temprow = tbody.querySelector('tr').outerHTML;
    }
    const templateRow = dataCenter.list[listId].temprow;

    // Clear existing rows except the template
    tbody.innerHTML = templateRow;
    tbody.querySelector('tr').style.display = 'none';

    let newTbodyContent = '';
    listInfos.forEach(info => {
        let rowHtml = templateRow.replace(/{{(.*?)}}/g, (match, key) => {
            return info[key.trim()] || '';
        });
        newTbodyContent += rowHtml;
    });

    tbody.insertAdjacentHTML('beforeend', newTbodyContent);
}

/**
 * 渲染行（非table）数据
 * @param {String} listId 
 * @param {Array} listInfos 
 */
function renderListItemByRow(listId, listInfos) {
    const container = document.getElementById(listId);
    if (!container) return;

    if (!dataCenter.list[listId].temprow) {
        dataCenter.list[listId].temprow = container.querySelector('.row').outerHTML;
    }
    const templateRow = dataCenter.list[listId].temprow;

    // Clear existing rows
    const rows = container.querySelectorAll('.row');
    rows.forEach((row, index) => {
        if (index > 0) row.remove();
    });
    rows[0].style.display = 'none';

    let newRowsContent = '';
    listInfos.forEach(info => {
        let rowHtml = templateRow.replace(/{{(.*?)}}/g, (match, key) => {
            return info[key.trim()] || '';
        });
        newRowsContent += rowHtml;
    });

    container.insertAdjacentHTML('beforeend', newRowsContent);
}

/**
 * 渲染搜索区域
 * @param {String} listId 
 */
function renderListSearch(listId) {
    const searchContainer = document.getElementById(listId).querySelector('.zjDC_listSearch');
    if (!searchContainer) return;

    searchContainer.addEventListener('click', function(e) {
        if (e.target.matches('.zjDC_searchButton')) {
            dataCenter['list'][listId]['page']['currPage'] = 1;
            getListBlockData(listId);
        }
        if (e.target.matches('.zjDC_resetButton')) {
            searchContainer.querySelectorAll('input, select, textarea').forEach(el => el.value = '');
        }
    });
}

/**
 * 渲染分页
 * @param {String} listId 
 */
function renderPagination2(listId, formId) {
    const paginationContainer = document.getElementById(listId).querySelector('.zjDC_listPagination');
    if (!paginationContainer) return;
    // This function uses a custom pagination plugin, which itself might depend on jQuery.
    // For now, we assume it can be called. A full replacement would require a new vanilla JS pagination component.
    const pagination = dataCenter.list[listId].page;
    const endPage = Math.ceil(pagination.total / pagination.pageSize);
    // The following is a placeholder for the actual pagination logic.
    paginationContainer.innerHTML = `<span>Page ${pagination.currPage} of ${endPage}</span>`;
}

// ... (Other functions like backupListState, concordanceList, etc., need to be refactored as well)