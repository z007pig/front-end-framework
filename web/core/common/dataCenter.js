//dataCenter配置项
var dataCenter = {
    base:{},
    //默认数据
    page:{
        pageUrl : '',//页面完整url
        pageName: '',//页面名称
        pageNode: '1',//节点名称，0、1、2、3等
        fromNode: 'normal',//当前页面状态
    },
    menu:{}, //页面菜单数据
    role:{
        //数据角色（附例子）Teacher:{'id':'','title':'教师','description':'Teacher','type':'data',},
    },
    org:{},//组织信息
    other:{},//额外存储信息
    to:{},//需传到下一个页面值
    list: {},//list相关配置
    form: {},//form相关配置
    user: {
        roles: [ //进页面分配，出页面删除
            {
                roleId: '', //角色id
                roleName: '',//角色名称,
                orgId: '',//组织id
                orgName: '',//组织名称
                roleType:'',//角色类型 比如：1系统角色sysRole，2信息角色dataRole，3项目角色，4任务角色
            },
        ],
        orgid: '',//组织id
        addRole: function (role) { //添加用户角色
            if(!isIncludeOfArray(this.roles, role, ["roleId"])){
                this.roles.push(role);
            }
        },
        deleteRole:function(roleId){  //删除用户角色
            deleteArrayByFiled(this.roles,roleId,'roleId');
        },
         //FIXME:新增的方法，没有说明name的格式，  机构名称|角色名称？
        isHasRole: function(roleId) { //用户是否包含角色
            if (this.roles.length < 1) {
                return false;
            }
            for (var i in this.roles) {
                if (roleId == this.roles[i].roleId) {
                    return true;
                }
            }
            return false;
        },
        setUser:function(user){
            if(user!=null){
                var keys = Object.keys(user);
                keys.forEach(function (key) {
                    dataCenter['user'][key] = user[key];
                });
            }
        }
    },//用户信息,
    _init: function () {
        this._initSession();
    },
    //对session的操作
    sessionFields: {
        page: ['pageUrl', 'pageName', 'pageNode', 'fromNode', 'classId', 'infoId'],
        base: ['other', 'state', 'role', 'org', 'menu'],
        form: ['classId', 'state', 'infoId', 'draftInfoId','taskId','projectId'],
        list: ['classId', 'state', 'pid', 'ids'],
        listpage: ['pageSize', 'page', 'pages', 'lines', 'pageStart', 'total'],
    },
    session: {
        // pageUrl : '',//页面完整url
        // pageName: '',//页面名称
        // pageNode: '',//节点名称，0、1、2、3等
        // fromNode: '',//当前流程的msgtype状态
        
        page:{},
        to: {
            'pageNode': '',
            'fromNode': '',
            'classId': '',
            'infoId': '',
            'projectId': '',
            'state': '',
            'taskId':'',//任务id
        },
        form:{
            classId     :'',//栏目id
            infoId      : '',//信息id
            state:'',
            projectId: '',
            taskId:'',//任务id
        },
        list:{
            classId:'',
            pid:'',
            ids:'',
            page:{},
        },
        other: {},
    },//为下一个页面准备获取数据的参数的或者页面所需要的值
    oldSession: [],//根据可以回退的次数来确定保留几次session的值 
    //初始化session
    /* 
    1.从sessionStorage获取session和oldSession，
    2.从session中取出pagename、pageur、pageNode、nodeState、infoId、classId、的值放入dataCenter这几个变量（页面js注入的值的有限级低于上一个页面传入的值）
    */
    //TODO:待添加注释
    _initSession: function () {
        //第一步:从sessionStorage中取出上一个页面传入的oldSession值
        // var user = sessionStorage.getItem('user');
        var user = localStorage.getItem('user');
        var token = localStorage.getItem("token");
        if (user && isNotEmpty(token)) {
            user = JSON.parse(user)
            //user中的token与loc中的token不一致
            if (user.token != token) {
                //执行登录失效方法
                sysSet.loginFailure(data);
            }else{
                dataCenter.user.setUser(user);
            }
        }
        //从dataCenter.session中将值取出放入对应的地方
        session2Data();

        //初始化pageUrl、pageName
        var pageUrl = document.location.pathname;
        var a = location.href;
        var b = a.split("/");
        var c = b.slice(b.length - 1, b.length).toString(String).split(".");
        var pageName = c.slice(0, 1)[0];
        this.page.pageName = pageName;
        this.page.pageUrl = pageUrl;
    },

    //保存session和oldSession
    //TODO:待添加注释
    saveSession: function () {
        //从dataCenter的几个变量中取出值放入session中
        data2Session();

        //将session和oldSession存入sessionStorage
        dataCenter['oldSession'] = JSON.parse(sessionStorage.getItem('oldSession'));
        if(dataCenter['oldSession']==null ||dataCenter['oldSession']==""){
            dataCenter['oldSession']=[];
        }
        if(!isArray(dataCenter['oldSession'])){
            dataCenter['oldSession']=[];
        }
        dataCenter.oldSession.push(dataCenter.session);
        if (dataCenter.oldSession.length > sysSet.backCount) {
            dataCenter.oldSession.shift();
        }
        var nowoldSession = JSON.stringify(this.oldSession);
        sessionStorage.setItem('oldSession', nowoldSession);
        // sessionStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('user', JSON.stringify(this.user));
    },
    //TODO:待添加注释
    pushAndSaveSession:function(session){
        dataCenter['oldSession'] = JSON.parse(sessionStorage.getItem('oldSession'));
        if(dataCenter['oldSession']==null ||dataCenter['oldSession']==""){
            dataCenter['oldSession']=[];
        }
        if(!isArray(dataCenter['oldSession'])){
            dataCenter['oldSession']=[];
        }
        dataCenter['oldSession'].push(session);
        if (dataCenter.oldSession.length > sysSet.backCount) {
            dataCenter.oldSession.shift();
        }
        sessionStorage.setItem('oldSession', JSON.stringify(this.oldSession));
        // sessionStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('user', JSON.stringify(this.user));
    },
    //保存用户session
    saveUserSession:function(user){
        dataCenter.user.setUser(user);
        // sessionStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('user', JSON.stringify(this.user));
    },
    showBlock:{
        '1': {
            'normal': []
        }
    },
    hiddenBlock:{
        '1': {
            'normal': []
        }
    }
}


