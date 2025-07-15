function toUrl(url, self, clearRole = false, obj, info) { //info是用来判断页面重复利用

    if (info) {
        sessionStorage.setItem("historyPageInfo", JSON.stringify(info));
    } else {
        sessionStorage.setItem("historyPageInfo", '');
    }

    //TODO:获取当前页面所有的session的数据,待完善  朱安2020.10.22
    // 记录oldSession，userSession
    var cacheOldSession = sessionStorage.getItem("oldSession");
    // var cacheUserSession = sessionStorage.getItem("user");

    if (clearRole) {
        dataCenter.user.deleteDataRole();
    }
    // dataCenter.to['menu'] = dataCenter.menu;
    // dataCenter.to['org'] = dataCenter.org;
    // dataCenter.to['role'] = dataCenter.role;
    dataCenter.saveSession();
    var rev = timeStampNow();
    var newurl = "rev=" + rev;
    if (obj) {
        for (var key in obj) {
            newurl += "&" + key + "=" + obj[key];
        }
    }

    if (!$.isEmptyObject(dataCenter.to)) {
        for (let key of Object.keys(dataCenter.to)) {
            //IE对URL的最大限制为2083个字符,其他浏览器都比这个大
            if (dataCenter.to[key].length < 1500) {
                let value = dataCenter.to[key];
                newurl += "&" + key + "=" + value;
            }else{
                console.warn(key)
            } 
        }
        newurl += "&zjxx=zjxx&xx=xxx";

    }
    newurl = url + "?" + encodeURIComponent(Base64.encode(newurl));
    //IE对URL的最大限制为2083个字符,其他浏览器都比这个大
    // if (newurl.length > 2000) {
    //     alert("url数据量太大，浏览器不支持，请修改！");
    //     return false;
    // }
    if (self) {
        window.location.href = newurl;

    } else {
        //TODO:待完善  朱安 2020.10.22
        //如果是新开页签，就会dataCenter.saveSession();先更新当前页面的session，导致当前页面session错误，新页签会根据同源策略复制一份当前页面的session过去使用，两个页签之间互不影响。
        window.open(newurl);

        // 页面初始化之后不会用到dataCenter.session的值，不需要处理
        // 恢复oldSession，userSession
        sessionStorage.setItem("oldSession", cacheOldSession);
        // sessionStorage.setItem("user",cacheUserSession);
    }
}

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
 * ecDo.formatText('1234asda567asd890',4,' ')
 * result："1 234a sda5 67as d890"
 * ecDo.formatText('1234asda567asd890',4,'-')
 * result："1-234a-sda5-67as-d890"
 */
function formatText(str, size, delimiter) {
    var _size = size || 3,
        _delimiter = delimiter || ',';
    // 查找位置：1.不是两端；2.后面有size*n个字符串
    var regText = '\\B(?=(\\w{' + _size + '})+(?!\\w))';
    var reg = new RegExp(regText, 'g');
    return isEmpty(str) ? "" : str.toString().replace(reg, _delimiter);
}



/**
 * html字符串转码
 * @param {*} html 
 */
function return2Br(str) {
    return str.replace(/\r?\n/g, "&br;");
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
    html = return2Br(html);
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
 * 根据sysSet中的全局设置，转义对应的数据的字段 
 * 转码对象转成正常对象
 * @param {*} html 
 */
function escapeObjToHtmlObj(obj) {
    sysSet['decode'].forEach(function (name) {
        if (obj.hasOwnProperty(name)) {
            obj[name] = escape2Html(obj[name]);
        }
    });
    return obj;
}

/**
 * 正常对象转成转码对象
 * @param {*} html 
 */
function htmlObjToEscapeObj(htmlobj) {
    sysSet['decode'].forEach(function (name) {
        if (htmlobj.hasOwnProperty(name)) {
            htmlobj[name] = html2Escape(htmlobj[name]);
        }
    });
    return htmlobj;
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
        if (newstime.toString().length <= 10) {
            var newTime = new Date(newstime * 1000);
        } else {
            var newTime = new Date(newstime * 1);
        }
        var date = new Date();
        var year = newTime.getFullYear(); //年
        var month = '-' + (newTime.getMonth() + 1 < 10 ? '0' + (newTime.getMonth() + 1) : newTime.getMonth() + 1); //月
        var day = '-' + (newTime.getDate() < 10 ? '0' + newTime.getDate() : newTime.getDate()); //日
        var hour = ' ' + (newTime.getHours() < 10 ? '0' + newTime.getHours() : newTime.getHours());
        var min = ':' + (newTime.getMinutes() < 10 ? '0' + newTime.getMinutes() : newTime.getMinutes());
        var sec = ':' + (newTime.getSeconds() < 10 ? '0' + newTime.getSeconds() : newTime.getSeconds());
        var yearCN = year + "年";
        var monthCN = month.replace("-", "") + "月";
        var dayCN = day.replace("-", "") + "日";
        switch (type) {
            case 1:
                return year + month + day;
                break;
            case 2:
                return year + month + day + hour + min;
                break;
            case 3:
                return year
                break;
            // 月日
            case 4:
                return monthCN + dayCN;
                break;
            // 时分
            case 5:
                return hour.replace(" ", "") + min
                break;
            // 年月日
            case 6:
                return yearCN + monthCN + dayCN;
                break;
            default:
                return year + month + day + hour + min + sec;
                break;
        }
    } else {
        return '暂无时间'
    }
}

/**
 * 当前时间戳
 */
function timeStampNow() {
    return Math.round(new Date().getTime() / 1000)
}
/**
 * 时间格式转换年月日转化yyyy-MM-dd
 * @param {*} date 时间
 */
function ChangeDateFormat(date) {
    var reg = /(\d{4})\年(\d{2})\月(\d{2})\日/;
    var date = date.replace(reg, "$1-$2-$3");
    return date;
}



/**
 * 时间转化为时间戳
 */
function timeStamp(time) {
    var date = new Date(time);
    date = (date).valueOf() / 1000;
    return date;
}

/**
 * 到某一个时间的倒计时
 * getEndTime('2017/7/22 16:0:0')
 * result："剩余时间6天 2小时 28 分钟20 秒"
 * @param {*} endTime 
 */
function getEndTime(endTime) {
    var startDate = new Date(); //开始时间，当前时间
    var endDate = new Date(endTime); //结束时间，需传入时间参数
    var t = endDate.getTime() - startDate.getTime(); //时间差的毫秒数
    var d = 0,
        h = 0,
        m = 0,
        s = 0;
    if (t >= 0) {
        d = Math.floor(t / 1000 / 3600 / 24);
        h = Math.floor(t / 1000 / 60 / 60 % 24);
        m = Math.floor(t / 1000 / 60 % 60);
        s = Math.floor(t / 1000 % 60);
    }
    return {
        d: d,
        h: h,
        m: m,
        s: s
    };
}

/**
 * 根据日期获取周数
 * @param {*} dateString 日期的格式是"2018-12-11"
 * 返回值是数组，数组第一个值是年，第二个值是周
 */
function getWeekFromDate(dateString) {
    var da = '';
    if (dateString == undefined) {
        var now = new Date();
        var now_m = now.getMonth() + 1;
        now_m = (now_m < 10) ? '0' + now_m : now_m;
        var now_d = now.getDate();
        now_d = (now_d < 10) ? '0' + now_d : now_d;
        da = now.getFullYear() + '-' + now_m + '-' + now_d;
        console.log('今天系统时间是:' + da);
    } else {
        da = dateString; //日期格式2015-12-30
    }
    var date1 = new Date(da.substring(0, 4), parseInt(da.substring(5, 7)) - 1, da.substring(8, 10)); //当前日期
    var date2 = new Date(da.substring(0, 4), 0, 1); //1月1号
    //获取1月1号星期（以周一为第一天，0周一~6周日）
    var dateWeekNum = date2.getDay() - 1;
    if (dateWeekNum < 0) {
        dateWeekNum = 6;
    }
    if (dateWeekNum < 4) {
        //前移日期
        date2.setDate(date2.getDate() - dateWeekNum);
    } else {
        //后移日期
        date2.setDate(date2.getDate() + 7 - dateWeekNum);
    }
    var d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
    if (d < 0) {
        var date3 = (date1.getFullYear() - 1) + "-12-31";
        return getYearWeek(date3);
    } else {
        //得到年数周数
        var year = date1.getFullYear();
        var week = Math.ceil((d + 1) / 7);
        console.log(year + "年第" + week + "周");
        return [year, week];
    }
}

/**
 * 周数加一
 * @param {*} year 
 * @param {*} weeks 
 */
function addOneWeek(year, weeks) {
    weeks++;
    if (weeks < 54) {
        return [year, weeks];
    } else {
        var date = new Date(year, "0", "1");
        var _week = date.getDay();
        if (_week == 0 && weeks == 54) {
            return [year, weeks];
        }
        if (_week != 0 && weeks == 54) {
            return [year + 1, 1];
        }
    }
}

/**
 * 周数减一
 * @param {*} year 
 * @param {*} weeks 
 */
function subOneWeek(year, weeks) {
    weeks--;
    if (weeks > 0) {
        return [year, weeks];
    }
    if (weeks == 0) {
        var date = new Date(year - 1, "0", "1");
        var _week = date.getDay();
        if (_week == 0) {
            return [year - 1, 54];
        }
        if (_week != 0) {
            return [year - 1, 53];
        }
    }
}

/**
 * 获取当前日期 YYYY-MM-DD
 */
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

/**
 * 计算日期加上指定天数得到新的日期
 */
function getNewData(dateTemp, days) {
    var dateTemp = dateTemp.split("-");
    var nDate = new Date(dateTemp[1] + '-' + dateTemp[2] + '-' + dateTemp[0]); //转换为MM-DD-YYYY格式    
    var millSeconds = Math.abs(nDate) + (days * 24 * 60 * 60 * 1000);
    var rDate = new Date(millSeconds);
    var year = rDate.getFullYear();
    var month = rDate.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var date = rDate.getDate();
    if (date < 10) date = "0" + date;
    return (year + "-" + month + "-" + date);
}

/**
 * 两个时间相差天数 兼容firefox chrome
 * sDate1和sDate2是2006-12-18格式
 */
function dateDifference(sDate1, sDate2) {
    var dateSpan,
        tempDate,
        iDays;
    sDate1 = Date.parse(sDate1);
    sDate2 = Date.parse(sDate2);
    dateSpan = sDate2 - sDate1;
    dateSpan = Math.abs(dateSpan);
    iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
    return iDays
};

/**
 * JS计算两个日期之间的天数
 * sDate1和sDate2是2017-9-25格式 
 */
