/*!
 * 核心工具类
 */

//***************************************************************************************//
//*************************************处理字符串方法*************************************//
//***************************************************************************************//

/**
 * 去除空格  type 1-所有空格  2-前后空格  3-前空格 4-后空格
 * trim('  1235asd',1)
 * result：1235asd
 */
function trim(str, type) {
	if (Object.prototype.toString.call(str) !== "[object String]") {
		return str;
	}
	if (str) {
		switch (type) {
			case 1:
				return str.replace(/\s+/g, "");
			case 2:
				return str.replace(/(^\s*)|(\s*$)/g, "");
			case 3:
				return str.replace(/(^\s*)/g, "");
			case 4:
				return str.replace(/(\s*$)/g, "");
			default:
				return str;
		}
	} else {
		return '';
	}
}

/**
 * 格式化处理字符串
 * ecDo.formatText('1234asda567asd890')
 * result："12,34a,sda,567,asd,890"
 */
function formatText(str, size, delimiter) {
	var _size = size || 3,
		_delimiter = delimiter || ',';
	var regText = '\\B(?=(\\w{' + _size + '})+(?!\\w))';
	var reg = new RegExp(regText, 'g');
	return isEmpty(str) ? "" : str.toString().replace(reg, _delimiter);
}

/**
 * 设置url参数
 * setUrlPrmt({'a':1,'b':2})
 * result：a=1&b=2
 */
function setUrlPrmt(obj) {
	var _rs = [];
	for (var p in obj) {
		if (obj[p] != null && obj[p] != '') {
			_rs.push(p + '=' + obj[p])
		}
	}
	return _rs.join('&');
}

/**
 * 获取url参数
 * getUrlPrmt('segmentfault.com/write?draftId=122000011938')
 * result：Object{draftId: "122000011938"}
 */
function getUrlPrmt(url) {
	url = url ? url : window.location.href;
	var _pa = url.substring(url.indexOf('?') + 1),
		_arrS = _pa.split('&'),
		_rs = {};
	for (var i = 0, _len = _arrS.length; i < _len; i++) {
		var pos = _arrS[i].indexOf('=');
		if (pos == -1) {
			continue;
		}
		var name = _arrS[i].substring(0, pos),
			value = window.decodeURIComponent(_arrS[i].substring(pos + 1));
		_rs[name] = value;
	}
	return _rs;
}

/**
 * html字符串转码
 * @param {*} html 
 */
function html2Escape(html) {
	html = html.replace(/[<>&"'\\!]/g, function (c) {
		return {
			'<': '&lt;',
			'>': '&gt;',
			'&': '&amp;',
			'"': '&quot;',
			'\'': '&apos;',
			'\\': '&#92;',
			'!': '&#33;'
		}[c];
	});
	html = html.replace(/\r?\n/g, "&br;");
	return html;
}

/**
 * 字符转html
 * @param {*} str 
 */
function escape2Html(str) {
	var arrEntities = {
		'lt': '<',
		'gt': '>',
		'nbsp': ' ',
		'amp': '&',
		'quot': '"',
		'apos': '\'',
		'br': '\r\n',
		'#92': '\\',
		'#33': '!',
	};
	return unescape(str).replace(/&(lt|gt|nbsp|amp|quot|apos|br|#92|#33);/ig, function (all, t) {
		return arrEntities[t];
	});
}

/**
 * 转码对象转成正常对象
 * @param {*} obj 
 */
function escapeObjToHtmlObj(obj) {
	sysJson['decode'].forEach(function (name) {
		if (obj.hasOwnProperty(name)) {
			obj[name] = escape2Html(obj[name]);
		}
	});
	return obj;
}

/*
 * 字符串不为空
 */
function isNotEmpty(obj) {
	if (obj == undefined || obj == null || obj == "" || typeof obj == 'undefined' || (typeof obj == 'string' && trim(obj, 2) == "")) {
		return false;
	} else {
		return true;
	}
}

/* 
 * 字符串为空
 */