//获取页面类型:list、form
function getPageType () {
    var type = '';
    if ($("#" + sysSet.mainFormId).length > 0) {
        type = 'form'
    } else if ($("#" + sysSet.mainListId).length > 0) {
        type = 'list'
    }
    return type;
}

//存储session
function data2Session () {
    dataCenter.sessionFields['base'].forEach(function (item) {
        if (dataCenter[item]) {
            dataCenter.session[item] = dataCenter[item];
        }
    });

    dataCenter.sessionFields['page'].forEach(function (item) {
        if (dataCenter['page'][item]) {
            dataCenter.session['page'][item] = dataCenter['page'][item];
        }
    });

    var type = getPageType();
    if (type == 'form') {
        if (!dataCenter.session.hasOwnProperty('form')) {
            dataCenter.session.form = [];
        }
        dataCenter.sessionFields['form'].forEach(function (item) {
            if (dataCenter['form'][sysSet.mainFormId][item]) {
                dataCenter.session['form'][item] = dataCenter['form'][sysSet.mainFormId][item];
            }
        });
    }
    if (type == 'list') {
        if (!dataCenter.session.hasOwnProperty('list')) {
            dataCenter.session.list = [];
        }
        dataCenter.sessionFields['list'].forEach(function (item) {
            if (dataCenter['list'][sysSet.mainListId][item]) {
                dataCenter.session['list'][item] = dataCenter['list'][sysSet.mainListId][item];
            }
        });
        if (!dataCenter.session.list.hasOwnProperty('page')) {
            dataCenter.session.list.page = [];
        }
        dataCenter.sessionFields['listpage'].forEach(function (item) {
            if (dataCenter['list'].length > 0 && dataCenter['list'][sysSet.mainListId][item]) {
                dataCenter.session['list'][page][item] = dataCenter['list'][sysSet.mainListId][item];
            }
        });
    }
    dataCenter.session.to = dataCenter.to;
}

