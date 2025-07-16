/* 进度条数据处理 */
class progress {
	constructor() {
		let data;
		let length = 0;
		Object.defineProperty(this, 'data', {
			set: function (value) {
				data = JSON.parse(`[${value}]`.replace(/'/g, "\""));
			},
			get: function () {
				return data;
			}
		})
		Object.defineProperty(this, 'index', {
			set: function (value) {
				length = value;
			},
			get: function () {
				return length;
			}
		})
	}
}

//接口返回值flag错误执行方法
//如果没有err回调方法，就直接alert错误
function ajaxFlagErr(data, err) {
	if (typeof err != undefined && typeof err == "function") {
		err(data.msg);
	} else {
		alert(data.msg);
	}

}

async function dataLink(url, options) {
	const { method = 'GET', params, callback, err, progressCallback, permissionCallback, responseType = 'json', async = true, contentType = 'application/x-www-form-urlencoded;charset=UTF-8' } = options;
	const requestOptions = {
		method,
		headers: {
			'token': localStorage.getItem('token') || 'visitor'
		},
	};
	if (method === 'POST') {
		if (contentType === false) {
			requestOptions.body = params;
		} else {
			requestOptions.headers['Content-Type'] = contentType;
			requestOptions.body = new URLSearchParams(params);
		}
	}

	try {
		const response = await fetch(url, requestOptions);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		let data;
		switch (responseType) {
			case 'text':
				data = await response.text();
				break;
			default:
				data = await response.json();
				break;
		}

		if (data.flag == 21002 && loginFailureFlag) { //登录失效
			loginFailureCount = false;
			sysSet.loginFailure(data);
		} else if ((data.hasOwnProperty("flag") && data.flag == "200") || (data.hasOwnProperty("result") && data.result.hasOwnProperty("flag") && data.result.flag == "200") || (data.hasOwnProperty("result") && data.result.hasOwnProperty("flag") && data.result.flag == 200)) {
			callback(data);
		} else {
			ajaxFlagErr(data, err);
		}
	} catch (error) {
		console.error('dataLink Error:', error);
		if (err) {
			err(error);
		} else {
			alert('接口异常');
		}
	}
}

/**
 * GET
 * 参数 - URL上
 * 返回 - String
 */
function dataLinkGetText(url, callback, err) {
	dataLink(url, { callback, err, responseType: 'text' });
}

/**
 * GET
 * 参数 - URL上
 * 返回 - Json
 */
function dataLinkGetJson(url, callback, err) {
	dataLink(url, { callback, err });
}
/**
 * POST
 * 参数 - Json
 * 返回 - String
 */
function dataLinkPostText(url, params, callback, err) {
	dataLink(url, { method: 'POST', params, callback, err, responseType: 'text' });
}
/**
 * POST
 * 参数 - Json
 * 返回 - Json
 * @progressCallback 进度条回调函数不需要进度条可不传
 */
var loginFailureFlag = true; //登录失效标记，多次接口失效，只需要执行一次逻辑就可以
function dataLinkPostJson(url, params, callback, err, progressCallback, permissionCallback) {
	dataLink(url, { method: 'POST', params, callback, err, progressCallback, permissionCallback });
}

function dataLinkPostJsonFalse(url, params, callback, err) {
	dataLink(url, { method: 'POST', params, callback, err, async: false });
}

function dataLinkPostFileJson(url, params, callback, err) {
	dataLink(url, { method: 'POST', params, callback, err, contentType: false });
}
