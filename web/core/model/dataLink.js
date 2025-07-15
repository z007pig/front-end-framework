/* 进度条数据处理 */ 
class progress {
	constructor() {
		let data;
		let length=0;
		Object.defineProperty(this, 'data', {
			set: function (value) {
				data =JSON.parse(`[${value}]`.replace(/'/g,"\""));
			},
			get:function(){
				return data;
			}
		})
		Object.defineProperty(this, 'index', {
			set: function (value) {
				length=value;
			},
			get: function(){
				return length;
			}
		})
	}
}

//通过fetch获取数据
function JsonToFormdata(param) {
	var data = new FormData();
	for (var key in param) {
		var value = param[key];
		data.append(key, value);
	}
	return data;
}
/**
 * GET
 * 参数 - URL上
 * 返回 - String
 */
function dataLinkGetText(url, callback, err) {
	fetch(
		url,
		{
			method: 'GET',
		}
	).then(function (response) {
		if (response.ok)
			return response.text();
		else
			err("error");
	}
	).then(function (responseText) {
		callback(responseText)
	}).catch(function (error) {
		err(error);
	}).done();
	;
}

/**
 * GET
 * 参数 - URL上
 * 返回 - Json
 */
function dataLinkGetJson(url, callback, err) {
	$.ajax({
		type: "get",
		url:url,
		async: true,
		dataType: 'json',
		
		success: function(data){
			callback(data);
		},
		error:function(error){
			err(error);
		}
	}); 
}
/**
 * POST
 * 参数 - Json
 * 返回 - String
 */
function dataLinkPostText(url, params, callback, err) {
	$.ajax({
		type: "post",
		url:url,
		async: true,
		data:params,
		dataType: 'text',
		
		success: function(data){
			callback(data);
		},
		error:function(error){
			alert('接口异常');
		}
	}); 
}
/**
 * POST
 * 参数 - Json
 * 返回 - Json
 * @progressCallback 进度条回调函数不需要进度条可不传
 */
var loginFailureFlag = true; //登录失效标记，多次接口失效，只需要执行一次逻辑就可以
function dataLinkPostJson(url, params, callback, err,progressCallback,permissionCallback) {
	//FIXME:权限
	// if(!intefacePermission(url,params))
	// {
	// 	permissionCallback();
	// 	return false;
	// }
	$.ajax({
		type: "post",
		url:url,
		async: true,
		data:params,
		dataType: 'json',
		headers: {
                    'token': localStorage.getItem('token')
                },
		xhr:function(){
			let xhr = new XMLHttpRequest();
			let item = new progress();
			xhr.addEventListener("progress", function (evt) {
				// console.log(evt);
				if (typeof (progressCallback) === 'function') {
					item.data = evt.target.response;
					for (let index = item.index; index < item.data.length; index++) {
						const element = item.data[index];
						progressCallback(element);
					}
					item.index = item.data.length;
				}
			})

			return xhr 
		},
		success: function(data){
			if(data.flag == 21002 && loginFailureFlag){//登录失效
				loginFailureCount = false;
				sysSet.loginFailure(data);
			}
			else if ((data.hasOwnProperty("flag") && data.flag == "200") || (data.hasOwnProperty("result") && data.result.hasOwnProperty("flag") && data.result.flag == "200")|| (data.hasOwnProperty("result") && data.result.hasOwnProperty("flag") && data.result.flag == 200)){
				callback(data);
			}
			else{
				ajaxFlagErr(data,err);
			}
		},
		error:function(error){
			alert('接口异常');
		}
	}); 
}

function dataLinkPostJsonFalse(url, params, callback, err) {
	$.ajax({
		type: "post",
		url:url,
		async: false,
		data:params,
		dataType: 'json',
		
		success: function(data){
			if ((data.hasOwnProperty("flag") && data.flag == "200") || (data.hasOwnProperty("result") && data.result.hasOwnProperty("flag") && data.result.flag == "200")|| (data.hasOwnProperty("result") && data.result.hasOwnProperty("flag") && data.result.flag == 200))
				callback(data);
			else
				err(data.msg);
		},
		error:function(error){
			err(error);
		}
	}); 
}

function dataLinkPostFileJson(url, params, callback, err) {
	$.ajax({
		type: "post",
		url:url,
		async: true,
		data:params,
		dataType: 'json',
		contentType:false,
		processData:false,
		// mimeType:"multipart/form-data",
		success: function(data){
			if (data.flag == "200")
				callback(data);
			else
				err("error");
		},
		error:function(error){
			err(error);
		}
	}); 
}

//所有请求携带token
$(document).ajaxSend(function(event,xhr){
    xhr.setRequestHeader('token',"visitor")
})


//接口返回值flag错误执行方法
//如果没有err回调方法，就直接alert错误
function ajaxFlagErr(data,err) {
	if(typeof err != undefined && typeof err == "function"){
		err(data.msg);
	}else{
		alert(data.msg);
	}
	
}