//恢复session
//TODO:按照前端框架文档完成
function session2Data () {
    var toSession = "";
        try {
            var oldSession = JSON.parse(sessionStorage.getItem('oldSession'));
            if (oldSession) {
                dataCenter['oldSession'] = oldSession;
            } else {
                dataCenter['oldSession'] = [];
            }

        }
        catch (e) {
            dataCenter['oldSession'] = [];
            oldSession = null;
        }

        
        
        if (oldSession) {
            toSession = oldSession.pop().to;
        }
        //如果是url传值，且没有.to
        //需要判断session的相关属性和url的参数是否一致，不一致用url的  pageUrl、pageNode、formNode、infoid
        //解决场景：在知识A的详情页，输入图书B详情页链接跳转，页面跳转到图书详情页。页面解析优先拿seesion，但是seesion里面的信息id为知识A的id
        try{
            let locationSearch = location.search;
            locationSearch = locationSearch.substring(1, locationSearch.length);
            locationSearch = Base64.decode(decodeURIComponent(locationSearch));
            let theRequest = GetUrlRequest(locationSearch);
            if(!$.isEmptyObject(toSession) && isNotEmpty(toSession)){
                //同一个详情页面页，打开A的详情页，复制B好的链接到A的页面，显示的还是A的内容
                if(isNotEmpty(theRequest["infoId"]) && toSession["infoId"] != theRequest["infoId"]){
                    toSession["infoId"] = theRequest["infoId"];
                }
                
            }else{
                toSession = theRequest;
            }
        }catch (e) {
        
        }
        
    //第一个页面是没有sessionStorage的
    if (toSession) {
        dataCenter.sessionFields['page'].forEach(function (item) {
            if (toSession[item]) {
                dataCenter['page'][item] = toSession[item];
            }
        });

        dataCenter.sessionFields['base'].forEach(function (item) {
            if (toSession[item]) {
                dataCenter['base'][item] = toSession[item];
            }
        });
        var type = getPageType();
        if (type == 'form') {
            dataCenter.sessionFields['form'].forEach(function (item) {
                if (toSession[item]) {
                    dataCenter['form'][sysSet.mainFormId][item] = toSession[item];
                }
                
            });
        }

        if (type == 'list') {
            dataCenter.sessionFields['list'].forEach(function (item) {
                if (dataCenter.session[item]) {
                    dataCenter['list'][sysSet.mainListId][item] = toSession[item];
                }
            });
            
            dataCenter.sessionFields['listpage'].forEach(function (item) {
                if (dataCenter['list'].length > 0 && dataCenter['list'][sysSet.mainListId][item]) {
                    dataCenter.session[sysSet.mainListId][page][item] = toSession[item];
                }
            });
        }
    }
}