function dateDiffFromDateString(sDate1, sDate2) {
    if (sDate1 == undefined || sDate1 == null) {
        sDate1 = "";
    }
    if (sDate2 == undefined || sDate2 == null) {
        sDate2 = "";
    }
    var aDate, oDate1, oDate2, iDays
    aDate = sDate1.split("-")
    oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]) //转换为9-25-2017格式 
    aDate = sDate2.split("-")
    oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0])
    iDays = parseInt((oDate1 - oDate2) / 1000 / 60 / 60 / 24) //把相差的毫秒数转换为天数 
    return iDays;
}

/**
 * JS计算两个日期之间的天数
 * sDate1和sDate2是2017-9-25格式 
 */
function dateDiffFromDate(date1, date2) {
    iDays = parseInt(Math.abs(date1 - date2) / 1000 / 60 / 60 / 24) //把相差的毫秒数转换为天数 
    return iDays
}

/**
 * 根据年和周数获取当周的天数区间
 * @param {*} year 
 * @param {*} weeks 
 */
function getDatesFromWeek(year, weeks) {
    var date = new Date(year, "0", "1");
    var time = date.getTime(); // 获取当前星期几，0：星期一 。。。。
    var _week = date.getDay(); //当这一年的1月1日为周日时则本年有54周，否则没有54周，没有则去除第54周的提示  
    var cnt = 0; // 获取距离周末的天数 
    switch (_week) {
        case 0:
            cnt = 7;
            break;
        case 1:
            cnt = 6;
            break;
        case 2:
            cnt = 5;
            break;
        case 3:
            cnt = 4;
            break;
        case 4:
            cnt = 3;
            break;
        case 5:
            cnt = 2;
            break;
        case 6:
            cnt = 1;
            break;
    }
    if (_week != 0) { //一年53周情况 
        if (weeks == 54) {
            return false; //'今年没有54周'; 
        }
    } else { //一年54周情况 
        if (_week == 0 && weeks == 1) { //第一周
            cnt = 0;
        }
    }
    // 将这个长整形时间加上第N周的时间偏移
    time += cnt * 24 * 3600000; //第2周开始时间 
    if (weeks == 1) { //第1周特殊处理
        // 为日期对象 date 重新设置成时间 time
        var start = time - 24 * 3600000;
    } else {
        var start = time + (weeks - 2) * 7 * 24 * 3600000; //第n周开始时间
    }
    date.setTime(start);
    var _start = date.format("yyyy-MM-dd");
    date.setTime(start + 24 * 3600000);
    var _start1 = date.format("yyyy-MM-dd");
    date.setTime(start + 24 * 3600000 + 24 * 3600000);
    var _start2 = date.format("yyyy-MM-dd");
    date.setTime(start + 24 * 3600000 + 24 * 3600000 + 24 * 3600000);
    var _start3 = date.format("yyyy-MM-dd");
    date.setTime(start + 24 * 3600000 + 24 * 3600000 + 24 * 3600000 + 24 * 3600000);
    var _start4 = date.format("yyyy-MM-dd");
    date.setTime(start + 24 * 3600000 + 24 * 3600000 + 24 * 3600000 + 24 * 3600000 + 24 * 3600000);
    var _start5 = date.format("yyyy-MM-dd");
    date.setTime(start + 24 * 3600000 + 24 * 3600000 + 24 * 3600000 + 24 * 3600000 + 24 * 3600000 + 24 * 3600000);
    var _start6 = date.format("yyyy-MM-dd");
    return [_start, _start1, _start2, _start3, _start4, _start5, _start6];
}

function getNowDate(type) {
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
    if (type == 1) {
        var now = conver(h) + ':' + conver(m) + ":" + conver(s);
    } else {
        var now = year + '-' + conver(month) + "-" + conver(date) + " " + conver(h) + ':' + conver(m) + ":" + conver(s);
    }

    console.log(now);
    return now;
}

//日期时间处理
function conver(s) {
    return s < 10 ? '0' + s : s;
}
/**
 * 日期，在原有日期基础上，增加days天数，默认增加1天
 * @param {*} date -date是字符串的形式
 * @param {*} days -增加天数
 * 返回值也是字符串
 */
function addDate(date, days) {
    if (days === undefined || days === '') {
        days = 0;
    }
    var date = new Date(date);
    date.setDate(date.getDate() + days);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var mm = "'" + month + "'";
    var dd = "'" + day + "'";

    //单位数前面加0
    if (mm.length == 3) {
        month = "0" + month;
    }
    if (dd.length == 3) {
        day = "0" + day;
    }

    var time = date.getFullYear() + "-" + month + "-" + day
    return time;
}

/**
 * 日期格式化
 */
Date.prototype.format = function (format) {
    var args = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var i in args) {
        var n = args[i];
        if (new RegExp("(" + i + ")").test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? n : ("00" + n).substr(("" + n).length));
    }
    return format;
};

/**
 * 获取AddDayCount天后的日期
 */
GetDateStr = function (date, AddDayCount) {
    var dd = new Date(date);
    dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1; //获取当前月份的日期
    m = m < 10 ? "0" + m : m;
    var d = dd.getDate();
    d = d < 10 ? "0" + d : d;
    return y + "-" + m + "-" + d;
}

/*
 * 计算两个时间相差天数
 */
function datedifference(sDate1, sDate2) {
    var dateSpan, iDays;
    sDate1 = Date.parse(sDate1);
    sDate2 = Date.parse(sDate2);
    dateSpan = sDate2 - sDate1;
    dateSpan = Math.abs(dateSpan);
    iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
    return iDays
};

/*
 * 时间戳转时间
 */
function timestampToDate(shijian) {
    var date = new Date(shijian * 1000);
    Y = date.getFullYear() + '-';
    M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    var time = Y + M + D + h + m + s;
    return time
}

/*
 * 获取当月后n个月的年份
 */
function getNMYear(time, n) {
    var year = time.split("-")[0] * 1;
    var month = time.split("-")[1] * 1;
    if ((month + n) % 12 == 0) {
        return year + parseInt((month + n) / 12) - 1;
    } else {
        return year + parseInt((month + n) / 12);
    }
}

/*
 * 获取当月后n个月的完整年月日
 */
function getNMCYear(time, n) {
    if (isEmpty(time)) {
        return "";
    }
    var year = time.split("-")[0] * 1;
    var month = time.split("-")[1] * 1;
    var day = time.split("-")[2];
    var newyear = "";
    var newmonth = "";
    if ((month + n) % 12 == 0) {
        newyear = year + parseInt((month + n) / 12) - 1;
    } else {
        newyear = year + parseInt((month + n) / 12);
    }
    newmonth = (month + n) % 12 == 0 ? 12 : (month + n) % 12;
    if (newmonth < 10) {
        newmonth = "0" + newmonth;
    }
    return newyear + "-" + newmonth + "-" + day
}

// 时分秒只转为时间戳 例子：10:20:30 转为37230
function countDown(time) {

    var s = 0;

    var hour = time.split(':')[0];

    var min = time.split(':')[1];

    var sec = time.split(':')[2];

    s = Number(hour * 3600) + Number(min * 60) + Number(sec);
    console.log(s)

    return s;

}



// 时间戳的只转为时分秒 例子：37230 转为10:20:30

function formatDuring(mss) {

    var hours = parseInt((mss % (60 * 60 * 24)) / (60 * 60));

    var minutes = parseInt((mss % (60 * 60)) / (60));

    var seconds = (mss % (60));

    hours = hours < 10 ? ('0' + hours) : hours;

    minutes = minutes < 10 ? ('0' + minutes) : minutes;

    seconds = seconds < 10 ? ('0' + seconds) : seconds;
    console.log(hours + ":" + minutes + ":" + seconds)
    return hours + ":" + minutes + ":" + seconds;

}

//***************************************************************************************//
//*************************************处理数组方法***************************************//
//***************************************************************************************//

/**
 * 速度最快， 占空间最多（空间换时间）
 * 该方法执行的速度比其他任何方法都快， 就是占用的内存大一些。
 * 现思路：新建一js对象以及新数组，遍历传入数组时，判断值是否为js对象的键，
 * 不是的话给对象新增该键并放入新数组。
 * 注意点：判断是否为js对象键时，会自动对传入的键执行“toString()”，
 * 不同的键可能会被误认为一样，例如n[val]-- n[1]、n["1"]；
 * 解决上述问题还是得调用“indexOf”
 */
function uniqArr(array) {
    var temp = {},
        r = [],
        len = array.length,
        val, type;
    for (var i = 0; i < len; i++) {
        val = array[i];
        type = typeof val;
        if (!temp[val]) {
            temp[val] = [type];
            r.push(val);
        } else if (temp[val].indexOf(type) < 0) {
            temp[val].push(type);
            r.push(val);
        }
    }
    return r;
}

/**
 * 将数组按条件分组
 * @param {Array} array 
 * @param {Function} f 
 */
function groupBy(array, f) {
    let groups = {};
    array.forEach(function (o) {
        let group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
        return groups[group];
    });
}

/**
 * 将数组按条件分组
 * @param {Array} array 
 * @param {Function} f 
 * @returns {Array.array}
 */
function groupBy2Arr(array, f) {
    let groups = {};
    array.forEach(function (o) {
        let group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
        return groups[group];
    });
}

/**
 * 将数组按条件分组
 * @param {Array} array 
 * @param {Function} f 
 * @returns {Object.Array}
 */
