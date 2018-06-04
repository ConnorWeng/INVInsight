// pages/store/store.js
//获取应用实例
var app = getApp()
var qcloud = app.qcloud;
var util = app.util;
var config = app.config;

Page({
    /**
     * 页面的初始数据
     */
    data: {
        inputWidth: '150rpx',
        userInfo: {},
        storeInfo:{},
        stocks:[],
        content:'',
        searchValue:'',
        hasUserInfo: false,
        hasResult: false,
        result:{},
        nullHouse:true,
        toast:'',
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                storeInfo:app.globalData.storeInfo,
                hasUserInfo: true
            })
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        }

    },
    getUserInfo: function(e) {
        util.mylog(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })

        // 获取商品
        this.data.stocks = [];
        this.getProducts();
    },
    inputFocus: function() {
        this.setData({
            inputWidth: '250rpx',
        });
    },
    inputBlur: function() {
        this.setData({
            inputWidth: '150rpx',
        });
    },
    /**
     * 检测输入
     */
    detectInput: function(e) {
        util.mylog(e);
        var input = e.detail.value;
        if (e.detail.cursor > 0) {
            //检测输入的是否为数字
            var reg = /^[0-9]+$/;
            if (!reg.test(e.detail.value)) {
                this.myToast('只能输入数字')
            }
        }else{
            this.setData({
                hasResult:false
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
    inputConfirm: function(e) {
        util.mylog(e);
        var value = e.detail.value;

        if(value.length <= 0){
            return;
        }

        //检测输入的是否为数字
        var reg = /^[0-9]+$/;

        if(!reg.test(value)){
            util.showModel('只能输入数字','');
            return;
        }

        //网络查询到数据后
        this.searchProduct(value);
        
    },

    /**
     * 获取商品
     * @return  {[type]}  [description]
     */
    getProducts:function(){
        //显示加载动画
        wx.showNavigationBarLoading();

        var that = this;
        that.setData({
            hasResult:false,
            content:'',
            searchValue:''
        })
        qcloud.request({
            url: config.service.generalUrl+'/stores/mine',
            login: true,
            method:'GET',
            success(result) {
                util.mylog('result Data : ',result);
                var res = result.data;
                //隐藏加载动画
                wx.hideNavigationBarLoading()
                //停止刷新
                wx.stopPullDownRefresh()

                if(!app.globalData.storeInfo ){
                    app.globalData.storeInfo = res.data.store
                    util.mylog('set Store : ',app.globalData.storeInfo);
                }
                if(!that.data.stocks){
                    that.data.stocks = [];
                }
                that.data.stocks = res.data.stocks;
                util.mylog('stocks:',that.data.stocks);
                that.setData({
                    storeInfo: res.data.store?res.data.store:null,
                    stocks:that.data.stocks?that.data.stocks:[],
                    content:'没有商品'
                })

                //关闭自动刷新
                app.globalData.refresh.store = 0;
            },

            fail(error) {

                //隐藏加载动画
                wx.hideNavigationBarLoading()
                //停止刷新
                wx.stopPullDownRefresh()
                util.showDebugModel('请求失败', error)
                that.setData({
                    content:'请求失败'
                })
            }
        })
    },

    /**
     * 查询货号
     * @param   {[type]}  code  [description]
     * @return  {[type]}        [description]
     */
    searchProduct:function(code){
        //显示加载动画
        wx.showNavigationBarLoading();

        var that = this;

        qcloud.request({
            url: config.service.generalUrl+'/search?product_code='+code,
            login: true,
            method:'GET',
            success(result) {
                util.mylog('result Data : ',result);
                var res = result.data;
                //隐藏加载动画
                wx.hideNavigationBarLoading()
                util.showSuccess('查找成功')
                that.setData({
                    hasResult:true,
                    result:res.data
                })
            },

            fail(error) {

                //隐藏加载动画
                wx.hideNavigationBarLoading()
                util.showDebugModel('查找失败', error)
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        if(!this.data.stocks || this.data.stocks.length == 0){
            // 获取商品
            this.getProducts();
        }else{
            this.setData({
                hasResult:false,
                content:'',
                searchValue:''
            })

            //出入库后自动刷新
            if(app.globalData.refresh.store == 1){
                this.getProducts();
            }
        }
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        // 获取商品
        this.data.stocks = [];
        this.getProducts();
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {}
})