function isEmpty(obj) {
	if (obj == undefined || obj == null || obj == "" || typeof obj == 'undefined' || (typeof obj == 'string' && trim(obj, 2) == "")) {
		return true;
	} else {
		return false;
	}
}

/*
 *字符串首字符大写
 */
function firstCase(str) {
	return str.substring(0, 1).toUpperCase() + str.substring(1);
}

/*
 *字符模板渲染
 */
function temEngin(listInfos, tem) {
	var html = [];
	for (var i = 0; i < listInfos.length; i++) {
		var info = listInfos[i];
		var item = tem.replace(/{{(.)+?}}/g, function (match) {
			info = escapeObjToHtmlObj(info);
			var key = match.substring(2, match.length - 2).trim();
			//处理{{a.b.c}}这一类型
			var keyArr = key.split('.');
			var val = info;
			for (var k in keyArr) {
				if (keyArr.hasOwnProperty(k)) {
					if (isJSON(escape2Html(val[keyArr[k]]))) {
						val = JSON.parse(escape2Html(val[keyArr[k]]));
					} else if (isJSON(val[keyArr[k]])) {
						val = JSON.parse(val[keyArr[k]]);
					} else {
						val = val[keyArr[k]];
					}
				}
			}
			if (keyArr.length == 1) { // 值直接为json的情况
				val = info[key];
			}
			return val ? val : '';
		});
		html.push(item)
	}
	return html.join('')
}

//***************************************************************************************//
//*************************************输入限制******************************************//
//***************************************************************************************//

/**
 * 初始化页面限制输入
 * @param {*} id
 */
function inputSestrict(id) {
	//加载模板到页面
	var elems=$("#"+id+" [sestrictType]");
	if(elems&&elems.length>0){
		elems.each(function(i,item){
			var sestrictType = $(item).attr("sestrictType");
			switch(sestrictType) {
				case "integer":
				numeralBySelector($(item), false, false);
				break;
			case "decimal-1":
				numeralBySelector($(item), true, true, 1);
				break;
			case "decimal-2":
				numeralBySelector($(item), true, true, 2);
				break;
			case "only-cn":
				$(item).attr("keyup", "this.value=this.value.replace(/[^\u4e00-\u9fa5]/g,'')");
				break;
			case "only-en":
				$(item).attr("keyup", "this.value=this.value.replace(/[^a-zA-Z]/g,'')");
				break;
			case "email":
				break;
				default:
		} 
		})
	}
}

/*
 * 判断是否是json字符串
 */
function isJSON(str) {
	if (typeof str == 'string') {
		try {
			var obj = JSON.parse(str);
			if (typeof obj == 'object' && obj) {
				return true;
			} else {
				return false;
			}

		} catch (e) {
			return false;
		}
	}
}

/*
 * 将千位符类型转成普通数字
 */
function thousands2Num(str) {
	if (isEmpty(str)) {
		return 0;
	}
	var num = str.toString().replace(/,/g, '') * 1;
	return num;
}

//***************************************************************************************//
//************************************日期时间******************************************//
//***************************************************************************************//

/**
 * 时间戳转化
 */
function stampToDate(newstime, type) {
	if (newstime != "") {
		newstime = newstime * 1;
		if (newstime.toString().length == 10) {
			var newTime = new Date(newstime * 1000);
		} else {
			var newTime = new Date(newstime * 1);
		}
		var date = new Date();
		var year = newTime.getFullYear(); //年
		var month ='-' + (newTime.getMonth() + 1 < 10 ? '0' + (newTime.getMonth() + 1) : newTime.getMonth() + 1); //月
		var day ='-' + (newTime.getDate() < 10 ? '0' + newTime.getDate() : newTime.getDate()); //日
		var hour =' ' + (newTime.getHours() < 10 ? '0' + newTime.getHours() : newTime.getHours());
		var min =':' + (newTime.getMinutes() < 10 ? '0' + newTime.getMinutes() : newTime.getMinutes());
		var sec =':' + (newTime.getSeconds() < 10 ? '0' + newTime.getSeconds() : newTime.getSeconds());
		switch (type) {
			case 1:
				return year + month + day;
				break;
			case 2:
				return year + month + day + hour + min;
				break;
			default:
				return year + month + day + hour + min + sec;
				break;
		}
	} else {
		return '暂无时间'
	}
}

