// pages/findstock/findstock.js
//获取应用实例
var app = getApp()
var qcloud = app.qcloud;
var util = app.util;
var config = app.config;

var historySize = 100;  //历史缓存的最大项目数量
var quickLimitSize = 15;   //快速预查询的最大限定数量

Page({
    /**
     * 页面的初始数据
     */
    data: {
        'showCloseBtn': false,
        'searchColor':'',
        'inputValue':'',
        'searchValue':'',
        'historyData':[],
        'quickSearch':[],
        'quickSign':[],
        'loading':false,
        'nullHouse':true,
        'toast':'',
        'status':'ready',  //默认状态为ready
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        //例子，对接后台后删除 zjh
        var history = [
            {
                'type':'preview',
                'value':'1224'
            },
            {
                'type':'detail',
                'id':'2',
                'value':'4532'
            },
            {
                'type':'preview',
                'value':'243'
            },
        ];

        //例子
        var quick = [
            {
                'stock_id':4,
                'product_code':'34556',
                'stock_amount':25
            },
            {
                'stock_id':3,
                'product_code':'3556',
                'stock_amount':2
            },
            {
                'stock_id':1,
                'product_code':'111156',
                'stock_amount':12
            },
            {
                'stock_id':4,
                'product_code':'78556',
                'stock_amount':25
            },


          

        ];


        wx.setStorageSync('searchHistory', history);

        this.data.historyData = wx.getStorageSync('searchHistory')

        this.setData({
            historyData:this.data.historyData,
            status:'ready',          //临时切换状态
            quickSearch:quick
        })

    },

    stockin:function(e){

        console.log(e);
        var code = e.currentTarget.dataset.code;
        var id = e.currentTarget.dataset.id;

        wx.navigateTo({
          url: '../stockin/stockin?code='+code+'&stock_id='+id
        })
    },

    

    stockout:function(e){

        console.log(e);

        var code = e.currentTarget.dataset.code;
        var id = e.currentTarget.dataset.id;

        wx.navigateTo({
          url: '../stockout/stockout?code='+code+'&stock_id='+id
        })
    },

    checkDetail:function(e){
        console.log(e);

        var code = e.currentTarget.dataset.code;
        var id = e.currentTarget.dataset.id;

        wx.navigateTo({
          url: '../stockdetail/stockdetail?code='+code+'&stock_id='+id
        })

    },
    
    /**
     * 检测输入
     */
    detectInput: function(e) {
        console.log(e);
        var input = e.detail.value;

        if (e.detail.cursor > 0) {

            //检测输入的是否为数字
            var reg = /^[0-9]+$/;

            if(!reg.test(e.detail.value)){
                // util.showFail('只能输入数字');

                this.myToast('只能输入数字')
                // s.substring(0,s.length-1);
                // 清除非数字字符
                // input = input.replace(/[^0-9]/ig,"");  

            }

            this.setData({
                showCloseBtn:true,
                searchColor:'#40bacf',
                searchValue:input
            })

            //进行网络查询
            // quickLimitSize  查询的数量要限定大小
            //返回后
            this.formatQuickResult(this.data.quickSearch);

            //临时，对接后台后删除
            var tmpstatus = 'ready' ;  
            for (var i = this.data.quickSign.length - 1; i >= 0; i--) {
                for (var j = this.data.quickSign[i].length - 1; j >= 0; j--) {
                    if(this.data.quickSign[i][j] == 1){
                        tmpstatus = 'doing' ;  
                        break;
                    }
                }
                if(tmpstatus == 'doing'){
                    break;
                }
            }

            this.setData({
                quickSearch:this.data.quickSearch,
                status:tmpstatus,          //切换状态
                quickSign:this.data.quickSign
            });
        }else{
            this.setData({
                showCloseBtn:false,
                searchColor:'',
                searchValue:input,
                status:'ready',          //切换状态
                quickSign:[]
            })
        }

    },

    /**
     * 自定义提示
     * @return  {[type]}  [description]
     */
    myToast: function(content) {
        var that = this;
        this.setData({
            nullHouse: false, //弹窗显示
            toast:content
        })
        setTimeout(function() {
            that.setData({
                nullHouse: true,
            }) //1秒之后弹窗隐藏
        }, 1500)
    },

    /**
     * 对预览返回的数据进行简单格式化
     * @param   {[type]}  data  [description]
     * @return  {[type]}        [description]
     */
    formatQuickResult:function(data){

        var valueStr = this.data.searchValue;
        var pos = new Array();

        //获取字串长度
        var len = valueStr.length;

        for (var k in data) {
            var codeStr = data[k].product_code.toString();
            
            //获取子字符串的位置
            pos = [];
            this.searchSubStr(codeStr,valueStr,pos);

            
            //创建标识数组
            this.data.quickSign[k] = this.createSign(codeStr,len,pos);
        }
        
        console.log('quickSign : ',this.data.quickSign)

    },

    /**
     * 创建标识数组
     * @param   {[type]}  codeStr  [description]
     * @param   {[type]}  len      [description]
     * @return  {[type]}           [description]
     */
    createSign:function(myStr,SubStrLen,pos){
        //创建标识数组
        var sign = new Array(myStr.length);
        for(var i=0;i<sign.length;i++){
            if(pos.length > 0){
                for(var j=0; j<pos.length;j++){
                    if(i>=pos[j] && i<pos[j]+SubStrLen){
                        sign[i] = 1;
                        break;
                    }else{
                        sign[i] = 0;
                    }
                }
                
            }else{
                sign[i] = 0;
            }  
        }

        return sign;
    },

    /**
     * 获取子字符串的各个位置（不重叠的情况）
     * @param   {[type]}  str        [description]
     * @param   {[type]}  subStr     [description]
     * @param   {[type]}  positions  [description]
     * @return  {[type]}             [description]
     */
    searchSubStr:function(str,subStr,positions){
        var pos = str.indexOf(subStr);
        while(pos>-1){
            positions.push(pos);
            pos = str.indexOf(subStr,pos+subStr.length);
        }
    },

    /**
     * 清空输入框
     */
    
    emptyInput:function(e){

        if(this.data.loading){  //loading期间，冻结清空按钮
            return;
        }

        //隐藏加载动画
        wx.hideNavigationBarLoading()

        this.setData({
            inputValue:'',
            showCloseBtn:false,
            searchColor:'',
            status:'ready',          //切换状态
            searchValue:''
        })
    },

    /**
     * 点击历史预览项查询
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    previewItemSearch:function(e){
        console.log(e);

        if(this.data.loading){  //loading期间，冻结按钮
            return;
        }

        this.data.loading = true;  // 冻结其他按钮
        //显示加载动画
        wx.showNavigationBarLoading();

        //更新历史搜索项缓存
        this.updateHistory('preview',e.currentTarget.dataset.value,'');
        
        this.setData({
            historyData:this.data.historyData,

            inputValue:e.currentTarget.dataset.value,
            showCloseBtn:true,
            searchColor:'#40bacf',
            status:'done',          //切换状态
            searchValue:e.currentTarget.dataset.value,
        })

        //网络查询 zjh
        //this.search();
        this.data.loading = false;  //结束loading，解冻其他按钮
        //隐藏加载动画
        wx.hideNavigationBarLoading()
    },

    /**
     * 点击历史详情项查询
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    detailItemSearch:function(e){
        console.log(e);

        if(this.data.loading){  //loading期间，冻结按钮
            return;
        }

        //显示加载动画
        wx.showNavigationBarLoading();

        //更新历史搜索项缓存
        this.updateHistory('detail',e.currentTarget.dataset.value,'');

        this.setData({
            historyData:this.data.historyData
        })

        //直接跳转到详情项 zjh
    
        //隐藏加载动画
        wx.hideNavigationBarLoading()
    },

    /**
     * 更新历史记录
     * @param   {[type]}  type   [description]
     * @param   {[type]}  value  [description]
     * @param   {[type]}  id     [description]
     * @return  {[type]}         [description]
     */
    updateHistory:function(type,value,id){ 

        //缓存搜索内容到本地，作为历史搜索记录
        //先遍历一下数组，查看是否已经存在对应的值，有则删除，然后重新在头部添加
        var re = this.removeByValue(this.data.historyData,value);

        if(re === true){
            if(type == 'preview'){
                this.data.historyData.unshift({
                    'type':'preview',
                    'value':value
                })
            }else if(type == 'detail'){
                this.data.historyData.unshift({
                    'type':'detail',
                    'id':id,
                    'value':value

                })
            }
            
        }

        console.log('search history current size ：' + this.data.historyData.length);
        console.log('search history allow maxsize ：' + historySize);
        if(this.data.historyData.length > historySize){
            var diff = this.data.historyData.length - historySize;
            console.log('search history over size ：' + diff);
            //删除超过存储最大值后的数目
            this.data.historyData.splice(historySize, diff);

        }
        console.log(this.data.historyData);
        wx.setStorageSync('searchHistory', this.data.historyData);
    },

    /**
     * 确认搜索
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    searchConfirm:function(e){
        console.log(e);

        var value = e.currentTarget.dataset.value;

        this.confirm(value);
    },

    /**
     * 点击键盘确认搜索
     */
    
    inputConfirm:function(e){
        console.log(e)

        var value = e.detail.value;

        this.confirm(value);
    },

    /**
     * 确认搜索
     */
    confirm:function(value){

        //loading期间 冻结搜索按钮
        if(this.data.loading){  
            return;
        }

        //进入loading期间，暂时冻结其他按钮
        this.data.loading = true;
        
        
        //如果内容清空按钮存在，则代表搜索按钮有效
        if(this.data.showCloseBtn){   
            
            //显示加载动画
            wx.showNavigationBarLoading();

            //检测输入的是否为数字
            var reg = /^[0-9]+$/;

            if(!reg.test(value)){
                util.showModel('只能输入数字','');
                this.data.loading = false;  //结束loading，解冻其他按钮
                //隐藏加载动画
                wx.hideNavigationBarLoading()
                return;
            }

            //更新历史搜索项缓存
            this.updateHistory('preview',value,'');

            this.setData({
                historyData:this.data.historyData
            })

            

            //网络查询 zjh
            //this.search();
            //网络查询结果后
            this.setData({
                status:'done',          //切换状态
            })
        }

        this.data.loading = false;  //结束loading，解冻其他按钮
        //隐藏加载动画
        // wx.hideNavigationBarLoading()
    },

    /**
     * 删除数组中指定元素
     */
    removeByValue:function(arr, val) {
        for(var i=0; i<arr.length; i++) {
            if(arr[i].value.toString() === val.toString()) {
                if(arr[i].type == 'preview'){ // 判断是否预览类型，是，则删除
                    arr.splice(i, 1);
                    return true;
                }else{  //不是，则将元素转移到头部后，返回false用于阻止接下来的新元素添加
                    arr.unshift(arr[i]);
                    arr.splice(i+1,1);
                    return false;  
                }
                
            }
        }

        return true;
    },

    // 清空搜索记录缓存
    deleteHistory:function(e){
        if(this.data.loading){  //loading期间，冻结按钮
            return;
        }

        var that = this;
        util.showTip('清除历史记录？','',function(){
            wx.removeStorageSync('searchHistory');
            that.setData({
                historyData:[]
            })
        })
    },

    /**
     * 点击查看项目详情
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    viewDetail:function(e){
        console.log(e);

        if(this.data.loading){  //loading期间，冻结按钮
            return;
        }

        //保存历史记录
        this.updateHistory('detail',e.currentTarget.dataset.code,e.currentTarget.dataset.id);

        this.setData({
            historyData:this.data.historyData
        })

        //跳转到项目详情页
    },

    /**
     * 网络查询
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    search:function(e){
        //zjh 向服务器后台获取查询结果
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {},
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        // 防止因网络错误造成按钮锁死
        this.data.loading = false;  //结束loading，解冻其他按钮
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {},
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {}
})