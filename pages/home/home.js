// pages/home/home.js

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
        products:[],
        hasHomeData:false,
        hasUserInfo: false,
        code:'',   //款号
        nullHouse:true,
        toast:'',
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        util.mylog("+++ home.begin +++");

        var topThis = this;

        var wait = wx.getStorageSync('wait');
        this.setData({
            wait: wait
        })

        util.mylog("home.wait...:" + wait);
        if(wait === true){  //先等待首次打开应用时的授权响应

            util.mylog("+++ load.begin +++");
            //zjh 等待授权反馈
            (function load() {
                wx.getStorage({
                    key: 'wait',
                    success: function(res) {
                        util.mylog('load.wait...:' + res.data);
                        if (res.data === false) {
                            util.mylog("load.redirect");
                            // zjh 没有登录过，则跳转到初始引导和介绍的页面
                            if (!app.globalData.hasLogin) {
                                wx.reLaunch({
                                    url: "/pages/index/index"
                                })
                            } else { //zjh 曾经登录过则跳转到home页面
                                wx.reLaunch({
                                    url: '/pages/home/home'
                                })
                            }
                        } else {
                            load(); // 再去查缓存的wait，直到wait已经变更为false，即可以不用再等待了
                        }
                    }
                })
            })(0);

        }else{

            util.mylog("+++ real home.begin +++");

            if (app.globalData.userInfo) {
                this.setData({
                    userInfo: app.globalData.userInfo,
                    hasUserInfo: true
                })

                // 获取首页数据
                topThis.getHomeData();
            }else{
                wx.getSetting({   //zjh 获取设置信息
                    success: res => {

                        if (res.authSetting['scope.userInfo']) {  // zjh 如果用户已经授权过
                            // 已经授权则可以实现自动登录
                            util.showBusy('正在登录')
                            var that = this

                            // 调用登录接口
                            qcloud.login({
                                success(result) {
                                    if (result) {
                                        util.showSuccess('登录成功')
                                        app.globalData.userInfo = result
                                        that.setData({
                                            userInfo: result,
                                            hasUserInfo: true
                                        })
                                        util.mylog('session');
                                        // 获取首页数据
                                        topThis.getHomeData();

                                    } else {
                                        // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                                        qcloud.request({
                                            url: config.service.usersUrl,
                                            login: true,
                                            success(result) {
                                                util.mylog('result:');
                                                util.mylog(result);
                                                util.showSuccess('登录成功')
                                                app.globalData.userInfo = result.data.data
                                                that.setData({
                                                    userInfo: result.data.data,
                                                    hasUserInfo: true
                                                })

                                                util.mylog('info');
                                                // 获取首页数据
                                                topThis.getHomeData();
                                            },

                                            fail(error) {

                                                if(config.debug){
                                                    util.showDebugModel('请求失败', error)
                                                }else{
                                                    util.showFail('登录失败')
                                                }

                                                util.mylog('request fail', error)
                                            }
                                        })
                                    }
                                },

                                fail(error) {
                                    if(config.debug){
                                        util.showDebugModel('登录失败', error)
                                    }else{
                                        util.showFail('登录失败')
                                    }
                                    util.mylog('登录失败', error)
                                }
                            })
                        }
                    }
                });
            }
            
        }

    },
    getUserInfo: function(e) {
        util.mylog(e)

        util.showBusy('正在登录')
        var that = this

        // 调用登录接口
        qcloud.login({
            userinfo:e.detail,
            success(result) {
                if (result) {
                    util.showSuccess('登录成功')
                    app.globalData.userInfo = result
                    that.setData({
                        userInfo: result,
                        hasUserInfo: true
                    })

                    // 获取首页数据
                    that.getHomeData();

                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    qcloud.request({
                        url: config.service.usersUrl,
                        login: true,
                        success(result) {
                            util.showSuccess('登录成功')
                            app.globalData.userInfo = result.data.data
                            that.setData({
                                userInfo: result.data.data,
                                hasUserInfo: true
                            })

                            // 获取首页数据
                            that.getHomeData();
                        },

                        fail(error) {
                            if(config.debug){
                                util.showDebugModel('请求失败', error)
                            }else{
                                util.showModel('请求失败', '请求失败，请检查网络状态')
                            }
                            
                            util.mylog('request fail', error)
                        }
                    })
                }
            },

            fail(error) {
                if(config.debug){
                    util.showDebugModel('登录失败', error)
                }else{
                    util.showModel('登录失败', '请检查网络状态和是否已授权')
                }
                
                util.mylog('登录失败', error)
            }
        })
    },

    inputFocus:function(e){
        util.mylog(e)
        wx.navigateTo({
          url: '../findstock/findstock'
        })
    },

    checkDetail:function(e){
        util.mylog(e);

        var code = e.currentTarget.dataset.code;
        var id = e.currentTarget.dataset.id;

        wx.navigateTo({
          url: '../stockdetail/stockdetail?code='+code+'&stock_id='+id
        })

    },

    stockin:function(e){

        util.mylog(e);
        var code = e.currentTarget.dataset.code;
        var id = e.currentTarget.dataset.id;
        if(code.length <= 0){
            return;
        }

        //检测输入的是否为数字
        var reg = /^[0-9]+$/;

        if(!reg.test(code)){
            util.showModel('只能输入数字','');
            return;
        }

        wx.navigateTo({
          url: '../stockin/stockin?code='+code+'&stock_id='+id
        })
    },

    stockout:function(e){

        util.mylog(e);

        var code = e.currentTarget.dataset.code;
        var id = e.currentTarget.dataset.id;

        if(code.length <= 0){
            return;
        }

        //检测输入的是否为数字
        var reg = /^[0-9]+$/;

        if(!reg.test(code)){
            util.showModel('只能输入数字','');
            return;
        }

        // id等于0时，先向网络查询一下是否有这个款，没有则return
        if(id == 0){

        }

        wx.navigateTo({
          url: '../stockout/stockout?code='+code+'&stock_id='+id
        })
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

            if(!reg.test(e.detail.value)){

                this.myToast('只能输入数字')

            }
          
        }

        this.setData({
            code:input
        })

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

    inputBlur: function() {
        this.setData({
            inputWidth: '150rpx',
        });
    },

    speak:function(e){
        util.mylog(e);
        if(e.recordermanager){

        

        // const recorderManager = wx.getRecorderManager()

        recorderManager.onStart(() => {
          util.mylog('recorder start')
        })
        recorderManager.onResume(() => {
          util.mylog('recorder resume')
        })
        recorderManager.onPause(() => {
          util.mylog('recorder pause')
        })
        recorderManager.onStop((res) => {
          util.mylog('recorder stop', res)
          const { tempFilePath } = res
        })
        recorderManager.onFrameRecorded((res) => {
          const { frameBuffer } = res
          util.mylog('frameBuffer.byteLength', frameBuffer.byteLength)
        })

        const options = {
          duration: 10000,
          sampleRate: 44100,
          numberOfChannels: 1,
          encodeBitRate: 192000,
          format: 'aac',
          frameSize: 50
        }

        recorderManager.start(options)
        }
    },

    speakManage:function(){
        util.showModel('','即将开放，敬请期待');
        // this.myToast('即将开放，敬请期待')
    },

    getHomeData:function(){
        //显示加载动画
        wx.showNavigationBarLoading();

        var that = this;

        qcloud.request({
            url: config.service.generalUrl+'/home',
            login: true,
            method:'GET',
            success(result) {
                util.mylog('home Data : ',result);
                var res = result.data;
                //隐藏加载动画
                wx.hideNavigationBarLoading()
                //停止刷新
                wx.stopPullDownRefresh()
                app.globalData.storeInfo = res.data.store

                util.mylog('set Store : ',app.globalData.storeInfo);

                that.data.products = that.data.products.concat(res.data.products);
                util.mylog('stocks',res.data.stocks);
                util.mylog('products',that.data.products);
                that.setData({
                    hasHomeData:true,
                    storeInfo: res.data.store?res.data.store:{},
                    stocks: res.data.stocks?res.data.stocks:[],
                    products:that.data.products?that.data.products:[],
                })

                //关闭自动刷新
                app.globalData.refresh.home = 0;
            },

            fail(error) {
                util.showDebugModel('请求失败', error)
                //隐藏加载动画
                wx.hideNavigationBarLoading()
                //停止刷新
                wx.stopPullDownRefresh()
                that.setData({
                    hasHomeData:true
                })
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
        if(app.globalData.refresh.home == 1){
            this.data.products = [];
            this.getHomeData();
        }
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        //隐藏加载动画
        wx.hideNavigationBarLoading()
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        // 获取商品
        this.data.products = [];
        this.getHomeData();
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
          title: '库存管理小程序',
          path: '/pages/home/home',
          success: function(res) {
            // 转发成功
          },
          fail: function(res) {
            // 转发失败
          }
        }
    }
})