function groupByObj(array, f) {
    let groups = {};
    array.forEach(function (o) {
        let group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return groups;
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
/*
 * 数组去重
 */
function removeRepeatArray(arr) {
    return arr == undefined ? undefined : arr.filter(function (item, index, self) {
        return self.indexOf(item) === index;
    });
}

/*
 * 数组根据某个字段或某几个字段去重
 * dataArr为数组，repeat为字段名称数组：["itemNo","itemName"]记为两个字段
 */
function getNewArr(dataArr, repeat, minChar) {
    var map = {};
    var newDataArr = [];
    if (minChar) {
        dataArr = dataArr.sort(compareArr(minChar, 1))
    }
    for (var i = 0; i < dataArr.length; i++) {
        var item = dataArr[i];
        var itemText = "";
        for (var j = 0; j < repeat.length; j++) {
            itemText += item[repeat[j]]
        }
        if (!map[itemText]) {
            newDataArr.push(dataArr[i])
            map[itemText] = itemText;
        }
    }
    return newDataArr;
}

/*
 * 数组中元素根据某一字段的值排序（根据up升降排序,默认升序）
 */
function compareArr(property, up) {
    return function (a, b) {
        var va = a[property];
        var vb = b[property];
        return up ? vb - va : va - vb;
    }
}

/**
* each是一个集合迭代函数，它接受一个函数作为参数和一组可选的参数
* 这个迭代函数依次将集合的每一个元素和可选参数用函数进行计算，并将计算得的结果集返回
{%example
     var a = [1,2,3,4].each(function(x){return x > 2 ? x : null});
     var b = [1,2,3,4].each(function(x){return x < 0 ? x : null});
     alert(a);
     alert(b);
%}
* @param {Function} fn 进行迭代判定的函数
* @param more ... 零个或多个可选的用户自定义参数
* @returns {Array} 结果集，如果没有结果，返回空集
*/
Array.prototype.each = function (fn) {
    fn = fn || Function.K;
    var a = [];
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < this.length; i++) {
        var res = fn.apply(this, [this[i], i].concat(args));
        if (res != null) a.push(res);
    }
    return a;
};

/**
 * 得到一个数组不重复的元素集合<br/>
 * 唯一化一个数组
 * @returns {Array} 由不重复元素构成的数组
 */
Array.prototype.uniquelize = function () {
    var ra = new Array();
    for (var i = 0; i < this.length; i++) {
        if (!ra.contains(this[i])) {
            ra.push(this[i]);
        }
    }
    return ra;
};

/**
* 求两个集合的补集
{%example
     var a = [1,2,3,4];
     var b = [3,4,5,6];
     alert(Array.complement(a,b));
%}
* @param {Array} a 集合A
* @param {Array} b 集合B
* @returns {Array} 两个集合的补集
*/
Array.complement = function (a, b) {
    return Array.minus(Array.union(a, b), Array.intersect(a, b));
};

Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

/**
* 求两个集合的交集
{%example
     var a = [1,2,3,4];
     var b = [3,4,5,6];
     alert(Array.intersect(a,b));
%}
* @param {Array} a 集合A
* @param {Array} b 集合B
* @returns {Array} 两个集合的交集
*/
Array.intersect = function (a, b) {
    return a.uniquelize().each(function (o) {
        return b.contains(o) ? o : null
    });
};

/**
* 求两个集合的差集
{%example
     var a = [1,2,3,4];
     var b = [3,4,5,6];
     alert(Array.minus(a,b));
%}
* @param {Array} a 集合A
* @param {Array} b 集合B
* @returns {Array} 两个集合的差集
*/
Array.minus = function (a, b) {
    return a.uniquelize().each(function (o) {
        return b.contains(o) ? null : o
    });
};

/**
* 求两个集合的并集
{%example
     var a = [1,2,3,4];
     var b = [3,4,5,6];
     alert(Array.union(a,b));
%}
* @param {Array} a 集合A
* @param {Array} b 集合B
* @returns {Array} 两个集合的并集
*/
Array.union = function (a, b) {
    return a.concat(b).uniquelize();
};

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

function isInArrayOfField(arr, field, value) {
    for (var i = 0; i < arr.length; i++) {
        if (value === arr[i][field]) {
            return true;
        }
    }
    return false;
}

/**
 * 为数值比较做准备
 * @param {*} value1 
 * @param {*} value2 
 */
function compare(value1, value2) {
    if (value1 < value2) {
        return -1;
    } else if (value1 > value2) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * arr2 = [13, 24, 51, 3];
 * console.log(arr2.sort(compare)); [3, 13, 24, 51]
 * 数值升序排序
 * @param {*} arr 
 */
function numArrayAscSort(arr) {
    return arr.sort(compare);
}

/**
 * 数值降序排序
 * @param {*} arr 
 */
function numArrayDescSort(arr) {
    return arr.sort(compare).reverse();
}

/**
 * 数值排序
 * @param {*} arr 
 */
function compare(property) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value2 - value1;
    }
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
        if (Array.isArray(this)) {
            this.splice(index, 1);
        }

    }
};

/**
 * 获取JSON数组
 * @param {*} formId 
 * @param {*} name 
 */
function getJsonArray(formId, name) { //将input里面的json转换为数组
    if (formId == null) {
        var json = $("input[name=" + name + "]").val();
    } else {
        var json = $("#" + formId + " input[name=" + name + "]").val();
    }
    var array = [];
    if (isNotEmpty(json)) {
        array = JSON.parse(escape2Html(json));
    } else {
        array = [];
    }
    return array;
}

/**
 * 设置JSON数组
 * @param {*} formId 
 * @param {*} name 
 * @param {*} json 
 */
function setJsonArray(formId, name, json) { //将input里面的json转换为数组
    $("#" + formId + " input[name=" + name + "]").val(JSON.stringify(json));
}

/**
 * 添加JSON数据
 * @param {*} dataArray 
 * @param {*} obj 
 * @param {*} pos 
 */
function pushArrayBypos(dataArray, obj, pos) { //添加JSON数据
    dataArray.splice(pos, 0, obj);
    return dataArray;
}

/**
 * 根据位置添修改JSON数据
 * @param {*} dataArray 
 * @param {*} obj 
 * @param {*} pos 
 */
function updateJsonArrayByPos(dataArray, obj, pos) { //修改JSON数据
    for (var i = 0; i < dataArray.length; i++) {
        if (pos == i) {
            dataArray.splice(i, 1, obj);
        }
    }
    return dataArray;
}

/*
 * 对数组对象的某一字段求和
 */
function objsum(array, key) {
    var sumResult = 0;
    for (var i = 0; i < array.length; i++) {
        var value = array[i][key];
        if (isNotEmpty(value)) {
            sumResult += toNum(value.toString());
        }

    }
    return sumResult;
}

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
 * 根据字段添修改JSON数据
 * @param {*} dataArray 
 * @param {*} obj
 * @param {*} field 
 */
