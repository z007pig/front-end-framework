// Listen for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function (e) {

    // Event delegation for blur on inputs
    document.addEventListener("blur", function (event) {
        if (event.target.matches("input, select, textarea")) {
            const target = event.target;
            if (isNotEmpty(target.value) && target.value !== '请选择' && (target.clientTop === 1 || getComputedStyle(target).borderWidth === "1px") && target.getAttribute("specialVertify") !== "true") {
                target.style.border = "1px solid #ccc";
            }
        }

        if (event.target.matches("table .computingOfexpression")) {
            const target = event.target;
            const listId = target.getAttribute('computingOflistid');
            const computing = dataCenter.list[listId].computing;
            recalculate(listId, target.closest('tr'), computing, true);
        }
    }, true); // Use capturing to ensure this runs

    // Event delegation for add buttons
    document.body.addEventListener('click', function(event) {
        if (event.target.matches('.zjDC_addButton')) {
            let pageUrl = event.target.getAttribute('zj-pageUrl');
            let self = event.target.getAttribute('zj-self');
            let state = event.target.getAttribute('zj-state');
            let dataCenterTo = JSON.parse(JSON.stringify(dataCenter["to"]));
            dataCenter.to = {
                pageNode: 1,
                fromNode: "add",
                state: state ? state : "info"
            }
            toUrl(pageUrl, self === '0' ? false : true, false);
            dataCenter.to = dataCenterTo;
        }
    });

    initPage();
});

// Controls the display of the page's input states (visible, hidden, disabled)
function initPage() {
    // Load templates into the page
    document.querySelectorAll("div[template]").forEach(function (element) {
        element.innerHTML = templateObj[element.getAttribute("template")];
    });

    // Page function permissions
    funPermission();
    document.querySelectorAll(".zj-funpermission-css").forEach(el => el.classList.remove("zj-none-css"));

    // Page main info permissions
    getPageInfoPermission();

    // Page-level configuration rendering
    initPageShowBlock();
    initPageHiddenBlock();

    // Language switching
    switchLanguage();

    // ... (rest of the function remains the same)

    var type = getPageType();
    Object.keys(dataCenter.form).forEach(function (formId) {
        if (formId.split("___").length < 2) {
            formPermission(formId);
            initFormPage(formId);
        }
    });

    if (dataCenter.state == "draft") {
        getAllFormBlockData(sysSet.mainFormId);
    } else {
        if (type == 'form') {
            getAllFormBlockData(sysSet.mainFormId);
        } else if (type == 'list') {
            getListBlockData(sysSet.mainListId);
        }
    }
}

/**
 * Reloads the page display
 */
function reloadPage() {
    Object.keys(dataCenter.form).forEach(function (formId) {
        if (formId.split("___").length < 2 && document.getElementById(formId)) {
            initFormPage(formId);
        }
    });
    Object.keys(dataCenter.list).forEach(function (listId) {
        if (document.getElementById(listId)) {
            var listData = getJsonFromListForm(listId);
            var deleteIds = dataCenter.list[listId].deleteIds || [];
            if (!dataCenter.list[listId].listInfos) {
                dataCenter.list[listId].listInfos = [];
            }
            var newListInfos = mergeTwoNewArray(dataCenter.list[listId].listInfos, listData, "id", deleteIds);
            renderListByData(listId, newListInfos);
        }
    });
}

// ... (The rest of the file, including permission handling, remains the same for now)
