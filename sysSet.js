//项目配置项
var sysSet = {
    dataUrl: "http://10.50.21.219:8080/zj/",
    // 密钥（请确保在实际应用中使用安全存储方式保存密钥）
    encryptionKey: "iT0WX6AoEtyiWlq0rV8mlu6cXQenMsdiBNbcMIGABLU=",
    //是否显示loading框  
    isLoadingLayer: false,
    //页面session保存次数
    backCount: 5,
    //留给inputPage.js中使用,系统默认mainFormId对应的id，用来判断当前页面是list页面，还是form页面
    mainFormId: 'mainForm',
    //留给listPage.js中使用，系统默认mainListId对应的id
    mainListId: "mainList",
    //与初始化必填项方法（initMustInput）有关，给必填项添加红星
    //定位元素||操作类型||要做成什么样子,注意需要两个\'
    //FIXME:现在的规则是在文字标签上添加class就可以  需要做对应的修改
    starShow: ".parent().find('span').eq(0)||append||'<label class=\"color_red\">*</label>'",
    //与清除页面上input原有的状态（initCancelInputState）方法有关
    //删除必填星号   FIXME:现在的规则是在文字标签上添加class就可以  需要做对应的修改 
    deleteStarShow: ".parent().find('span label')",
    //list searchRole有关，通过name找到input，再通过listSearchhidden规则找到父级隐藏
    listSearchhidden: ".parent().find('span label')",
    //显示页码数 
    showPageNum: 5,
    //第几页 
    pageindex: 1,
    //必填项红框颜色分类
    color: {
        mustInput: '#95003d'
    },
    topOrgid: "00000000-0000-0000-0000-000000000000",// -1
    //发件人
    emailFromName: "",
    //indexedDB库名
    dbLibraryName: "",
    //indexedDB表集合
    dbTableList: [],
    //项目classid
    classid: {
        organization: "organization",//机构
        orgpeople: 'orgpeople',//机构人员
        dualaccounting: 'dualaccounting',//套账
        abstract: 'abstract',//摘要
        subjectclass: 'subjectclass',//科目分类
        productclass: 'productclass',//产品类别
        tradeunit: 'tradeunit',//交易单位
        department: 'department',//部门
        subject: 'subject',//科目
        subjectmodel: 'subjectmodel',//科目模板
        voucher: 'voucher',//凭证
        voucherdetail: 'voucherdetail',//凭证明细
        property: 'property',//资产
        propertyclass: 'propertyclass',//资产类别
        propertychangemode: 'propertychangemode',//资产增减方式
        cooperativepeople: 'cooperativepeople',//成员
        peopletransaction: 'peopletransaction',//成员交易
        peopledualaccountingset: 'peopledualaccountingset',//成员套用设置
    },
    //工作流草稿id
    workFlow: {
    },
    //项目数据词典
    dataDictionary: {
    },
    //固定角色id
    roleTemp: {
    },
    //下载模版Id
    dowmloadTemplate: {
        companyList: {
            id: "ec91fa94-6ad7-44b9-8470-0c0f5bba9b4d",
            name: "企业清单"
        },
    },
    //文件夹路径
    filefolder: {
        //knowledge:'cd323076-3f4e-4510-9d25-5a8b1f46f219',//知识管理
        operationmanual: "20211210-c4d9-4e0e-20211210doc",//操作手册
    },
    //错误信息
    errorMsg: {

    },
    //压缩项
    decode: [

    ],
    //菜单配置
    signal: {

    },
    loginFailure: function (data) {
        alert("请先登录系统!");
    },
}