function getNowDate() {
	var myDate = new Date();

	//获取当前年
	var year = myDate.getFullYear();

	//获取当前月
	var month = myDate.getMonth() + 1;

	//获取当前日
	var date = myDate.getDate();
	var h = myDate.getHours(); //获取当前小时数(0-23)
	var m = myDate.getMinutes(); //获取当前分钟数(0-59)
	var s = myDate.getSeconds();

	//获取当前时间

	var now = year + '-' + conver(month) + "-" + conver(date) + " " + conver(h) + ':' + conver(m) + ":" + conver(s);
	console.log(now);
	return now;
}

//日期时间处理
function conver(s) {
	return s < 10 ? '0' + s : s;
}

//***************************************************************************************//
//*************************************处理数组方法***************************************//
//***************************************************************************************//

/*
 * 数组去重
 */
function removeRepeatArray(arr) {
	return arr == undefined ? undefined : arr.filter(function (item, index, self) {
		return self.indexOf(item) === index;
	});
}

/**
 * 将数组按条件分组
 * @param {Array} array 
 * @param {Function} f 
 * @returns {Object.Array}
 */
function groupByFiled(array, f) {
	let groups = {};
	array.forEach(function (o) {
		let group = f(o);
		groups[group] = groups[group] || [];
		groups[group].push(o);
	});
	return groups;
}

/**
 * 是否是数组
 * @param {*} obj 
 */
function isArray(obj) {
	return obj instanceof Array;
}

//使用循环的方式判断一个元素是否存在于一个数组中
function isInArray(arr, value) {
	for (var i = 0; i < arr.length; i++) {
		if (value === arr[i]) {
			return true;
		}
	}
	return false;
}

function isInArrayOfField(arr, field, value) {
	for (var i = 0; i < arr.length; i++) {
		if (value === arr[i][field]) {
			return true;
		}
	}
	return false;
}

/**
 * 使用indexOf判断元素是否存在于数组中
 * @param {*} arr 
 * @param {*} value 
 */
function isInArray3(arr, value) {
	if (isNotEmpty(arr) && arr.indexOf && typeof (arr.indexOf) == 'function') {
		var index = arr.indexOf(value);
		if (index >= 0) {
			return true;
		}
	}
	return false;
}

/**
 * 删除数组指定的某个元素
 * @param {*} val 
 */
function removeArray(val) {
	var index = this.indexOf(val);
	if (index > -1) {
		this.splice(index, 1);
	}
};

/*
* 功能：对JSON对象字符串数组进行多字段（多列）排序
* 参数：
*   objArr: 目标数组
*   keyArr: 排序字段，以数组形式传递
*   type：排序方式，undefined以及asc都是按照升序排序，desc按照降序排序
* */
function sortObjectArray(objArr, keyArr, type) {
	if (type != undefined && type != 'asc' && type != 'desc') {
		return 'error';
	}
	var order = 1;
	if (type != undefined && type == 'desc') {
		order = -1;
	}
	var key = keyArr[0];
	objArr.sort(function (objA, objB) {
		if (objA[key] > objB[key]) {
			return order;
		} else if (objA[key] < objB[key]) {
			return 0 - order;
		} else {
			return 0;
		}
	})
	for (var i = 1; i < keyArr.length; i++) {
		var key = keyArr[i];
		objArr.sort(function (objA, objB) {
			for (var j = 0; j < i; j++) {
				if (objA[keyArr[j]] != objB[keyArr[j]]) {
					return 0;
				}
			}
			if (objA[key] > objB[key]) {
				return order;
			} else if (objA[key] < objB[key]) {
				return 0 - order;
			} else {
				return 0;
			}
		})
	}
	return objArr;
}

