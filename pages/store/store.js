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
        hasUserInfo: false,
        hasResult: false,
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
    /**
     * 检测输入
     */
    detectInput: function(e) {
        console.log(e);
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
        console.log(e);
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
        if(value == 6190){
            this.setData({
                hasResult:true
            })
        }else{
            util.showFail('找不到对应款号');
            return;
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