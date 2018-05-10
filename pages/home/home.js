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
        console.log("+++ home.begin +++");

        var wait = wx.getStorageSync('wait');
        this.setData({
            wait: wait
        })

        console.log("home.wait...:" + wait);
        if(wait === true){  //先等待首次打开应用时的授权响应

            console.log("+++ load.begin +++");
            //zjh 等待授权反馈
            (function load() {
                wx.getStorage({
                    key: 'wait',
                    success: function(res) {
                        console.log('load.wait...:' + res.data);
                        if (res.data === false) {
                            console.log("load.redirect");
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

            console.log("+++ real home.begin +++");

            if (app.globalData.userInfo) {
                this.setData({
                    userInfo: app.globalData.userInfo,
                    hasUserInfo: true
                })
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
                                    } else {
                                        // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                                        qcloud.request({
                                            url: config.service.usersUrl,
                                            login: true,
                                            success(result) {
                                                console.log('result:');
                                                console.log(result);
                                                util.showSuccess('登录成功')
                                                app.globalData.userInfo = result.data.data
                                                that.setData({
                                                    userInfo: result.data.data,
                                                    hasUserInfo: true
                                                })
                                            },

                                            fail(error) {

                                                util.showModel('请求失败', error)

                                                console.log('request fail', error)
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
                                    console.log('登录失败', error)
                                }
                            })
                        }
                    }
                });
            }
            
        }

    },
    getUserInfo: function(e) {
        console.log(e)

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
                        },

                        fail(error) {
                            if(config.debug){
                                util.showDebugModel('请求失败', error)
                            }else{
                                util.showModel('请求失败', '请求失败，请检查网络状态')
                            }
                            
                            console.log('request fail', error)
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
                
                console.log('登录失败', error)
            }
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

    stockin:function(e){

        console.log(e);
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

        console.log(e);

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
        console.log(e);
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

    speak:function(e){
        console.log(e);
        if(e.recordermanager){

        

        // const recorderManager = wx.getRecorderManager()

        recorderManager.onStart(() => {
          console.log('recorder start')
        })
        recorderManager.onResume(() => {
          console.log('recorder resume')
        })
        recorderManager.onPause(() => {
          console.log('recorder pause')
        })
        recorderManager.onStop((res) => {
          console.log('recorder stop', res)
          const { tempFilePath } = res
        })
        recorderManager.onFrameRecorded((res) => {
          const { frameBuffer } = res
          console.log('frameBuffer.byteLength', frameBuffer.byteLength)
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
    onHide: function() {},
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