/**
 * 根据位id添修改JSON数据
 * @param {*} dataArray 
 * @param {*} obj 
 */
function updateJsonArrayById(dataArray, obj) { //修改JSON数据
	if (!obj.hasOwnProperty('id') || obj['id'] == null) {
		obj['id'] = uuid();
	}
	var flag = 0;
	for (var i = 0; i < dataArray.length; i++) {
		if (dataArray[i]['id'] == obj['id']) {
			dataArray.splice(i, 1, obj);
			flag = 1;
		}
	}
	if (flag == 0) {
		dataArray.splice(i, 0, obj);
	}
	return dataArray;
}

/**
 * 两个数组合并,删除ids
 * @param {*} dataArray 
 * @param {*} dataArray2 
 * @param {*} field 
 * @param {*} deleteIds 
 */
function mergeTwoNewArray(dataArray, dataArray2, field, deleteIds) { //修改JSON数据
	for (var i = 0; i < dataArray2.length; i++) {
		var index = getPosArrayById(dataArray, dataArray2[i].id);
		if (index == -1) {
			dataArray.push(dataArray2[i]);
		} else {
			dataArray[index] = dataArray2[i];
		}
	}
	var newarray = dataArray.filter(function (data) {
		return deleteIds.indexOf(data.id) == -1;
	});
	return newarray;
}

/**
 * 根据位置数组删除JSON数据
 * @param {*} dataArray 
 * @param {*} posArr 
 */
function removeJsonArrayByPosArr(dataArray, posArr) {
	var dataNewArray = [];
	for (var pos = 0; dataArray != undefined && dataArray != null && pos < dataArray.length; pos++) {
		if (posInArray(posArr, pos) < 0) {
			dataNewArray.push(dataArray[pos]);
		}
	}
	return dataNewArray;
}

/*
 *根据id得到对象在数组中的位置
 */
function getPosArrayById(dataArray, id) {
	for (var i = 0; i < dataArray.length; i++) {
		if (dataArray[i]['id'] == id) {
			return i;
		}
	}
	return -1;
}

/**
 * 使用循环的方式判断一个元素是否存在于一个数组中
 * @param {*} arr 
 * @param {*} value 
 */
function posInArray(arr, value) {
	for (var i = 0; i < arr.length; i++) {
		if (value == arr[i]) {
			return i;
		}
	}
	return -1;
}

/*
 *根据id获取数据
 */
function getObjFromArrayById(dataArray, id) {
	for (var i = 0; i < dataArray.length; i++) {
		if (dataArray[i]['id'] == id) {
			return dataArray[i];
		}
	}
	return {};
}

/*
 *根据filed的值来删除数据
 */
function deleteArrayByFiled(dataArray, value, filed) {
	for (var i = dataArray.length - 1; i > -1; i--) {
		if (dataArray[i][filed] == value) {
			dataArray.splice(i, 1);
		}
	}
	return dataArray;
}

/*
 *根据条件获取数据
 */
function updateJsonArrayByCondition(dataArray, conditions) {
	var result = [];
	for (var i = 0; i < dataArray.length; i++) {
		var con = conditions.replace(/item\./ig, "dataArray[i].");
		var comStr = "if(" + con + "){result.push(dataArray[i])}";
		eval(comStr);
	}
	return result;
}

/**
 * 
 * @param {*} dataArray 
 * @param {*} page 页数,从1开始
 * @param {*} count 每页有多少项
 */
function getSubArrayByPage(dataArray, page, count) {
	return dataArray.slice((page - 1) * count, page * count);
}

/*
 *判断数组对象中是否有对应项
 */
function isIncludeOfArray(array, obj, fieldArray) {
	var flag = 0;
	for (var i = 0; i < array.length; i++) {
		var isEqual = true;
		for (var j = 0; j < fieldArray.length; j++) {
			if (obj[fieldArray[j]] != array[i][fieldArray[j]]) {
				isEqual = false;
				break;
			}
		}
		if (isEqual) {
			flag = 1;
		}
	}
	return flag;
}