//form配置空模板
var mainForm_blank = {
    //栏目id
    classid: "",
    //信息id 
    infoId: '',
    //草稿箱id，进入页面先判断draftInfoId是否传过来，是就去查草稿，没有就判断infoId
    draftInfoId: '',
    //状态  一个pageNode和formNode下可能还有多种状态
    //TODO:缺少state相关方法
    state: 'info',//信息提交类型：纯信息=info，修改记录=modifyRecord，归档=archive，启动流程=startProcess，完成任务=task
    //需要模版
    isNeedTemp:false,
    //需要获取的字段名，英文逗号分隔
    fileds:"",
    //是否创建项目部门 0=不创建，1=创建 
    projectorg: "0",
    //提交接口后端是否是同步处理逻辑
    isAwaitPostPosition:0,//默认为0，1=后端新增修改接口同步
    down: {
        /*从服务器上下载的数据，有两组数据，一般前端在修改数据时只修改formNewInfo，
        formInfo可以保留，不修改，用来判断前端页面是否对数据做了修改
        */
        info:{},//原始数据
        formInfo: {},
        formNewInfo: {},
    },
    //压缩项，要对特殊字符进行压缩 ，提交会压缩，获取详情会解压，同时作用于两种情况
    decode: ['deviceJson', 'chargingPlan', 'costbookJson', 'productJson'],
    /*FIXME:主要针对IE设置autocomplete="off" 无法禁止浏览器缓存input的值
       很多网站默认是不清除浏览器缓存input的值
       哪个方便用哪个
   */
    //有哪些字段要重置，由于字段比较多，配置起来比较复杂，可以用notDeleteCache
    resetFields: [],
    //notDeleteCache一下部分不清除页面缓存，其他的都清除
    notDeleteCache: ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
    //草稿箱搜索字段内容
    draftSearchField :[],
    event:{
        "beforeSubmit":{
            'all':{//全局配置
                'all':"",//全局配置
            },
            '1':{//pageNode
                'add':"",//fromNode
            },
        },
        "afterSubmit":{
            'all':{//全局配置
                'all':"",//全局配置
            },
            '1':{//pageNode
                'add':"",//fromNode
            },
        },
        "beforeInit":{
            'all':{//全局配置
                'all':"",//全局配置
            },
            '1':{//pageNode
                'add':"",//fromNode
            },
        },
        "afterInit":{
            'all':{//全局配置
                'all':"",//全局配置
            },
            '1':{//pageNode
                'add':"",//fromNode
            },
        },
        "afterSubmitDraft":{
            'all':{//全局配置
                'all':"",//全局配置
            },
            '1':{//pageNode
                'add':"",//fromNode
            },
        },
        
    },
    classPermission:{
        allRole: {
            //只读 通过input的name控制input的只读状态
            view: {
                '1'/*pageNode */: {//当前页面号
                    'index'/*fromNode */: true, //只读
                }
            },
            //必填项 //通过input的name控制input 必填
            mustInput: {
                '1': {
                    'index': true,
                }
            },
            //选填项 //通过input的name控制input 选填
            maybeInput: {
                '1': {
                    'index':true,
                }
            },
            //通过class让元素隐藏  class命名规则：xxx_hidden_xxx
            hidden: {
                '1': {
                    'index': true,
                }
            },
            //showBlock不是控制input，是根据id控制哪些部分需要显示  FIXME:id命名规则：xxx_showBlock_xxx
            showBlock: {
                '1': {
                    'index':true,
                }
            },
        },
    },
    //角色权限
    roleShow: {
        allRole: {
            //只读 通过input的name控制input的只读状态
            view: {
                '1'/*pageNode */: {//当前页面号
                    'index'/*fromNode */: { 'caiwuDHreportmaterialname': 'readonly' },
                    '2'/*fromNode */: {},
                },
                '2': {

                }
            },
            //必填项 //通过input的name控制input 必填
            mustInput: {
                '1': {
                    'index': ['lastName', 'caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
                    '2': [],
                },
                '2': {
                    '1': [],
                    '4': [],
                }
            },
            //选填项 //通过input的name控制input 选填
            maybeInput: {
                '1': {
                    'index': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
                    '2': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                },
                '2': {
                    '1': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                    '4': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                }
            },
            //通过class让元素隐藏  class命名规则：xxx_hidden_xxx
            hidden: {
                '1': {
                    'index': ['lastName', 'caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
                    '2': [],
                },
                '2': {
                    '1': [],
                    '4': [],
                }
            },
            //showBlock不是控制input，是根据id控制哪些部分需要显示  FIXME:id命名规则：xxx_showBlock_xxx
            showBlock: {
                '1': {
                    'index': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
                    '4': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
                },
                '2': {
                    '1': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
                    '4': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
                },
                '4': {
                    '1': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
                    '4': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
                }
            },
        },
    },
    //工作流配置
    workFlow: {
        //流程id
        processkey: 'TCFAP',
        //将哪些信息中的字段存到任务表的description中
        taskField:[],
        createType:"2",// 启动流程：创建任务模式 1=不创建,2=正常创建；任务撤回、驳回：1=只创建初始节点任务，2=正常创建任务  FIXME:追加、指定
        //msgtype流转信息
        msgtype: {
            1: {
                'normal': {
                    'submit': '_1TO2',
                    'submit1': '_1TO3',
                },
                '_2TO1_return': {
                    'submit': '_1TO2',
                },
                '_3TO1_return': {
                    'submit': '_1TO2',
                    'submit1': '_1TO3',
                },
            },
            2: {
                '_1TO2': {
                    'submit': '_2TO3',
                    'return': 'deny2',
                },
            },
            3: {
                '_2TO3': {
                    'submit': 'completed3',
                    'return': 'deny3',
                },
                '_1TO3': {
                    'submit': 'completed3',
                    'return': 'deny3',
                },
            }
        },
        //节点信息
        nodeInfo: {
            1: {
                'nodeName': "创建工时确认单",
                'roleName': '经办人',
                // 'orgName': 'MEDP',
            },
            2: {
                'nodeName': "部门经理审批工时确认单",
                'roleName': '部门经理',
                // 'orgName': 'MEDP',
            },
            3: {
                'nodeName': "派工人审批工时确认单",
                'roleName': '派工人',
                // 'orgName': 'MEDP',
            }
        },
    },
}

//list配置空模板
var mainList_blank = {
    //列表classId
    classId: "",
    //需要模版
    isNeedTemp:false,
    //需要获取的字段名，英文逗号分隔
    fileds:"",
    //列表数据类型
    state:"",
     //是否有子集   默认不传   1=需要
    isNeedSubset:0,
    //是否查询缓存   1=不查缓存
    noCache:0,
    //查询已读、未读
    isOrNotRead : "",//默认为空，all=全部，read=已读列表，unread=未读列表 返回值中zj_readstatus = 0未读，1=已读
    //分页组件，每页条数
    eachPageNum:[10,20,50],
    //分页参数
    page: {
        //每页多少条
        pageSize: 10,
        //第几页
        currPage: 1
    },
    //默认查询search参数
    searchInfo: {
        orderType: "",
        searchValue: "",
        searchField: "",
        searchCondition: ""
    },
    //聚合查询，默认注释，不存在
    // groupBy:{
    //     "groupFiled": "",
    //     "infoclass":"",
    //     "showFileds":[{
    //         "fname":"",//显示字段
    //         "fun":"",//聚合函数名
    //         "asName":""//字段别名
    //     }],
    // },
    //自定义查询条件
    getParamFun: "",
    //信息列表 页面dataCenter可以不写
    listInfos: [],
    //一般情况下 table---false  row----true
    isRow: false,
    //FIXME:对应listCommon的持久化方法，暂未弄清楚具体作用
    isPersist: true, //页面json---false  持久化 -----true
    //FIXME:对应listCommon的相关方法 submitListForm
    deleteIds: [],
    //list searchRole有关，通过name找到input，再通过listSearchParent规则找到父级隐藏（默认在sysSet中设置，list设置>sysSet设置）。
    //FIXME:对应方法还未修改
    listSearchParent:".parent().find('span label')",
    //分页插件样式  目前只有2
    paginationType: 2,
    //存储表头模板
    temphead: '',
    //存储表每行模板
    temprow: '',
    event:{
        "beforeRender":{
            'all':{//全局配置
                'all':"",//全局配置
            },
            '1':{//pageNode
                'add':"",//fromNode
            },
        },
        "afterRender":{
            'all':{//全局配置
                'all':"",//全局配置
            },
            '1':{//pageNode
                'add':"",//fromNode
            },
        },
        "beforeDelete":{
            'all':{//全局配置
                'all':"",//全局配置
            },
            '1':{//pageNode
                'add':"",//fromNode
            },
        },
        "afterDelete":{
            'all':{//全局配置
                'all':"",//全局配置
            },
            '1':{//pageNode
                'add':"",//fromNode
            },
        },
        
    },
    /*控制列表的列显示 */
    show: {
        /*
        有的就隐藏
        通过input的name控制input隐藏  再通过dataCenter[sysSet]的listSearchhidden规则找到父级隐藏
        */
        searchRole: {
            allRole: {
                //pageNode
                '1': {
                    //fromNode
                    'manager': ['number', 'name', 'note', 'title'],  //input的name值
                    '2': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                },
                '2': {
                    '1': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                    '4': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                },
            },
            role1: {
                '1': {
                    'manager': ['number', 'name', 'note', 'title'],
                    '2': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                },
                '2': {
                    '1': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                    '4': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                },
            },
            role2: {
                '1': {
                    'manager': ['number', 'name', 'note', 'title'],
                    '2': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                },
                '2': {
                    '1': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                    '4': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                },
            },
        },
        listRole: {
            allRole: {
                '1': {
                    'index': {
                        thead: ['name', 'note'],//删除列。有的就删掉
                        row:[0,1,4,6], //删除行，有的就删掉
                    },//有的就删掉,
                    '2': {
                        thead: ['name', 'note'],//有的就删掉
                        row:[0,1,4,6],
                    }
                },
                '2': {
                    'index': {
                        thead: ['name', 'note'],//有的就删掉
                        row:[0,1,4,6],
                    },//有的就删掉,
                    '2': {
                        thead: ['name', 'note'],//有的就删掉
                        row:[0,1,4,6],
                    },
                },
            },
            role2: {},
            'allRole+role2':{}
        },
        //showBlock不是控制input，是根据id控制哪些部分需要显示
        //FIXME:改成class控制
        showBlock: {/*控制块的显示 */
            allRole: {
                '1': {
                    'manager': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
                    '2': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                },
            },
        },
        
        hiddenBlock: {/*控制块的隐藏 */
            allRole: {
                '1': {
                    'manager': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
                    '2': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                },
                '2': {
                    '1': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                    '4': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                },
            },//哪些块被显示
            role1: {
                '1': {
                    'manager': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
                    '2': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                },
                '2': {
                    '1': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                    '4': ['caiwuDHmeetingminutesname', 'caiwuDHmeetingminutes'],
                }
            },//哪些块被显示
        },
        field_showBlock: {
            allRole: {
                '1': {
                    'normal': {
                        'status': {
                            '有效': ['zjMark_classificationManagementList_status'],
                        }
                    }
                },
            },
        },
        field_hiddenBlock: {
            allRole: {
                '1': {
                    'normal': {
                        'status': {
                            '有效': ['zjMark_classificationManagementList_status'],
                        }
                    }
                },
            },
        },
    },  
};

//页面showBlock配置空模板 FIXME:id命名规则：xxx_showBlock_xxx
var showBlock = {
    '1': {
        'index': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
        '4': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
    },
    '2': {
        '1': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
        '4': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
    },
    '4': {
        '1': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
        '4': ['caiwuDHreportmaterialname', 'caiwuDHreportmaterial'],
    }
}


//获取url参数值
function GetRequest () {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        str = unescape(str);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

/** 
 * list、form的前置、后置函数执行
 * @param {String} type 类型list form
 * @param {String} dcId list、form的id
 * @param {String} eventName 方法名-beforeSubmit等
 * 
 */
function dcEvent(dcId, eventName, type, data) {
    //先执行list、form中便签的事件
    //获取所有有执行代码的元素  zjDCFrameEvent固定class，需要执行的标签都要加上这个class
    let eventDivList = $("#"+dcId).find(".zjDCFrameEvent");
    let eventList = [];
    //当前状态事件名称
    thisEvemtName = eventName+"-"+dataCenter.page.pageNode+"-"+dataCenter.page.fromNode;
    eventDivList.each((index,key) => {
        if(isNotEmpty(key.getAttribute(eventName)) || isNotEmpty(key.getAttribute(thisEvemtName)) ){
            let actionOrder = key.getAttribute("actionOrder")?key.getAttribute("actionOrder"):9999;
            eventList.push({
                dom : key,
                publicEvent : key.getAttribute(eventName),
                thisEvemt : key.getAttribute(thisEvemtName),
                order : actionOrder
            })
        }
    })
    //子标签事件集合
    eventList = eventList.sort(compare);
    eventList.forEach(key => {
        eval(key.thisEvemt);
        eval(key.publicEvent);
    });

    //主标签事件
    try {
        let publicMainEvent = $("#"+dcId).attr(eventName);
        let thisMainEvent =  $("#"+dcId).attr(thisEvemtName);
        eval(thisMainEvent);
        eval(publicMainEvent);
    } catch (error) {
        
    }
   


    //dataCenter配置的事件
    try {
        let thisDcEvent =   dataCenter[type][dcId]["event"][eventName][dataCenter.page.pageNode][dataCenter.page.fromNode];
        eval(thisDcEvent);
    } catch (error) {
        
    }
    try {
        let publicDcEvent = dataCenter[type][dcId]["event"][eventName]["all"]["all"];
        eval(publicDcEvent);
    } catch (error) {
        
    }
    

    //数据js
    var jsEvent = "typeof"+" "+ eventName +"" + firstCase(dcId) + " != 'undefined' && "+" " + eventName +"" + firstCase(dcId);
    switch (eventName) {
        case "beforeInit":
            jsEvent += "(dataCenter[type][dcId].down.formInfo)"
            // jsEvent += "(dataCenter.[\""+type+"\"][\""+dcId+"\"].down.formInfo)"
            break;
        case "afterInit":
            jsEvent += "(dataCenter[type][dcId].down.formInfo)"
            break;
        case "beforeSubmit":
            jsEvent += "()"
            break;
        case "afterSubmit":
            jsEvent += "(data)"
            break;
        case "afterSubmitDraft":
            jsEvent += "(data)"
            break;
        case "beforeRender":
            jsEvent += "(dataCenter[type][dcId].listInfos)"
            break;
        case "afterRender":
            jsEvent += "(dataCenter[type][dcId].listInfos)"
            break;
        case "beforeDelete":
            jsEvent += "(data)"
            break;
        case "afterDelete":
            jsEvent += "(data)"
            break;
        case "beforeBatchDelete":
            jsEvent += "(data)"
            break;
        case "afterBatchDelete":
            jsEvent += "(data)"
            break;
        default: 
            jsEvent="";
            break;
    }
    eval(jsEvent);
}