function updateJsonArrayByField(dataArray, obj, field) { //修改JSON数据
    var flag = 0;
    for (var i = 0; i < dataArray.length; i++) {
        if (dataArray[i][field] == obj[field]) {
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
 * 两个数组合并
 * @param {*} dataArray 
 * @param {*} dataArray2 
 * @param {*} field 
 */
function mergeTwoArray(dataArray, dataArray2, field) { //修改JSON数据
    for (var i = 0; i < dataArray2.length; i++) {
        if (!isFromJsonByField(dataArray, field, dataArray2[i][field])) {
            dataArray.push(dataArray2[i]);
        }
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
 * 根据位置删除JSON数据
 * @param {*} dataArray 
 * @param {*} pos 
 */
function removeJsonArrayByPos(dataArray, pos) {
    for (var i = 0; i < dataArray.length; i++) {
        if (i == pos) {
            dataArray.splice(i, 1);
        }
    }
    return dataArray;
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

/*
 * 根据field的值给出最后一个符合条件的对象的位置
 */
function getLastPosByField(dataArray, field, value) {
    var lastPos = -1;
    for (var i = 0; i < dataArray.length; i++) {
        if (dataArray[i][field] == value) {
            lastPos = i;
        }
    }
    return lastPos;
}

/*
 *根据id得到对象的最后一个儿子在数组中的位置
 */
function getLastSonPosArrayById(dataArray, id) {
    pos = getPosArrayById(dataArray, id);
    if (pos == -1) {
        return -1;
    } else {
        var pid = id;
        while (pos > -1) {
            var lastPos = getLastPosByField(dataArray, "pid", pid);
            if (lastPos == -1) {
                return pos;
            } else {
                var obj = dataArray[lastPos];
                pos = lastPos;
                pid = obj['id'];
            }
        }
        return -1;
    }

}

/*
 *根据id获取数据
 */
function getJsonArrayById(dataArray, id) {
    for (var i = 0; i < dataArray.length; i++) {
        if (dataArray[i]['id'] == id) {
            return dataArray[i];
        }
    }
    return {};
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
 *根据指定字段获取数据
 */
function getObjFromArrayByField(dataArray, field, value) {
    for (var i = 0; i < dataArray.length; i++) {
        if (dataArray[i][field] == value) {
            return dataArray[i];
        }
    }
    return {};
}
/*
 *根据filed的值来查找数据
 */
function getArrayByFiled(dataArray, value, filed) {
    var newArray = [];
    for (var i = dataArray.length - 1; i > -1; i--) {
        if (dataArray[i][filed] == value) {
            newArray.push(dataArray[i]);
        }
    }
    return newArray;
}
/*
 *根据多个字段获取一个数据
 */
function getOneObjFromArrayByCondition(dataArray, conditions) {
    for (var i = 0; i < dataArray.length; i++) {
        var isEqual = true;
        for (var key in conditions) {
            if (conditions[key] !== dataArray[i][key]) {
                isEqual = false;
            }
        }
        if (isEqual) {
            return dataArray[i];
        }
    }
    return false;
}

/*
 *根据id删除数据id
 */
function deleteJsonArrayById(dataArray, id) {
    for (var i = dataArray.length - 1; i > -1; i--) {
        if (dataArray[i]['id'] == id) {
            dataArray.splice(i, 1);
        }
    }
    return dataArray;
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
 *根据filed的值来删除数据
 */
function deleteArrayByValue(dataArray, value) {
    for (var i = dataArray.length - 1; i > -1; i--) {
        if (dataArray[i] == value) {
            dataArray.splice(i, 1);
        }
    }
    return dataArray;
}
/*
 *根据filed的值获取删除数据的id
 */
function getDeleteArrayIdsByFiled(dataArray, value, filed) {
    var deleteIds = [];
    for (var i = dataArray.length - 1; i > -1; i--) {
        if (dataArray[i][filed] == value) {
            deleteIds.push(dataArray[i].id);
        }
    }
    return deleteIds;
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
 *比较两个对象的多个字段是否相等
 */
function isEqualOfTwoObject(obj1, obj2, fieldArray) {
    if (fieldArray == null && fieldArray.length == 0) {
        return false;
    } else {
        var flag = 0;
        fieldArray.forEach(function (field) {
            if (obj1[field] != obj2[field]) {
                flag = 1;
            }
        });
        if (flag == 0) {
            return true;
        } else {
            return false;
        }
    }
}

/*
 *数组插到某一个数组某一项后面
 */
function insertArrayToArray(array1, array2, num) {
    array2.unshift(num, 0);
    Array.prototype.splice.apply(array1, array2);
    return array1;
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

/**
 * 将对象obj变成对象编号为id的兄弟，新对象紧跟原对象
 * @param {*} dataArray 主数组数据 
 * @param {*} id 主键值 
 * @param {*} obj 
 */
function addBrotherObject(dataArray, id, obj) {
    var selfObj = getObjFromArrayById(dataArray, id);
    obj['pid'] = selfObj['pid'];
    if (id == null || id == "") {
        dataArray.push(obj);
    } else {
        var lastPos = getLastSonPosArrayById(dataArray, id);
        if (lastPos != -1) {
            dataArray.splice(lastPos + 1, 0, obj);
        }
    }
}

/**
 * 将对象obj变成对象编号为id的儿子，一般加在所有儿子的后面
 * @param {*} dataArray 主数组数据 
 * @param {*} id 主键值 
 * @param {*} obj 
 */
function addSonObject(dataArray, id, obj) {
    obj['pid'] = id;
    if (id == null || id == "") {
        dataArray.push(obj);
    } else {
        var lastPos = getLastSonPosArrayById(dataArray, id);
        if (lastPos != -1) {
            dataArray.splice(lastPos + 1, 0, obj);
        }
    }
}

/**
 * 将对象数组objArr变成对象编号为id的儿子，一般加在所有儿子的后面
 * @param {*} dataArray 主数组数据 
 * @param {*} id 主键值 
 * @param {*} objArr 儿子数组 
 */
function addSonObjectArr(dataArray, id, objArr) {
    if (objArr != undefined && objArr != null && objArr.length > 0) {
        objArr[0]['pid'] = id;
        if (id == null || id == "") {
            objArr.forEach(function (obj) {
                dataArray.push(obj);
            });
        } else {
            var lastPos = getLastSonPosArrayById(dataArray, id);
            if (lastPos != -1) {
                objArr.forEach(function (obj) {
                    dataArray.splice(lastPos + 1, 0, obj);
                    lastPos++;
                });
            }
        }
    }
}

/**
 * 递归删除
 * @param {*} dataArray 
 * @param {*} id 
 */
function deleteObjectById(dataArray, id) {
    var sonArray = getSonArray(dataArray, id);
    if (sonArray == null || sonArray == '' || sonArray.length == 0) {
        deleteJsonArrayById(dataArray, id);
    } else {
        for (var i = 0; i < sonArray.length; i++) {
            var sonObj = sonArray[i];
            deleteObjectById(dataArray, sonObj['id']);
        }
        deleteJsonArrayById(dataArray, id);
    }
}

/**
 * 将编号为id的对象提升
 * @param {*} dataArray 主数组数据 
 * @param {*} id 主键值 
 */
function upgradeObjectById(dataArray, id) {
    var selfObj = getObjFromArrayById(dataArray, id);
    var selfPid = selfObj['pid'];
    if (selfPid == null || selfPid == '') {
        return;
    } else {
        var pObj = getObjFromArrayById(dataArray, selfPid);
        if (pObj) {
            var selfPos = getPosArrayById(dataArray, id);
            var lastParentPos = getLastSonPosArrayById(dataArray, selfPid);
            var newArray = copyAllObjectIncludeChildren(dataArray, id);
            var newArrayLength = newArray.length;
            dataArray.splice(selfPos, newArrayLength);
            newArray[0]['pid'] = pObj['pid'];
            for (var i = 0; i < newArrayLength; i++) {
                dataArray.splice(lastParentPos - newArrayLength + i + 1, 0, newArray[i]);
            }
        } else {
            selfObj['pid'] = '';
        }
        return;
    }
}

/**
 * 将编号为id的对象下沉
 * @param {*} dataArray 主数组数据 
 * @param {*} id 主键值 
 */
function degradeObjectById(dataArray, id) {
    var selfObj = getObjFromArrayById(dataArray, id);
    var pid = selfObj['pid'];
    var bigBrother = null;
    for (var i = 0; i < dataArray.length; i++) {
        if (dataArray[i]['id'] == id) {
            break;
        } else {
            if (dataArray[i]['pid'] == pid) {
                bigBrother = dataArray[i];
            }
        }
    }
    var lowBrother = null;
    var flag = false;
    for (var i = 0; i < dataArray.length; i++) {
        if (dataArray[i]['id'] == id) {
            flag = true;
        }
        if (flag && dataArray[i]['pid'] == pid && dataArray[i]['id'] != id) {
            lowBrother = dataArray[i];
            break;
        }
    }
    if (bigBrother != null) {
        selfObj['pid'] = bigBrother['id'];
    } else if (lowBrother != null) {
        selfObj['pid'] = lowBrother['id'];
        var selfObjArr = copyAllObjectIncludeChildren(dataArray, id);
        deleteObjectById(dataArray, id);
        addSonObjectArr(dataArray, lowBrother['id'], selfObjArr);
    }
    return;
}
/**
 * 获取这个对象的数组，包括子孙也放入这个数组
 * @param {*} dataArray 
 * @param {*} id 
 */
function copyAllObjectIncludeChildren(dataArray, id) {
    var selfPos = getPosArrayById(dataArray, id);
    var selfLastPos = getLastSonPosArrayById(dataArray, id);
    var arr = [];
    for (var i = selfPos; i <= selfLastPos; i++) {
        arr.push(dataArray[i]);
    }
    return arr;
}

/**
 * 根据id获取说有的子对象数组，这里只是儿子，不是子孙
 * @param {*} dataArray 主数组数据
 * @param {*} id 主键值 
 */
function isHasSonArrayById(dataArray, id) {
    var sonArray = getSonArray(dataArray, id);
    if (sonArray != null && sonArray.length > 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * 根据id获取说有的子对象数组，这里只是儿子，不是子孙
 * @param {*} dataArray 主数组数据
 * @param {*} id 主键值 
 */
function isHasSonUsingArrayById(dataArray, id) {
    var sonArray = getSonUsingArray(dataArray, id);
    if (sonArray != null && sonArray.length > 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * 根据id获取所有的子对象数组，这里只是儿子，不是子孙
 * @param {*} dataArray 主数组数据
 * @param {*} id 主键值 
 */
function getSonArray(dataArray, id) {
    var arr = [];
    for (var i = 0; i < dataArray.length; i++) {
        if ((id != null && id != '') && dataArray[i]['pid'] == id) {
            arr.push(dataArray[i]);
        }
        if ((id == null || id == '') && (dataArray[i]['pid'] == null || dataArray[i]['pid'] == "")) {
            arr.push(dataArray[i]);
        }
    }
    return arr;
}

/**
 * 根据id获取没有被禁用（启用）的子对象数组，这里只是儿子，不是子孙
 * @param {*} dataArray 主数组数据
 * @param {*} id 主键值 
 */
function getSonUsingArray(dataArray, id) {
    var arr = [];
    for (var i = 0; i < dataArray.length; i++) {
        if ((id != null && id != '') && dataArray[i]['pid'] == id && dataArray[i]['proTaskStatus'] != "禁用") {
            arr.push(dataArray[i]);
        }
        if ((id == null || id == '') && (dataArray[i]['pid'] == null || dataArray[i]['pid'] == "") && dataArray[i]['proTaskStatus'] != "禁用") {
            arr.push(dataArray[i]);
        }
    }
    return arr;
}

/**
 * 将编号为id的对象的field字段求和，包括子孙的这个字段的值都要用递归求和
 * @param {*} dataArray 主数组数据 
 * @param {*} id 主键值
 * @param {*} field 
 */
function sumAllObjectByField(dataArray, id, field) {
    selfObj = getObjFromArrayById(dataArray, id);
    var feildValue = selfObj[field];
    var sonArray = getSonArray(dataArray, id);
    if (sonArray == null || sonArray.length == 0) {
        return feildValue;
    } else {
        feildValue = 0;
        sonArray.forEach(function (sonObj) {
            feildValue += sonObj[field] * 1;
            // feildValue += sumAllObjectByField(dataArray, sonObj['id'], field)*1;
        });
        selfObj[field] = feildValue;
        if (selfObj['pid'] != undefined && selfObj['pid'] != '') {
            sumAllObjectByField(dataArray, selfObj['pid'], field);
        }
        return feildValue;
    }
}

/*
 * 刷新字段field的值
 */
function calStartTime(dataArray, startTime) {
    calStartTimeByFieldAndId(dataArray, '', startTime);
}

/*
 * 刷新字段field的值
 */
function calStartTimeByFieldAndId(dataArray, id, startTime) {
    var sonArray = getSonArray(dataArray, id);
    var stime = startTime;
    for (var i = 0; i < sonArray.length; i++) {
        var obj = sonArray[i];
        obj['starttime'] = stime;
        var objId = obj['id'];
        if (isHasSonArrayById(dataArray, objId)) {
            calStartTimeByFieldAndId(dataArray, objId, stime);
        }
        var hour = stime.split(':')[0] * 1;
        var minute = stime.split(':')[1] * 1;
        var duration = obj['duration'] * 1;
        minute = minute + duration;
        var stime_hour = parseInt(minute / 60);
        var stime_minute = minute - 60 * stime_hour;
        stime_hour = parseInt((stime_hour + hour) % 24 * 1);
        stime = (stime_hour < 10 ? ('0' + stime_hour) : stime_hour) + ':' + (stime_minute < 10 ? ('0' + stime_minute) : stime_minute);
    }
}

/**
 * @param {*} dataArray 
 * @param {*} field 
 * @param {*} value 
 */
function isFromJsonByField(dataArray, field, value) {
    for (var i = 0; i < dataArray.length; i++) {
        if (dataArray[i][field] == value) {
            return true;
        }
    }
    return false;
}

/*
 * 刷新字段field的值
 */
function updateObjectByField(dataArray, field) {
    var arr = getSonArray(dataArray, '');
    arr.forEach(function (obj) {
        sumAllObjectByField(dataArray, obj['id'], field);
    });
}

/**
 * 获取哥哥在整个数组中的位置
 * @param {*} dataArray 
 * @param {*} id 
 */
function getBeforeBrotherPosById(dataArray, id) {
    var selfOBj = getObjFromArrayById(dataArray, id);
    var pid = selfOBj['pid'];
    var brotherArray = getSonArray(dataArray, pid);
    var pos = getPosArrayById(brotherArray, id);
    if (pos > 0) {
        brotherObj = brotherArray[pos - 1];
        brotherId = brotherObj['id'];
        return getPosArrayById(dataArray, brotherId);
    } else {
        return -1;
    }
}

/**
 * 获取弟弟在整个数组中的位置
 * @param {*} dataArray 
 * @param {*} id 
 */
function getAfterBrotherIdById(dataArray, id) {
    var selfOBj = getObjFromArrayById(dataArray, id);
    var pid = selfOBj['pid'];
    var brotherArray = getSonArray(dataArray, pid);
    var pos = getPosArrayById(brotherArray, id);
    if (pos < brotherArray.length - 1) {
        var brotherObj = brotherArray[pos + 1];
        var brotherId = brotherObj['id'];
        return brotherId;
    } else {
        return '';
    }
}

/**
 * 在兄弟间移动，移动到相邻的兄弟的上面
 * @param {*} dataArray 主数组数据 
 * @param {*} id 主键值 
 */
function upObjectById(dataArray, id) {
    var selfArray = copyAllObjectIncludeChildren(dataArray, id);
    var selfPos = getPosArrayById(dataArray, id);
    var beforeBrotherPos = getBeforeBrotherPosById(dataArray, id);
    if (beforeBrotherPos > -1) {
        if (selfPos != -1 && beforeBrotherPos != -1) {
            dataArray.splice(selfPos, selfArray.length);
        }
        for (var i = 0; i < selfArray.length; i++) {
            dataArray.splice(beforeBrotherPos + i, 0, selfArray[i]);
        }
    }
}

/**
 * 在兄弟间移动，移动到相邻的兄弟的下面
 * @param {*} dataArray 主数组数据 
 * @param {*} id 主键值 
 */
function downObjectById(dataArray, id) {
    var brotherId = getAfterBrotherIdById(dataArray, id);
    upObjectById(dataArray, brotherId);
}

/**
 * 重置编号，
 * @param {*} dataArray 主数组数据 
 * @param {*} field 编号对应数组字段，默认为no
 * @param {*} preArray 编号数组，如果为空，默认为['0','1','2','3','5','6','7','8','9','10',.....]
 */
function resetNoOfArray(dataArray, field, preArray) {
    if (field == null || field == "") {
        field = 'no';
    }
    resetNoOfArrayFun(dataArray, '', field, '', preArray);
}

/*
 * 这个函数不对外，是重置编号的递归函数
 */
function resetNoOfArrayFun(dataArray, pid, field, pre, preArray) {
    var sonArray = getSonArray(dataArray, pid);
    var j = 0;
    for (var i = 0; i < sonArray.length; i++) {
        var obj = sonArray[i];
        if (obj['proTaskStatus'] == '禁用') {
            obj[field] = "";
            continue;
        }
        if (preArray == null || preArray.length == 0) {
            var no = (j + 1) + "";
        } else {
            var no = preArray[j];
        }
        if (pre == null || pre == "") {
            var newepre = "" + no;
        } else {
            var newepre = pre + "." + no;
        }
        obj[field] = newepre;
        resetNoOfArrayFun(dataArray, obj['id'], field, newepre, preArray);
        j++;
    }
}

//***************************************************************************************//
//*****************************************其他方法***************************************//
//***************************************************************************************//


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
 * 获取页面名称
 */
function pageName() {
    var a = location.href;
    var b = a.split("/");
    var c = b.slice(b.length - 1, b.length).toString(String).split(".");
    return c.slice(0, 1)[0];
}

/**
 * 
 * @param {*} json 
 */
function jsonClone(json) {
    var jsonString = JSON.stringify(json);
    return JSON.parse(jsonString);
}



/**
 * 批量删除同一栏目下信息
 * @param {String} classId 栏目id 
 * @param {String} id 信息id集合，逗号隔开  "a,b,c"
 * @param {Function} callback 接口成功的回调方法
 * @param {Function} err 接口失败的回调方法
 */
function batchDelete(classId, id, callback, err) {
    //根据classid和id，整合成批量处理接口参数格式，调用批量处理接口函数
    let infos = manageBatchDeleteParam(classId, id);
    var info = {
        info: infos
    }
    let params = {
        info: JSON.stringify(info)
    };
    zjxxAjaxBatch(params, function (result) {
        console.log(result);
        //接口成功的回调方法
        callback(result);
    }, function (result) {
        //接口失败的回调方法
        console.log(result);
        err(result);
    });
}

/**
 * 批量删除不同栏目下信息
 * @param {Arry} infoList 多个栏目下信息id [{"classId":"a","id":"a1,a2,a3"},{"classId":"b","id":"b1,b2,b3"}] 
 * @param {String} id 信息id集合，逗号隔开
 * @param {Function} callback 接口成功的回调方法
 * @param {Function} err 接口失败的回调方法
 */
function batchDeleteForDiffColumn(infoList, callback, err) {
    //for循环infoList，调用整合批量删除参数，调用批量处理接口函数
    //遍历Array数组，获取每个元素
    var infos = [];
    for (var i = 0; i < infoList.length; i++) {
        let list = manageBatchDeleteParam(infoList[i].classId, infoList[i].id);
        //合并两个数组成一个大数组
        infos.concat(list);
    }
    var info = {
        info: infos
    }
    let params = {
        info: JSON.stringify(info)
    };
    zjxxAjaxBatch(params, function (result) {
        console.log(result);
        //接口成功的回调方法
        callback(result);
    }, function (result) {
        //接口失败的回调方法
        console.log(result);
        err(result);
    });
}

/**
 * 整合批量删除参数
 * @param {String} classId 栏目id 
 * @param {String} id 信息id集合，逗号隔开  "a,b,c"
 */
function manageBatchDeleteParam(classId, id) {
    //根据classid和id，整合成批量处理接口参数格式
    var idList = id.split(",");
    var infos = []
    for (let index = 0; index < idList.length; index++) {
        infos.push({
            infoClass: {
                "id": classId
            },
            info: {
                "id": idList[index]
            },
            promise: {
                "interfaceName": "delete"
            }
        })
    }
    return infos;
}

/**
 * 语言切换
 * @param {String} dom 需要替换的DOM
 */
function switchLanguage(dom) {
    //判断localStorg有没有"zj_page_language"，没有默认中文-language = cn
    let language = localStorage.getItem("zj_page_language");
    if (isEmpty(language)) {
        language = "cn";
    }

    //判断用户信息，dataCenter.user.pageLanguage有没有值，有则language = dataCenter.user.pageLanguage，并存localStorg
    if (isNotEmpty(dataCenter.user.pageLanguage)) {
        language = dataCenter.user.pageLanguage;
        localStorage.setItem("zj_page_language", language);
    }

    //根据language判断localStorg中有没有翻译内容缓存
    // 没有，手动引用js文件，js文件名:language+".js"，通过绝对路径获取
    // 获取语言配置文件翻译内容，存localStorg
    //     key："zj_"+language+"_language"
    //     value：翻译json
    let languageJson = localStorage.getItem("zj_language_" + language);
    if (isEmpty(languageJson)) {
        // loadJS('./../../modelview/translate/' + language + '.js', function () {
        //     languageJson = window["zj_language_" + language];
        //     localStorage.setItem("zj_language_" + language, JSON.stringify(languageJson));
        //     $('[data-language]').each(function () {
        //         let languageValue = $(this).attr("data-language");
        //         $(this).text(languageJson[languageValue]);
        //     });
        // });
    } else {
        languageJson = JSON.parse(languageJson);
        // copy整个window的dom，根据属性名"data-language"查找需要替换文字的标签，替换文字翻译，再覆盖更新整个页面的dom
        // 标签中属性："data-language"
        // 样例：<div data-language="approval_role"></div>
        if (!dom) {
            $('[data-language]').each(function () {
                let languageValue = $(this).attr("data-language");
                $(this).text(languageJson[languageValue]);
            });
        } else {
            $(dom).find('[data-language]').each(function () {
                let languageValue = $(this).attr("data-language");
                $(this).text(languageJson[languageValue]);
            });
        }

    }


}


/**
 * 动态引用js文件
 * @param {String} url 文件路径 
 * @param {String} callback 文件加载好后的回调
 */
function loadJS(url, callback) {
    var script = document.createElement('script'),
        fn = callback || function () { };
    script.type = 'text/javascript';
    // IE
    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState == 'loaded' ||
                script.readyState == 'complete') {
                script.onreadystatechange = null;
                fn();
            }
        };
    } else {
        // 其他浏览器
        script.onload = function () {
            fn();
        };
    }
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
}


/**
 * 代办列表跳转审批页
 * @param {String} taskInfo 代办任务信息
 * @param {boolean} self true = 新开页签  false = 当前页签
 */
function taskToApprove(taskInfo, self = true) {
    dataCenter.to = {
        pageNode: taskInfo.pagenode,
        fromNode: taskInfo.fromnode,
        infoId: taskInfo.conceptid,
        taskId: taskInfo.id,
        projectId: taskInfo.projectid,
        state: "task",
        other: taskInfo.infojson,
        taskInfo:taskInfo
    }
    toUrl("./" + taskInfo.pagename + ".html", self, false)
}
/**
 * 由草稿箱列表转到信息详情页
 */
function draftToDetail(info) {
    dataCenter.to = {
        pageNode: info.pagenode,
        fromNode: info.fromnode,
        draftInfoId: info.id,
        state: info.state
    }
    toUrl("./" + info.pagename + ".html", false, false)
}

/**
 * 校验数据是否符合查询条件
 * @param {*} info 
 * @param {*} searchObj 查询对象
 * @returns {Boolean} 是否符合查询条件
 */
function verifySearch(info, searchObj) {
    let searchSql = "";

    const searchFields = searchObj.searchField;
    const searchValues = searchObj.searchValue;
    const searchConditions = searchObj.searchCondition;
    if (isEmpty(searchFields) || isEmpty(searchValues) || isEmpty(searchConditions)) {
        return false;
    }
    for (let i = 0; i < searchFields.length; i++) {
        const field = searchFields[i];
        const value = searchValues[i];
        const condition = searchConditions[i];
        const fieldList = isNotEmpty(field) ? field.split('$$$') : [];
        const valueList = isNotEmpty(value) ? value.split('$$$') : [];
        const conditionList = isNotEmpty(condition) ? condition.split('@@@') : [];
        if (fieldList.length != valueList.length || fieldList.length != conditionList.length) {
            return false;
        }
        if (conditionList.length >= 2) {
            searchSql += '(';
        }
        for (let j = 0; j < fieldList.length; j++) {
            let _field = fieldList[j];
            let _value = valueList[j];
            let condition = conditionList[j];
            //解析条件
            const conditionType = condition.split('$$$')[0];
            const conditionOperator = condition.split('$$$')[1];

            //添加逻辑运算符
            if (searchSql.length > 0 && searchSql != '(') {
                searchSql += transformConditionType(conditionType);
            }

            //转换判断条件
            if (info[_field] === undefined) { //主信息中没有这个字段，判断肯定不成立
                searchSql += false;
            } else {
                searchSql += transformConditionOperator(info, conditionOperator, _field, _value);
            }
        }
        if (conditionList.length >= 2) {
            searchSql += ')';
        }
    }
    console.log(searchSql);
    return eval(searchSql);
}

//转换逻辑运算符
function transformConditionType(conditionType) {
    switch (conditionType) {
        case "and":
            return " && ";
            break;
        case "or":
            return " || ";
            break;
        default:
            return "";
            break;
    }
}

//转换判断条件
function transformConditionOperator(info, conditionOperator, _field, _value) {
    var searchSql = "";
    switch (conditionOperator) {
        case "like":
            searchSql += info[_field].indexOf(_value.replace(/^%+|%+$/g, '')) > -1;
            break;
        case "FIND_IN_SET_1":
            searchSql += info[_field].indexOf(_value) > -1;
            break;
        case "FIND_IN_SET_2":
            searchSql += _value.indexOf(info[_field]) > -1;
            break;
        case "=":
            searchSql += info[_field] == _value
            break;
        case "!=":
            searchSql += info[_field] != _value
            break;
        case ">":
            searchSql += info[_field] > _value
            break;
        case "<":
            searchSql += info[_field] > _value
            break;
        case ">=":
            searchSql += info[_field] >= _value
            break;
        case "<=":
            searchSql += info[_field] <= _value
            break;
        default:
            searchSql += info[_field] == _value
            break;
    }
    return searchSql;

}




function GetUrlRequest(url) {
    var theRequest = new Object();
    strs = url.split("&");
    for (var i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
    }
    return theRequest;
}

/**
 * 批量再批量
 * @param {Arry} paramList  参数集合
 * @param {num} num 批量接口每次处理信息条数
 * @param {fun} progressFun 进度回调函数
 * @param {fun} callback 处理完回调函数
 */
function batch_re_batch(paramList, num, progressFun, callback) {
    //将paramList按num等分成多个数组，paramList_arry.length就是需要处理的批次
    let paramList_arry = split_array(paramList, num);
    //总的已处理数
    let done_num = 0;
    //每次批处理的结果集合
    let resultList = [];
    //显示蒙板
    startMark()
    batch_re_batch_recursion(done_num, paramList_arry, resultList, progressFun, callback)
}

//默认每次只调用6个接口，完成后开启下一个6个接口
function batch_re_batch_recursion(done_num, paramList, resultList, progressFun, callback) {
    //本次循环已完成次数
    let this_done = 0;
    //获取每次批处理的参数集合，最后一个批次的参数获取加了判断，不能超出总结集合
    for (let j = done_num * 6; j < (done_num + 1) * 6 && (done_num * 6 < paramList.length); j++) {
        //每接口的参数集合
        let batchParams = paramList[j];
        let params = {
            info: JSON.stringify({
                info: batchParams
            })
        };
        zjxxAjaxBatch(params, function (result) {
            //本批次已处理数+1
            this_done = this_done + 1;
            //每次批处理结果汇总
            resultList.push(result);
            //每次批处理都会触发回调，返回：本次批处理结果， 之前批处理结果集合
            progressFun(result, resultList);
            //判断是否全部完成，6个一批，所有批次都完成
            if (paramList.length == this_done + done_num * 6) {
                //全部完成触发完成回调，返回批处理结果集合	
                callback(resultList)
                //结束蒙版
                endMark()
            }
            //本次批次所有接口已处理完，递归开启下一个循环
            else if (this_done == 6) {
                //总完成批次数+1
                done_num = done_num + 1;
                //递归开启下一个循环
                batch_re_batch_recursion(done_num, paramList, resultList, progressFun, callback)
            }
        }, function (result) {
            err(result);
        });
    };
}

//将数组array分成长度为len的小数组并返回新数组
function split_array(arr, len) {
    var a_len = arr.length;
    var result = [];
    for (var i = 0; i < a_len; i += len) {
        result.push(arr.slice(i, i + len));
    }
    return result;
}

/**
 * 登录函数
//  * @param {*} adcount 账号
//  * @param {*} password 密码
//  * @param {*} orgid 机构id
 * @param {*} logininfo 登录参数
 * @param {*} tokentype 登录类型 web=web端登录，wx=微信小程序端登录
 * @param {*} okcallback 登录成功后回调
 * @param {*} errorcallback 登录失败后回调
 */
function login(logininfo, tokentype,okcallback, errorcallback) {
    if (isEmpty(logininfo.orgid)) {
        logininfo.orgid = isEmpty(sysSet.topOrgid) ? "" : sysSet.topOrgid;
    }
    
    logininfo.loginType=tokentype
    var info = {
        id: "",
        type: "info",
    }
    info.info=logininfo
    let params = {
        info: JSON.stringify(info)
    };
    zjxxAjax("login", params, function (data) {
        console.log(data);
        let tokenInfo = data.login.token;
        tokenInfo = JSON.parse(tokenInfo)
        localStorage.setItem("token", tokenInfo[tokentype][tokenInfo[tokentype].length - 1]["token"]);
        var userInfo = data.infos[0];
        userInfo.ip = data.login.ip;
        userInfo.logintime = data.login.logintime;
        userInfo.orginfo = JSON.parse(userInfo.orginfo);
        dataCenter.user.setUser(userInfo);
    //     dataCenter.user.roles =  [ //进页面分配，出页面删除
    //         {
    //             roleId: '', //角色id
    //             roleName: '知识编者',//角色名称,
    //             orgId: '',//组织id
    //             orgName: '',//组织名称
    //             roleType:5,//角色类型
    //             dataField:'delayreason'//字段名称
    // //比如：1系统角色sysRole，2信息角色dataRole，3项目角色，4任务角色，5数据角色
    //         },
    //     ];
        var userRoleList = userInfo.orgroleinfo ? JSON.parse(userInfo.orgroleinfo) : [];
        userRoleList.forEach(element => {
            if (element.state == 0) {
                return;
            }
            element.roleId = element.id;
            element.orgId = element.orgid;
            element.roleName = element.title;
            dataCenter.user.addRole(element);
        });
        localStorage.setItem("user", JSON.stringify(dataCenter.user));
        //查询我有效的机构角色和我自己的动态权限
        var search = {
            orderType: '',
            searchValue: ["1", "%" + dataCenter.user.id + "%"],
            searchField: ["valid", "userlist"],
            searchCondition: ["and$$$=", "and$$$like$$$("]
        }
        userRoleList.forEach(element => {
            if (element.state == 0) {
                return;
            }
            search.searchValue.push("%" + element.id + "%");
            search.searchField.push("rolelist");
            search.searchCondition.push("or$$$like");
        });
        var orgList = userInfo.orginfo || [];
        orgList.forEach(element => {
            if (element.state == 0) {
                return;
            }
            search.searchValue.push("%" + element.id + "%");
            search.searchField.push("deplist");
            search.searchCondition.push("or$$$like");
        });
        if (search.searchField[search.searchField.length - 1] == "deplist") {
            search.searchCondition[search.searchCondition.length - 1] = "or$$$like$$$)";
        } else if (search.searchField[search.searchField.length - 1] == "rolelist") {
            search.searchCondition[search.searchCondition.length - 1] = "or$$$like$$$)";
        } else {
            search.searchCondition[search.searchCondition.length - 1] = "and$$$like";
        }
        
        var infoClass = {
            "id": sysSet.classid.permissionconfig
        }
        let params = {
            infoClass: JSON.stringify(infoClass),
            search: JSON.stringify(search)
        };
        //调用查询列表接口
        zjxxAjaxList(params, function (data) {
            let permissionList = data.infos;
            localStorage.setItem('permissionList', JSON.stringify(permissionList));
            if(typeof okcallback != undefined && typeof okcallback == "function"){
                okcallback();
            }else{
                alert("未配置登录成功回调方法");
            }
        });
    }, function (err) {
        if(typeof errorcallback != undefined && typeof errorcallback == "function"){
            errorcallback(err);
        }else{
            alert(err);
        }
    })
}


/**
 * 注销函数
 */
function loginout(callback) {
    let params = "";
    zjxxAjax("logout", params, function (data) {
        console.log(data);
        callback(data)
    }, function (err) {
        alert(err.msg);
    })
}




	

		
/**
 * 	ajax开始：
 * @param {*} thing 事件
 * @returns 
 */
function startAjax_thing(thing, url, params){
	if(dataCenter.showMark == 1){
		//创建thing对象：事件type=1，progress=1。
		thing.id = uuid();
		thing.type = 1;
		thing.progress = 1;
		// 接口的事件名称：添加一个参数，传事件名称。如果没有就使用默认规则：classid转译成中文+接口名称转译成中文 
		// 例如：车型增加
		if(isEmpty(thing["thingName"])){
			let interfaceName = getInterfaceName(url);
			if( interfaceName ==  "批处理"){
				thing["thingName"] = "批量处理任务";
			}else if (thing["thingName"]=='上传文件'|| thing["thingName"]=='下载文件') {
				thing["thingName"] = thing["thingName"]
			}else{
				// let infoClass = JSON.parse(params.infoClass);
				// thing["thingName"] = interfaceName+infoClass.id;
				thing["thingName"] = interfaceName
			}
		}
		add_thing(thing);
		return thing;
	}else{
		return {};
	}
}

function getInterfaceName(url) {
	let interface = url.split("/");
	let interfaceName = interface[interface.length-1];
	switch (interfaceName) {
		case "addOrUpdate":
			// interfaceName = "新增、修改"
			interfaceName = "新增/修改信息"
			break;
		case "list":
			// interfaceName = "列表查询"
			interfaceName = "信息批量查询"
			break;
		case "detail":
			// interfaceName = "详情查询"
			interfaceName = "信息详情查询"
			break;
		case "delete":
			// interfaceName = "删除"
			interfaceName = "信息删除"
			break;
		case "import":
			// interfaceName = "导入"
			interfaceName = "数据导入"
			break;
		case "export":
			// interfaceName = "导出"
			interfaceName = "数据导出"
			break;
		case "batch":
			interfaceName = "批处理"
			break;
		default: interfaceName = "处理信息";
			break;
	}
	return interfaceName;
}

/**
 * ajax进行中（进度条）
 * thing 事件
 */
function modifyAjax_thing(thing, progress){
	if(dataCenter.showMark == 1){
		thing.progress=progress;
		return thing;
	}else{
		return {};
	}
	
}

/**
 * ajax完成
 * thing 事件
 */
function endAjax_thing(thing){
	if(dataCenter.showMark == 1){
		thing.progress='end'
		return thing;
	}else{
		return {};
	}
}


/** 由业务启动mark(startMark)
 * 启动mark蒙板
 * @param {*} list 业务定义事件集合
 * @param {*} type 1、加载loading 2、显示具体任务
 */
function startMark(list,type){
	//1、设置全局变量
	dataCenter.showMark = 1;
	//2、将事情数组thingsArray清空
	dataCenter.thingsArray = isEmpty(list)?[]:list;
	//3、显示mark
		showMark(type);	
	//4、监听函数修改mark页面显示	
}


/** 由业务关闭mark(endMark)
 * 关闭mark蒙板
 */
function endMark(type){
	//1、设置全局变量
	dataCenter.showMark = 0;
	//2、将事情数组thingsArray清空
	dataCenter.thingsArray = [];
	//3、隐藏mark
		hideMark(type);	
}

/**
 * 添加事件
 * @param {*} thing 事件对象
 */
function add_thing(parmas)
{
	let thing = parmas;
	dataCenter["thingsArray"]?dataCenter["thingsArray"]:dataCenter["thingsArray"]=[];
	dataCenter.thingsArray.push(thing);
	return thing;
}

/**
 * 添加事件
 * @param {*} id 事件id
 * @param {*} progress 进度
 */
function modify_thing(thing, progress)
{
	thing.progress = progress;
	return thing;
}


// 监听函数:
//  每隔100毫秒，检查下thingsArray，if thingsArray.length == 0 不做处理
//  刷新mark上每个事件的状态
//  如果mark没有显示对应事件，就添加
//  如果满足条件：thingsArray.length>0且所有事情为结束状态，就隐藏mark。


/**
 * 任务加载弹窗
 * 
 */
function showMark(type) {
	if(type==2){
		if ($("#thingsListProgress").length ==0) {
			$("body").append(thingsListProgressTemplate);
			//运行中的点点点动画
			animateDots();
		} else {
				$("#thingsListProgress").show();
		}
	}else{
		if ($("#circleListProgress").length ==0) {
			$("body").append(circleListProgressTemplate);
			//运行中的点点点动画
			animateDots();
		} else {
				$("#circleListProgress").show();
		}
	}
	//刷新hideMark
	refreshMark(type);
}

/**
 * 隐藏任务加载弹窗
 */
function hideMark(type) {
	//清除定时器
	dataCenter.refreshMarkInterval && clearInterval(dataCenter.refreshMarkInterval);
	//隐藏弹窗
	if(type==2){
		setTimeout(function () {
			$("#thingsListProgress").hide();
			//清空数据
			$("#thingsListProgress").find(".zjMark_thingsText").text('数据处理中请勿关闭网页')
			$("#thingsListProgress").find(".zj-progress1-bg").css("width","0%")
			$("#thingsListProgress").find(".zjMark_type_2").empty()
			var span=`<span>0%</span>`
			$("#thingsListProgress").find(".zj-progress-text").empty().append(span)
			$("#thingsListProgress").find("tbody").html("");
			
		}, 3000);
	}else{
		$("#circleListProgress").hide()
	}
}
/**
 * 运行中的点点点动画
 */
function animateDots() {
	let count = 1;
	setInterval(() => {
		count = count % 3;
		$(".dot1").css("opacity", (count === 1) ? 1 : 0.3);
		$(".dot2").css("opacity", (count === 2) ? 1 : 0.3);
		$(".dot3").css("opacity", (count === 0) ? 1 : 0.3);
		count++;
	}, 500);
}

/**
 * 间隔500毫秒，刷新一次，监听dataCenter.thingsArray的变化，刷新
 */
function refreshMark(type) {
	dataCenter.refreshMarkInterval = setInterval(() => {
		let doneNum = 0;
		dataCenter.thingsArray.forEach((thing,i) => {
			//判断是否已经完成
			if (thing.progress == "end") {
				doneNum++;
			}
			if (thing.type==2) {
				if (i==0) {
					var type2Things=`<span class='zj-m-r-lg-css' style='font-size: 16px;' tingid='${thing.id}'>${thing.thingName}</span>`
					$("#thingsListProgress").find(".zjMark_type_2").empty().append(type2Things)
				}else{
					if ($("#thingsListProgress").find(".zjMark_type_2").find('span[tingid='+thing.id+']').length==0&&dataCenter.thingsArray[i-1].progress == "end") {
						var type2Things=`<span class='zj-m-r-lg-css' style='font-size: 16px;' tingid='${thing.id}'>${thing.thingName}</span>`
						$("#thingsListProgress").find(".zjMark_type_2").empty().append(type2Things)
					}
				}
			}else{
				let progress = $("#" + thing.id).find(".zjMark_progress");
				if (progress.length > 0) {
					if (thing.progress != progress.attr("progress")) {
						//替换
						progress.parents("tr").replaceWith(getThingTemplate(thing));
					}
				} else {
					//获取事件模版
					let thingTemplate = getThingTemplate(thing);
					$("#thingsListProgress").find("tbody").append(thingTemplate);
				}
			}
			var percent=(doneNum/dataCenter.thingsArray.length)*100
			$("#thingsListProgress").find(".zj-progress1-bg").css("width",percent.toFixed(2)+"%")
			$("#thingsListProgress").find(".zj-progress1-bg").css("background-color","#20B759")
			if (percent==100) {
				$("#thingsListProgress").find(".zjMark_thingsText").text('数据处理完成，3秒后将会自动关闭弹窗')
				var svg=`<svg t="1690790969651" class="icon zjMark_taskOK" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5858" width="20" height="20"><path d="M511.950005 512.049995m-447.956254 0a447.956254 447.956254 0 1 0 895.912508 0 447.956254 447.956254 0 1 0-895.912508 0Z" fill="#20B759" p-id="5859"></path><path d="M458.95518 649.636559L289.271751 479.95313c-11.698858-11.698858-30.697002-11.698858-42.39586 0s-11.698858 30.697002 0 42.395859l169.683429 169.68343c11.698858 11.698858 30.697002 11.698858 42.39586 0 11.798848-11.598867 11.798848-30.597012 0-42.39586z" fill="#FFFFFF" p-id="5860"></path><path d="M777.62406 332.267552c-11.698858-11.698858-30.697002-11.698858-42.39586 0L424.158578 643.437164c-11.698858 11.698858-11.698858 30.697002 0 42.39586s30.697002 11.698858 42.39586 0l311.069622-311.069622c11.798848-11.798848 11.798848-30.796992 0-42.49585z" fill="#FFFFFF" p-id="5861"></path></svg>`
				$("#thingsListProgress").find(".zj-progress-text").empty().append(svg)
			}else{
				$("#thingsListProgress").find(".zj-progress-text").find('span').text(percent.toFixed(2)+"%")
			}
		});
		$(".zjMark_doneNum").text(doneNum);
		if (doneNum == dataCenter.thingsArray.length) {
			$("#thingsListProgress").find(".zjMark_thingsText").text('数据处理完成，3秒后将会自动关闭弹窗')
			$("#thingsListProgress").find(".zj-progress1-bg").css("width","100%")
			$("#thingsListProgress").find(".zj-progress1-bg").css("background-color","#20B759")
			var svg=`<svg t="1690790969651" class="icon zjMark_taskOK" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5858" width="20" height="20"><path d="M511.950005 512.049995m-447.956254 0a447.956254 447.956254 0 1 0 895.912508 0 447.956254 447.956254 0 1 0-895.912508 0Z" fill="#20B759" p-id="5859"></path><path d="M458.95518 649.636559L289.271751 479.95313c-11.698858-11.698858-30.697002-11.698858-42.39586 0s-11.698858 30.697002 0 42.395859l169.683429 169.68343c11.698858 11.698858 30.697002 11.698858 42.39586 0 11.798848-11.598867 11.798848-30.597012 0-42.39586z" fill="#FFFFFF" p-id="5860"></path><path d="M777.62406 332.267552c-11.698858-11.698858-30.697002-11.698858-42.39586 0L424.158578 643.437164c-11.698858 11.698858-11.698858 30.697002 0 42.39586s30.697002 11.698858 42.39586 0l311.069622-311.069622c11.798848-11.798848 11.798848-30.796992 0-42.49585z" fill="#FFFFFF" p-id="5861"></path></svg>`
			$("#thingsListProgress").find(".zj-progress-text").empty().append(svg)
			endMark(type);
		}
	}, 500);
}


/**
 * 任务模版
 * @param {*} thing 任务对象
 * @returns {String} 任务模版
 */
function getThingTemplate(thing) {
	let progress = "";
	if (thing.progress == 0) {
		progress = "未开始";
	} else if (thing.progress > 0 && thing.progress <= 1) {
		progress = "进行中";
	} else if (thing.progress == "end") {
		progress = "已完成";
	};
	let thingTemplate = `
			<tr class="zj-h45-css" name="id" id="${thing.id}">
				<td><input type="text" value="${thing.thingName}" title="${thing.thingName}" name="thingName" disabled=""></td>
				<td>
					<div class="zj-flexCC-css">
						<svg t="1690790924278" class="icon zjMark_taskWait" ${thing.progress != 0 ?  "style='display: none'":""} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4651" width="20" height="20"><path d="M512 73.142857A438.857143 438.857143 0 1 1 73.142857 512 438.857143 438.857143 0 0 1 512 73.142857m0-73.142857a512 512 0 1 0 512 512A512 512 0 0 0 512 0z" p-id="4652" fill="#f4ea2a"></path><path d="M265.508571 475.428571h492.982858v73.142858H265.508571z" p-id="4653" fill="#f4ea2a"></path></svg>
						<svg t="1690790969651" class="icon zjMark_taskOK" ${thing.progress != "end" ? "style='display: none'" : ""}  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5858" width="20" height="20"><path d="M511.950005 512.049995m-447.956254 0a447.956254 447.956254 0 1 0 895.912508 0 447.956254 447.956254 0 1 0-895.912508 0Z" fill="#20B759" p-id="5859"></path><path d="M458.95518 649.636559L289.271751 479.95313c-11.698858-11.698858-30.697002-11.698858-42.39586 0s-11.698858 30.697002 0 42.395859l169.683429 169.68343c11.698858 11.698858 30.697002 11.698858 42.39586 0 11.798848-11.598867 11.798848-30.597012 0-42.39586z" fill="#FFFFFF" p-id="5860"></path><path d="M777.62406 332.267552c-11.698858-11.698858-30.697002-11.698858-42.39586 0L424.158578 643.437164c-11.698858 11.698858-11.698858 30.697002 0 42.39586s30.697002 11.698858 42.39586 0l311.069622-311.069622c11.798848-11.798848 11.798848-30.796992 0-42.49585z" fill="#FFFFFF" p-id="5861"></path></svg>
						<div name="progress" class="zjMark_progress" progress="${thing.progress}">${progress}</div>
						<div class='loading-dots'  ${thing.progress == 0 ||thing.progress=="end"?  "style='display: none'" : ""} >
							<span class='dot1'>.</span>
							<span class='dot2'>.</span>
							<span class='dot3'>.</span>
						</div>
					</div>
				</td>
			</tr>
		`;
	return thingTemplate;
}

function progressColse() {
	//二次确认弹出框dialog
	confirmDialog("提示", "请确认是否删除！", function(){
		
	}, function(){
	})
}

//任务加载弹窗模版
let thingsListProgressTemplate = `
	<div id="thingsListProgress" class="zj-modal" style="z-index:10000000;">
        <div class="zj-modal-mask"></div>
        <div class="zj-modal-wrap" style="width: 520px">
            <div class="zj-modal-content">
                <button type="button" class="zj-modal-close zj-none-css" onclick='progressColse()'>
                    <span class="zj-modal-close-x">
                        <span class="zj-icon zj-icon-close zj-modal-close-icon">
                            <svg viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em"
                                fill="currentColor" aria-hidden="true">
                                <path
                                    d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z">
                                </path>
                            </svg>
                        </span>
                    </span>
                </button>
                <div class="zj-modal-header">
                    <div class="zj-modal-title">数据处理列表</div>
                </div>
                <div class="zj-modal-body zj-p-t-0">
                    <div class="zj-margin-top-24">
                        <div class="zj-flexSS-css zj-maxWidth-css">
                            <div class="zj-boxLeft-css">
								<div class="zj-flexSS-css zj-margin-bottom-lg">
									<svg class="icon" style="width: 1.2em;height: 1.2em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3776">
										<path d="M572.074667 337.134933a57.275733 57.275733 0 1 0-114.176-6.007466h-0.170667l12.936533 272.896v0.443733a44.544 44.544 0 1 0 89.019734-1.194667l12.424533-266.1376z m-196.949334-191.214933c76.151467-130.048 199.816533-129.774933 275.797334 0l340.3776 581.085867c76.117333 130.048 15.7696 235.4176-135.236267 235.4176H169.984c-150.8352 0-211.217067-105.6768-135.202133-235.4176L375.125333 145.92z m140.049067 687.581867a57.275733 57.275733 0 1 0 0-114.517334 57.275733 57.275733 0 0 0 0 114.517334z" fill="#FB6547" p-id="3777"></path>
									</svg>
									<span class='zjMark_thingsText zj-m-l-md-css' style='font-size: 16px;'>数据处理中请勿关闭网页</span>	
								</div>
								<div class="zj-progress zj-progress-line zj-progress-status-exception zj-progress-show-info">
									<div class="zj-progress-outer" style="width: 100%;height: 14px;">
										<div class="zj-progress-inner">
											<div class="zj-progress1-bg"
												style="height: 14px;"></div>
										</div>
										<div  class="zj-progress-text">
											<span>0%</span>	
										</div>
									</div>
								</div>
								
								<div class="zj-flexSS-css zj-margin-bottom-lg ">
									<span class='' style='font-size: 16px;'>处理状态：</span>
									<div class='zjMark_type_2'>
									</div>
								</div>
                                <div class="zj-none-css">
                                    <div class="zj-flexSS-css zj-row zj-m-t-xs-css">
                                        <div class="zj-table-div-css" style="max-height: 300px;overflow-y: auto;">
                                            <table class="zj-table-css">
                                                <thead>
                                                    <tr class="zj-table-tr">
                                                        <th class="zj-minw200-css">任务名
                                                            <div class="zj-tableLine-css"></div>
                                                        </th>
                                                        <th class="zj-minw100-css">状态
                                                            <div class="zj-tableLine-css"></div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`

//任务加载弹窗模版--转圈
let circleListProgressTemplate = `
	<div id="circleListProgress" class="zj-modal" style="z-index:10000000;">
        <div class="zj-modal-mask"></div>
        <div class="ant-spin-nested-loading">
			<div>
				<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text" aria-live="polite" aria-busy="true"><span
					class="ant-spin-dot ant-spin-dot-spin"><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i
					class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i></span>
				<div class="ant-spin-text" xt-marked="ok">Loading...</div>
				</div>
			</div>
		</div>
    </div>
`;

/**
 * 将list查询条件转换为ES查询条件
 * @param {object} listParma - list查询条件
 * @param {string} index - 索引
 * @returns {object} EsParma - 转换后的ES查询条件
 */
function listParmaToEsParma(listParma, index) {
    let search = JSON.parse(listParma.search);
    let info = JSON.parse(listParma.info);
    let EsParma = {
        index:index,
        infoClass:listParma.infoClass,
        query:JSON.stringify(listSearchToEsSearch(search)),
        highlight:JSON.stringify(info._ES_highlight),
        order:search.orderType?search.orderType:undefined,
        page:listParma.page,
        promise:JSON.stringify({"functionName":"esSearch"}),
        source:info.fields?info.fields:undefined,
    };
    return EsParma;
}


function zjxxAjaxEsList(parma, index, callback){
    let EsParma = listParmaToEsParma(parma, index);
    zjxxAjaxRun(EsParma, callback)
}



function listSearchToEsSearch(searchObj){
	let query = {queryType:"bool",children:[],config:[]};//基础query对象
	let bracesCount = 0;//括号控制 (+1  ,  )-1
	//let level = [query];//层级控制
	let link = query;//指向控制
	let bracesCountDelay = 0; //延后控制 
	
	//遍历检查、并单独组装
	searchObj.searchCondition.forEach(function(item,index,arr){
		let itemArray = item.split('$$$');//拆解searchCondition
		//有第三项
		if(itemArray[2]){
			//遍历。因为可能有多组括号
            let newLevel ="";
			itemArray[2].split('').forEach(function(item,index,arr){
				if(item=='('){
					bracesCount++;
					//建立新层级
                    //if(index == 0){
                        link.config.push((itemArray[0]=='and')?"must":"should");
                        newLevel = {queryType:"bool",children:[],config:[]};
                    //}
					link.children.push(newLevel);
					//level.push(newLevel);
					//指向新层级,需重新计算
					link = setLink(query,bracesCount);
				}else if(item==')'){
					bracesCountDelay--;//但不能立即刷新层级，需要延后处理
				}
			});
		}
		//根据and还是or、控制上级config里的是must还是should
		if(itemArray[0]=='and' || link.config.length==0){//如果自己是or的子项开头，那么should已经在父项设置过了。自己这项可以默认must、等后一项来决定是否改写成should
			link.config.push("must");
			if(itemArray[0]=='or'){//如果是or的子项进来的，那么还要追加修改父项的前一个config
				let parentlink = setLink(query,bracesCount-1);//查找上级link
				parentlink.config[parentlink.config.length-2] = "should";//-2是因为当前已经添加了一个子项，所以要查倒数第二个			
			}
		}else if(itemArray[0]=='or'){
			//如果是or、追加去修改前一个config
			link.config[link.config.length-1] = "should";
			link.config.push("should");		
		}
		
		//解析条件类型
		let queryType = "match";
		//条件值变化，范围查询需要修改、通配符查询需要修改**
		let querySearch = searchObj.searchValue[index];
		//查询字段，根据类型变化。可能要查keyword
		let queryFields = searchObj.searchField[index];
        //权重，默认是0=不需要权重
        let queryWeight =  0;
        //如果有设置就获取
        if(isNotEmpty(searchObj["searchWeight"])){
            queryWeight = searchObj.searchWeight[index];
        }
        
        //查询配置
        let queryConfig = "";
		
		
		//根据条件类型。修改配置
		
		switch(itemArray[1]){
			case '=': //精确查询，不用传keyword，后端会处理
				queryType = "term";
				queryFields = queryFields;
				break;
			case 'like': //wildcard 通配符查询
				queryType = "wildcard";
				querySearch = "*"+replaceAll(querySearch,"%","")+"*";
				break;
            case 'match': //分词查询
                queryType = "match";
                querySearch = querySearch;
                break;
            case 'fuzzy': //纠错检索
                queryType = "fuzzy";
                querySearch = uerySearch;
                break;
			case '>':
                queryType = "range";
                queryConfig = ">";
                querySearch = querySearch;
                break;
			case '<':
                queryType = "range";
                queryConfig = "<";
                querySearch = querySearch;
                break;
            case '>=':
                queryType = "range";
                queryConfig = ">=";
                querySearch = querySearch;
                break;
			case '<=':
                queryType = "range";
                queryConfig = "<=";
                querySearch = querySearch;
                break;
            case '!=':
                queryType = "term";
                querySearch = querySearch;
                //修改主项config为must_not
                link.config[link.config.length - 1] ="must_not";
                break;
			// 	queryType = "range";
			// 	querySearch = "";
				break;
		}
		
		
		//各自组合成一个queryItem
		let queryItem = {queryType:queryType,fields:[queryFields],search:[querySearch],config:[queryConfig]};
        //判断是否需要添加权重查询
        if(isNotEmpty(queryWeight) || queryWeight == 0){
            queryItem["boots"]=[queryWeight+""]
        }
		//console.log(itemArray);
		link.children.push(queryItem);
		//刷新层级关系
		bracesCount = bracesCount + bracesCountDelay;
		bracesCountDelay = 0;//重置
		link = setLink(query,bracesCount);
	});
	console.log(query);
    return query;
}

function setLink(query,bracesCount){
	//重定位至底层
	let link = query;
	//依据层级深入，指向对应层级最后一个
	for(let i = 0;i<bracesCount;i++){
		link = link.children[link.children.length-1];
	}
	return link
}

/*
 * 列表大数量查询，分成多次查询
 * @param {int} num = 6 默认每次只调用6个接口，完成后开启下一个6个接口
 * @param {Object} parmas 接口参数，给第一页参数，后续代码会自动修改page
 * @param {Object} progressFun 进度回调
 * @param {Object} callback 结果回调
 */
function large_quantity_search(num = 6, parmas, progressFun, callback) {
    //每次批处理的结果集合
    let resultList = [];
    //显示蒙板
    startMark()
    let page = JSON.parse(parmas.page);
    let currPage = page.currPage
    large_quantity_search_recursion(num, parmas, currPage, progressFun, callback, resultList)
}

/**
 * @param {int} num = 6 默认每次只调用6个接口，完成后开启下一个6个接口
 * @param {Object} parmas 接口参数，给第一页参数，后续代码会自动修改page
 * @param {int} currPage 本批次从第几页开始
 * @param {Object} progressFun 进度回调
 * @param {Object} callback 结果回调
 * @param {Object} resultList 最终结果
 */
//默认每次只调用6个接口，完成后开启下一个6个接口
function large_quantity_search_recursion(num = 6, parmas, currPage, progressFun, callback, resultList) {
    //本次循环已完成次数
    let this_done = 0;
    //本次循环返回数据为空的次数
    let this_nullData = 0;
    //获取每次批处理的参数集合，最后一个批次的参数获取加了判断，不能超出总结集合
    for (let j = 0; j < num; j++) {
        //每次接口的参数，主要是处理page的currPage
        let this_page = JSON.parse(parmas.page);
        this_page.currPage = currPage + j;
        parmas.page = JSON.stringify(this_page);
        zjxxAjaxList(parmas, function (result) {
            //本批次已处理数+1
            this_done = this_done + 1;
            //判断数据是否为空，为空就是已经查完了
            if(result.infos.length == 0){
                this_nullData = this_nullData + 1;
            }
            //每次批处理结果汇总
            resultList.push(result);
            //每次批处理都会触发回调，返回：本次批处理结果， 之前批处理结果集合
            progressFun(result, resultList);
            //判断本批次是否完成。
            if (this_done ==  num) {
                //判断是否数据都查完了
                if(this_nullData > 0){
                    //结束蒙版
                    endMark()
                    callback(resultList)
                }//本次批次所有接口已处理完，递归开启下一个循环
                else if (this_done == 6) {
                    //分页页码+num
                    currPage = currPage + num;
                    //递归开启下一个循环
                    large_quantity_search_recursion(num = 6, parmas, currPage, progressFun, callback, resultList)
                }
            }
        }, function (result) {
            err(result);
        });
    };
}

/*
 *根据字段得到对象在数组中的位置
 */
 function getPosArrayByField(dataArray, value, field) {
    for (var i = 0; i < dataArray.length; i++) {
        if (dataArray[i][field] == value) {
            return i;
        }
    }
    return -1;
}