//***************************************************************************************//
//*****************************************工具方法***************************************//
//***************************************************************************************//

/*
 * 范围随机数
 */
function randomRange(start, end) {
	return Math.floor(Math.random() * (end - start + 1)) + start;
};

/*
 * 浏览器信息
 */
function browserInfo() {
	var ua = navigator.userAgent.toLowerCase();
	var info = {}
	if (/mobi/i.test(ua)) {
		info.isMobi = true; // 手机浏览器
	} else {
		info.isMobi = false; // 非手机浏览器
	}
	/*是否为微信浏览器*/
	info.isWeiXin = (/MicroMessenger/i.test(navigator.userAgent.toLowerCase()));
	//判断是否苹果移动设备访问
	info.isAppleMobileDevice = (/iphone|ipod|ipad|Macintosh/i.test(navigator.userAgent.toLowerCase()));
	//判断是否安卓移动设备访问
	info.isAndroidMobileDevice = (/android/i.test(navigator.userAgent.toLowerCase()));
	//判断是否移动设备访问
	info.isMobileUserAgent = (/iphone|ipod|android.*mobile|windows.*phone|blackberry.*mobile/i.test(window.navigator.userAgent.toLowerCase()));
	//浏览器类型
	info.type = getweb();
	return info;
}

/*
 * 浏览器信息
 */
function getweb() {
	if (!!window.ActiveXObject || "ActiveXObject" in window) {
		return "IE";
	}
	if (navigator.userAgent.indexOf("Firefox") != -1) {
		return "Firefox";
	}
	if (navigator.userAgent.indexOf("Chrome") != -1) {
		return "Chrome";
	}
	if (navigator.userAgent.indexOf("Safari") != -1) {
		return "Safari";
	}
}

/*
 * 设置cookie值
 */
