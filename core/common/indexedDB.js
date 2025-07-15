class BlockingQueue {
    constructor() {
        this.queue = []; // 存储方法的队列
        this.isProcessing = false; // 是否正在处理方法

    }

    async enqueue(fn) {
        const promise = new Promise(resolve => {
            const queuedFn = async () => {
                try {
                    await fn();
                } catch (error) {
                    console.error('方法执行出错', error);
                } finally {
                    resolve(); // 方法执行完毕，解析 Promise
                }
            };

            this.queue.push(queuedFn);
            if (!this.isProcessing) {
                this.processQueue(); // 如果队列中没有正在执行的方法，则开始执行队列中的方法
            }
        });

        return promise;
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false; // 队列为空，停止处理方法
            return;
        }

        this.isProcessing = true; // 设置标志为正在处理方法
        const fn = this.queue.shift(); // 取出队列中的第一个方法
        await fn(); // 执行方法
        this.processQueue(); // 继续处理队列中的方法
    }
}

//创建数据库实例
const webDB = new IndexedDBTemplate();

/**
 * indexedDB
 * 
 * @param {String} dbName 数据库名称
 * @param {String} dbVersion 版本
 */
function IndexedDBTemplate() {
    const _this = this;
    // 阻塞队列
    _this.blockingQueue = new BlockingQueue();
    /**
     * 初始化方法
     * @param  {...String} storeNames 仓库名
     * @returns  {Promise} 
     */

    _this.init = function (callback = function () { }) {
        //初始化数据库
        return new Promise(function (resolve, reject) {
            //阻塞队列
            _this.blockingQueue.enqueue(async () => {
                if (_this.isInitialized()) {
                    resolve();
                    return;
                }

                _this.dbName = window.sysSet.dbLibraryName;
                _this.dbVersion = 1;
                _this.storeNames = window.sysSet.dbTableList;
                console.log(
                    "IndexedDB数据库初始化\n数据库表名：" +
                    _this.storeNames +
                    "\n数据库名:" +
                    _this.dbName +
                    "\n数据库版本:" +
                    _this.dbVersion
                );

                // 打开数据库
                let db = await _this.openDB(_this.dbName, _this.dbVersion, _this.storeNames);
                if (db) {
                    _this.db = db;
                    // 判断是否需要更新数据库
                    if (isNeedUpdate(_this.db, _this.storeNames)) {
                        let newDB = await _this.UpdateDB(_this.db, _this.dbName, _this.storeNames);
                        _this.db = newDB;
                    }
                    console.log("连接成功,数据库:" + _this.dbName);
                }

                if (callback)
                    callback(_this);
                resolve();
            });
        });

    }



    _this.openDB = function (dbName, dbVersion, storeNames) {
        return new Promise(function (resolve, reject) {
            if (!window.indexedDB) {
                reject(new Error('浏览器不支持indexedDB'));
            }

            let request = indexedDB.open(dbName, dbVersion);

            // 打开数据库失败
            request.onerror = function (event) {
                reject(new Error('数据库打开失败，错误码：' + event.target.errorCode));
            };

            // 打开数据库成功
            request.onsuccess = function (event) {
                // 获取数据对象
                let db = event.target.result;
                resolve(db);
            };

            // 创建数据仓库
            request.onupgradeneeded = function (event) {
                let db = event.target.result;
                for (let i = 0; i < storeNames.length; i++) {
                    db.createObjectStore(storeNames[i], {
                        keyPath: 'id'
                    });
                }
            };
        });
    }

    function isNeedUpdate(db, storeNames) {
        let isNeedUpdate = false;
        let storeNamesInDB = db.objectStoreNames;
        if (storeNamesInDB.length != storeNames.length) {
            isNeedUpdate = true;
        }
        for (let i = 0; i < storeNames.length; i++) {
            if (!storeNamesInDB.contains(storeNames[i])) {
                isNeedUpdate = true;
                break;
            }
        }
        return isNeedUpdate;
    }

    // 更新数据库
    _this.UpdateDB = async function (db, dbName, storeNames) {
        //将数据库中所有数据都拿出
        let tempData = await _this.getAllData(db);
        db.close();

        indexedDB.deleteDatabase(dbName);

        db = await _this.openDB(dbName, 1, storeNames);

        //将数据重新放入数据库
        await _this.transferData2DB(tempData, db);

        return db;
    }

    //获取数据库中所有数据
    _this.getAllData = function (db) {
        return new Promise(function (resolve, reject) {
            let tempData = {};
            let count = 0;
            for (let i = 0; i < db.objectStoreNames.length; i++) {
                let store = db.transaction(db.objectStoreNames[i]).objectStore(db.objectStoreNames[i]);
                let arr = [];
                store.getAll().onsuccess = function (event) {
                    arr = event.target.result;
                    tempData[db.objectStoreNames[i]] = arr;
                    count++;
                    if (count == db.objectStoreNames.length) {
                        resolve(tempData);
                    }
                }
            }
        });
    }

    //迁移数据
    _this.transferData2DB = function (data, db) {
        let count = 0;
        return new Promise(function (resolve, reject) {
            for (let i = 0; i < db.objectStoreNames.length; i++) {
                let storeName = db.objectStoreNames[i];
                if (!data[storeName]) {
                    count++;
                    continue;
                }
                let itemList = data[db.objectStoreNames[i]];
                let store = db.transaction(db.objectStoreNames[i], 'readwrite').objectStore(db.objectStoreNames[i]);

                var transaction = store.transaction;
                var objectStore = transaction.objectStore(db.objectStoreNames[i]);

                transaction.oncomplete = function () {
                    if (++count == db.objectStoreNames.length) {
                        resolve(itemList);
                    }
                };

                transaction.onerror = function (event) {
                    console.log(event);
                    reject();
                };

                for (let j = 0; j < itemList.length; j++) {
                    var request = objectStore.put(itemList[j]);
                    request.onerror = function (event) {
                        transaction.abort();
                        reject();
                    };
                }
            }
        });
    }

    _this.isInitialized = function () {
        return _this.db ? true : false;
    }

    /**
     * 异步方式获取对象仓库
     * @param {Stirng} storeName 仓库名
     * @param {String} mode 
     * @returns  {Promise}
     */
    _this.asyncGetStore = async function (storeName, mode) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        return new Promise(function (resolve, reject) {
            //判断是否存在该仓库
            if (!_this.db.objectStoreNames.contains(storeName)) {
                reject();
            } else {
                var transaction = _this.db.transaction(storeName, mode);
                var store = transaction.objectStore(storeName);
                resolve(store);
            }
        });
    };

    /**
     * 异步方式添加和修改数据
     * @param {String} storeName - 数据仓库名
     * @param {any} data {id:'key',value:'value'}
     * @returns {Promise}
     */
    _this.asyncSetItem = async function (storeName, data) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        try {
            if (!data.id) {
                return Promise.reject();
            }

            var store = await _this.asyncGetStore(storeName, 'readwrite');
            if (!store) {
                return Promise.reject();
            }
            var request = store.put(data);

            return new Promise(function (resolve, reject) {
                request.onsuccess = function () {
                    resolve(data);
                };

                request.onerror = function (event) {
                    console.log(event);
                    reject();
                };
            });
        } catch (error) {
            console.error(error);
        }
    };

    /**
    * 异步方式批量添加数据
    * @param {String} storeName - 数据仓库名
    * @param {Array} itemList - 要添加的数据对象数组
    * @returns {Promise}
    */
    _this.asyncSetItemList = async function (storeName, itemList) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        try {
            if (!Array.isArray(itemList) || itemList.length === 0) {
                return Promise.reject();
            }

            var store = await _this.asyncGetStore(storeName, 'readwrite');
            if (!store) {
                return Promise.reject();
            }

            var transaction = store.transaction;
            var objectStore = transaction.objectStore(storeName);

            return new Promise(function (resolve, reject) {
                transaction.oncomplete = function () {
                    resolve(itemList);
                };

                transaction.onerror = function (event) {
                    console.log(event);
                    reject();
                };

                for (var i = 0; i < itemList.length; i++) {
                    var request = objectStore.put(itemList[i]);
                    request.onerror = function (event) {
                        transaction.abort();
                        reject();
                    };
                }
            });
        } catch (error) {
            console.error(error);
        }
    };


    /**
    * 异步方式查询数据
    * 
    * @param {String} storeName - 数据仓库名
    * @param {any} key - 要查询的数据的键值
    * 
    */
    _this.asyncGetItem = async function (storeName, key) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        try {
            var store = await _this.asyncGetStore(storeName, 'readwrite');
            if (!store) {
                return Promise.reject();
            }

            var request;

            if (key) {
                request = store.get(key);
            } else {
                return Promise.reject();
            }

            return new Promise(function (resolve, reject) {
                request.onsuccess = function () {
                    resolve(request.result);
                };

                request.onerror = function (event) {
                    console.log(event);
                    reject();
                };
            });
        } catch (error) {
            console.error(error);
        }
    };

    /**
    * 异步方式查询数据
    * 
    * @param {String} storeName - 数据仓库名
    * @param {any} key - 要查询的数据的键值
    * 
    */
    _this.asyncGetAllItem = async function (storeName) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        try {
            var store = await _this.asyncGetStore(storeName, 'readwrite');
            if (!store) {
                return Promise.reject();
            }
            var request;

            request = store.getAll();

            return new Promise(function (resolve, reject) {
                request.onsuccess = function () {
                    resolve(request.result);
                };

                request.onerror = function (event) {
                    console.log(event);
                    reject();
                };
            });
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * 异步方式删除数据
     * 
     * @param {String} storeName - 数据仓库名
     * @param {any} key - 要删除的数据的键值
     */
    _this.asyncDeleteItem = async function (storeName, key) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        try {
            var store = await _this.asyncGetStore(storeName, 'readwrite');
            if (!store) {
                return Promise.reject();
            }
            var request = store.delete(key);

            return new Promise(function (resolve, reject) {
                request.onsuccess = function () {
                    resolve(key);
                };

                request.onerror = function (event) {
                    console.log(event);
                    reject();
                };
            });
        } catch (error) {
            console.error(error);
        }
    };


    /**
     * 异步方式清除表数据
     * 
     * @param {String} storeName - 数据仓库名
     */
    _this.asyncClear = async function (storeName) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        try {
            var store = await _this.asyncGetStore(storeName, 'readwrite');
            if (!store) {
                return Promise.reject();
            }
            var request = store.clear();

            return new Promise(function (resolve, reject) {
                request.onsuccess = function () {
                    console.log('清除成功');
                    resolve();
                };

                request.onerror = function (event) {
                    console.log(event);
                    reject();
                };
            });
        } catch (error) {
            console.error(error);
        }
    };


    /**
    * 异步方式查询数据
    * 
    * @param {String} storeName - 数据仓库名
    * @param {Function} search - 要查询的函数
    * 
    */
    _this.asyncSearch = async function (storeName, search) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        try {
            var store = await _this.asyncGetStore(storeName, 'readwrite');
            if (!store) {
                return Promise.reject();
            }

            var request;

            // TODO: search未完成


            return new Promise(function (resolve, reject) {
                request.onsuccess = function () {
                    resolve(request.result);
                };

                request.onerror = function (event) {
                    console.log(event);
                    reject();
                };
            });
        } catch (error) {
            console.error(error);
        }
    };


    /**
    * 异步方式获取对象仓库
    * @param {Stirng} storeName 仓库名
    * @param {String} mode 
    * @param {Function} callback 回调函数
    */
    _this.getStore = function (storeName, mode, callback = function () { }) {
        //判断是否存在该仓库
        if (!_this.db.objectStoreNames.contains(storeName)) {
            callback(null, new Error('store不存在'));
        } else {
            var transaction = _this.db.transaction(storeName, mode);
            var store = transaction.objectStore(storeName);
            callback(store, null);
        }
    };

    /**
     * 异步方式添加和修改数据
     * @param {String} storeName - 数据仓库名
     * @param {any} data {id:'key',value:'value'}
     * @param {Function} callback 回调函数
     */
    _this.setItem = async function (storeName, data, callback = function () { }) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        if (!data.id) {
            callback(null, new Error('id值不规范'));
            return;
        }

        _this.getStore(storeName, 'readwrite', function (store, err) {
            if (err) {
                callback(null, err);
                return;
            }
            if (!store) {
                callback(null, new Error('store不存在'));
                return;
            }

            var request = store.put(data);

            request.onsuccess = function () {
                callback(data);
            };

            request.onerror = function (event) {
                console.log(event);
                callback(null, new Error('添加失败'));
            };
        });
    };

    /**
    * 异步方式批量添加数据
    * @param {String} storeName - 数据仓库名
    * @param {Array} itemList - 要添加的数据对象数组
    * @param {Function} callback 回调函数
    */
    _this.setItemList = async function (storeName, itemList, callback = function () { }) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        if (!Array.isArray(itemList) || itemList.length === 0) {
            callback(null, new Error('itemList值不规范'));
            return;
        }

        _this.getStore(storeName, 'readwrite', function (store, err) {
            if (err) {
                callback(null, err);
                return;
            }
            if (!store) {
                callback(null, new Error('store不存在'));
                return;
            }

            var transaction = store.transaction;
            var objectStore = transaction.objectStore(storeName);

            transaction.oncomplete = function () {
                callback(itemList);
            };

            transaction.onerror = function (event) {
                console.log(event);
                callback(null, new Error('批量添加失败'));
            };

            for (var i = 0; i < itemList.length; i++) {
                var request = objectStore.put(itemList[i]);
                request.onerror = function (event) {
                    transaction.abort();
                    console.log(event);
                    callback(null, new Error('批量添加失败'));
                };
            }
        });
    };


    /**
    * 异步方式查询数据
    * 
    * @param {String} storeName - 数据仓库名
    * @param {any} key - 要查询的数据的键值
    * @param {Function} callback 回调函数
    */
    _this.getItem = async function (storeName, key, callback = function () { }) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        _this.getStore(storeName, 'readwrite', function (store, err) {
            if (err) {
                callback(null, err);
                return;
            }
            if (!store) {
                callback(null, new Error('store不存在'));
                return;
            }

            var request;

            if (key) {
                request = store.get(key);
            } else {
                callback(null, new Error('key值不规范'));
                return;
            }

            request.onsuccess = function () {
                callback(request.result, null);
            };

            request.onerror = function (event) {
                console.log(event);
                callback(null, new Error('查询失败'));
            };
        });
    };

    /**
    * 异步方式查询数据
    * 
    * @param {String} storeName - 数据仓库名
    * @param {Function} callback 回调函数
    */
    _this.getAllItem = async function (storeName, callback = function () { }) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        _this.getStore(storeName, 'readwrite', function (store, err) {
            if (err) {
                callback(null, err);
                return;
            }
            if (!store) {
                callback(null, new Error('store不存在'));
                return;
            }

            var request = store.getAll();

            request.onsuccess = function () {
                callback(request.result, null);
            };

            request.onerror = function (event) {
                console.log(event);
                callback(null, new Error('查询失败'));
            };
        });
    };

    /**
     * 异步方式删除数据
     * 
     * @param {String} storeName - 数据仓库名
     * @param {any} key - 要删除的数据的键值
     * @param {Function} callback 回调函数
     */
    _this.deleteItem = async function (storeName, key, callback = function () { }) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        _this.getStore(storeName, 'readwrite', function (store, err) {
            if (err) {
                callback(null, err);
                return;
            }
            if (!store) {
                callback(null, new Error('store不存在'));
                return;
            }

            var request = store.delete(key);

            request.onsuccess = function () {
                callback(key, null);
            };

            request.onerror = function (event) {
                console.log(event);
                callback(null, new Error('删除失败'));
            };
        });
    };


    /**
     * 异步方式清除表数据
     * 
     * @param {String} storeName - 数据仓库名
     * @param {Function} callback 回调函数
     */
    _this.clear = async function (storeName, callback = function () { }) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        _this.getStore(storeName, 'readwrite', function (store, err) {
            if (err) {
                callback(null, err);
                return;
            }
            if (!store) {
                callback(null, new Error('store不存在'));
                return;
            }

            var request = store.clear();

            request.onsuccess = function () {
                console.log('清除成功');
                callback();
            };

            request.onerror = function (event) {
                console.log(event);
                callback(null, new Error('清除失败'));
            };
        });
    };


    /**
    * 异步方式查询数据
    * 
    * @param {String} storeName - 数据仓库名
    * @param {Function} search - 要查询的函数
    * @param {Function} callback 回调函数
    */
    _this.search = async function (storeName, search, callback = function () { }) {
        if (!_this.isInitialized()) {
            await _this.init();
        }
        _this.getStore(storeName, 'readwrite', function (store, err) {
            if (err) {
                callback(null, err);
                return;
            }
            if (!store) {
                callback(null, new Error('store不存在'));
                return;
            }

            var request;

            // TODO: search未完成

            request.onsuccess = function () {
                callback(request.result, null);
            };

            request.onerror = function (event) {
                console.log(event);
                callback(null, new Error('查询失败'));
            };
        });
    };

    _this.close = function () {
        _this.db.close();
        _this.db = null;
        console.log('数据库已关闭');
    }
}

