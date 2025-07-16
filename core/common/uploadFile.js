/**
 * 文件上传
 */

const upladFile = (function () {
    let xhr;

    // ... (callbacks and renders remain the same)

    const _initEvent = {
        _addEventListeners: function (domId, callbacks) {
            const element = document.getElementById(domId);
            if (!element) return;

            // Use a container for event delegation if needed, or direct binding
            const container = element.closest('body'); // Or a more specific container

            container.addEventListener("change", function(e) {
                if (e.target.matches('#' + domId + ' input[type=file]')) {
                    const file = e.target.files[0];
                    if (callbacks.change) callbacks.change(file);
                }
            });

            element.addEventListener("dragover", e => {
                e.preventDefault();
                e.stopPropagation();
            });

            element.addEventListener("dragenter", e => {
                e.preventDefault();
                e.stopPropagation();
                element.classList.remove("drag");
                element.classList.add("dragenter", "updatefileboxback");
            });

            element.addEventListener("dragleave", e => {
                e.preventDefault();
                e.stopPropagation();
                element.classList.remove("dragenter", "updatefileboxback");
                element.classList.add("drag");
            });

            element.addEventListener("drop", e => {
                e.preventDefault();
                e.stopPropagation();
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    files[0].domId = domId;
                    UpladFile(files[0], {}, callbacks.progressCallBack, callbacks);
                }
            });

            const uploadButton = element.nextElementSibling;
            if (uploadButton && uploadButton.classList.contains('fileUpload')) {
                uploadButton.addEventListener('click', () => {
                    // Logic for pre-selected files would need to be adapted
                });
            }
        }
    };

    function UpladFile(fileObj, info, callback, callbacks, promise) {
        // ... (UpladFile logic remains the same, as it uses XMLHttpRequest)
    }

    function init(domId, type, callbacks) {
        if (!callbacks) callbacks = {};
        // ... (callback setup remains the same)

        _initEvent._addEventListeners(domId, callbacks);
    }

    return {
        UpladFile: UpladFile,
        // ... (other public methods)
        init: init
    };
})();

/**
 * 多文件上传 
 */
function selectFile(e) {
    const fileInput = e;
    const fileId = fileInput.id;
    document.querySelectorAll('.nowAddFileButtonPosition').forEach(el => el.classList.remove('nowAddFileButtonPosition'));
    fileInput.classList.add('nowAddFileButtonPosition');
    // ... (rest of the logic needs to be converted)
}

//删除文件
function delFile(e) {
    const delButton = e;
    const fileContainer = delButton.parentElement;
    const ahrefContainer = fileContainer.parentElement;
    const nowAddFileButtonElement = ahrefContainer.parentElement.querySelector('div.fa-upload input');
    
    fileContainer.remove();
    // ... (rest of the logic needs to be converted)
}

//渲染文件内容（文件下载）
function _initfile(formId) {
    const container = document.getElementById(formId);
    if (!container) return;

    container.querySelectorAll('.fa-download').forEach(el => {
        const input = el.querySelector('input');
        if (input && input.value) {
            // ... (logic to show/hide and set href)
        }
    });

    container.querySelectorAll('.fa-upload').forEach(el => {
        // ... (logic to render file links)
    });
}
