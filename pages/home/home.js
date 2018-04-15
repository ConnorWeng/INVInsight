// pages/home/home.js
//获取应用实例
var app = getApp()
Page({
    /**
     * 页面的初始数据
     */
    data: {
        inputWidth: '150rpx',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log("+++ home.begin +++");
        console.log(app.globalData.userInfo);
        console.log('auth : '+app.globalData.auth);
        
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
                            // zjh 没有授权，则跳转到需要授权的页面
                            if (!app.globalData.auth) {
                                wx.reLaunch({
                                    url: "/pages/index/index"
                                })
                            } else { //zjh 有授权则跳转到home页面
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

            // zjh 没有授权，则去授权
            if (!app.globalData.auth) {
                wx.reLaunch({
                  url:"/pages/index/index"
                })                
            }

            console.log("+++ real home.begin +++");

            if (app.globalData.userInfo) {
                this.setData({
                    userInfo: app.globalData.userInfo,
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
        }

        console.log('each home auth : '+app.globalData.auth);
    },
    getUserInfo: function(e) {
        console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
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
    onShareAppMessage: function() {}
})