function setCookie(name, value, Hours) {
	var d = new Date();
	var offset = 8;
	var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
	var nd = utc + (3600000 * offset);
	var exp = new Date(nd);
	exp.setTime(exp.getTime() + Hours * 60 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";path=/;expires=" + exp.toGMTString() + ";domain=360doc.com;"
}

/*
 * 获取cookie值
 */
function getCookie(name) {
	var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
	if (arr != null) return unescape(arr[2]);
	return null
}

/*
 * 跳转链接
 */
function toUrl(url, self, clearRole=true, obj) {
	//TODO:获取当前页面所有的session的数据,待完善  朱安2020.10.22
	// 记录oldSession，userSession
	var cacheOldSession = sessionStorage.getItem("oldSession");
	var cacheUserSession = sessionStorage.getItem("user");
	
	if (clearRole) {
		dataCenter.user.deleteDataRole();
	}
	dataCenter.to['menu'] = dataCenter.menu;
	dataCenter.to['org'] = dataCenter.org;
	dataCenter.to['role'] = dataCenter.role;
	dataCenter.saveSession();
	var rev = randomWord(false, 3, 32);
	var newurl=url+"?rev="+rev;
	if(obj){
		for(var key in obj){
			newurl+="&"+key+"="+obj[key];
		}	
	}
	if (self) {
		window.location.href = newurl;
		
	} else {
		//TODO:待完善  朱安 2020.10.22
		//如果是新开页签，就会dataCenter.saveSession();先更新当前页面的session，导致当前页面session错误，新页签会根据同源策略复制一份当前页面的session过去使用，两个页签之间互不影响。
		window.open(newurl);

		// 页面初始化之后不会用到dataCenter.session的值，不需要处理
		// 恢复oldSession，userSession
		sessionStorage.setItem("oldSession",cacheOldSession);
		sessionStorage.setItem("user",cacheUserSession);
	}
}

/*
** randomWord 产生任意长度随机字母数字组合
** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
*/
function randomWord(randomFlag, min, max){
    var str = "",
        range = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
 
    // 随机产生
    if(randomFlag){
        range = Math.round(Math.random() * (max-min)) + min;
    }
    for(var i=0; i<range; i++){
        pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
    }
    return str;
}

/*
 * uuid
 */
function uuid() {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "-";

	var uuid = s.join("");
	return uuid;
}

/*
 * isIEBroswer 判断是否是IE
 */
function isIEBroswer() {
	if (!!window.ActiveXObject || "ActiveXObject" in window)
		return true;
	else
		return false;
}

/*
 * 获取页面名称
 */
function pageName() {
	var a = location.href;
	var b = a.split("/");
	var c = b.slice(b.length - 1, b.length).toString(String).split(".");
	return c.slice(0, 1)[0];
}

/**
 * JSON克隆
 * @param {*} json 
 */
function jsonClone(json) {
	var jsonString = JSON.stringify(json);
	return JSON.parse(jsonString);
}

var observe;
if (window.attachEvent) {
	observe = function (element, event, handler) {
		element.attachEvent('on' + event, handler);
	};
} else {
	observe = function (element, event, handler) {
		element.addEventListener(event, handler, false);
	};
}

function bodyinit() {
	var text = document.getElementById('bodyinittext');

	function resize() {
		text.style.height = 'auto';
		var vHeight = text.scrollHeight + 2;
		text.style.height = vHeight + 'px';
	}
	/* 0-timeout to get the already changed text */
	function delayedResize() {
		window.setTimeout(resize, 0);
	}
	observe(text, 'change', resize);
	observe(text, 'cut', delayedResize);
	observe(text, 'paste', delayedResize);
	observe(text, 'drop', delayedResize);
	observe(text, 'keydown', delayedResize);

	text.focus();
	text.select();
	resize();
}

/*
 * 阻止BackSpace事件
 */
function banBackSpace(e) {
	var ev = e || window.event;
	//各种浏览器下获取事件对象
	var obj = ev.relatedTarget || ev.srcElement || ev.target || ev.currentTarget;
	//按下Backspace键
	if (ev.keyCode == 8) {
		var tagName = obj.nodeName //标签名称
		//如果标签不是input或者textarea则阻止Backspace
		if (tagName != 'INPUT' && tagName != 'TEXTAREA') {
			return stopIt(ev);
		}
		var tagType = obj.type.toUpperCase(); //标签类型
		//input标签除了下面几种类型，全部阻止Backspace
		if (tagName == 'INPUT' && (tagType != 'TEXT' && tagType != 'TEXTAREA' && tagType != 'PASSWORD')) {
			return stopIt(ev);
		}
		//input或者textarea输入框如果不可编辑则阻止Backspace
		if ((tagName == 'INPUT' || tagName == 'TEXTAREA') && (obj.readOnly == true || obj.disabled == true)) {
			return stopIt(ev);
		}
	}
}

function stopIt(ev) {
	if (ev.preventDefault) {
		//preventDefault()方法阻止元素发生默认的行为
		ev.preventDefault();
	}
	if (ev.returnValue) {
		//IE浏览器下用window.event.returnValue = false;实现阻止元素发生默认的行为
		ev.returnValue = false;
	}
	return false;
}

/*
 * 必填红色边框提示
 */
function setMustInputBorder(elem, mustInput, specialVertify) {
	if ($(elem).attr("disabled") != "disabled") {
		if (mustInput) {
			$(elem).css("border", "1px solid " + sysJson.color.mustInput);
			if (specialVertify) {
				$(elem).attr("specialVertify", "true")
			}
		} else {
			$(elem).css("border", "1px solid " + sysJson.color.maybeInput).removeAttr("specialVertify");
		}
	}
}

/*
 * 获取当前相对路径的方法
 */
function GetUrlRelativePath() {
	var url = document.location.toString();
	var arrUrl = url.split("//");

	var start = arrUrl[1].indexOf("/");
	var relUrl = arrUrl[1].substring(start);//stop省略，截取从start开始到结尾的所有字符

	if (relUrl.indexOf("?") != -1) {
		relUrl = relUrl.split("?")[0];
	}
	return relUrl;
}