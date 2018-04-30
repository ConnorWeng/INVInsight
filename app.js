//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')
var util = require('./utils/util.js')

App({
    onLaunch: function () {
        //zjh 设置登录地址
        qcloud.setLoginUrl(config.service.loginUrl) 
        //zjh 设置签名密钥
        console.log('app signKey :'+config.signKey);
        qcloud.Signature.set(config.signKey);
        
        var session = qcloud.getSession();
        console.log('current session is : '+session);

        var that = this;  // 保存一下this

        // 是否为初次登录，或者打开小程序后从未登录过，或者小程序删除后再次打开
        // 是，则代表session不存在，需要在后台初始化用户关联信息或者更新新的session
        if(!session){  

            // zjh 存储 等待初始化标识，true为等待，直到初始化完成
            wx.setStorageSync('wait', true);
            var wait = wx.getStorageSync('wait')
            console.log('storage.wait...:' + wait);

            qcloud.login({
                success(result) {

                    console.log('init result:');
                    console.log(result);

                    qcloud.clearSession();   //以防 用户修改过头像昵称等资料时，我们后台没有更新
                    console.log('successfully create openid for our server');
                    that.globalData.hasLogin = true;   // zjh 曾经授权登录过，后台拥有用户资料
                    console.log('hasLogin :' + that.globalData.hasLogin );

                    wx.setStorageSync('wait', false);  //初始化已经完毕，无需再等待，可进入主界面
                    console.log('storage.wait.success...:' + false);

                },

                fail(error){
                    console.log('init error:');
                    console.log(error);

                    that.globalData.hasLogin = false;   // zjh 未曾授权登录过
                    console.log('hasLogin :' + that.globalData.hasLogin );

                    wx.setStorageSync('wait', false);  //初始化已经完毕，无需再等待，可进入初始界面（针对未曾登录过的用户）
                    console.log('storage.wait.success...:' + false);
                }
            })
        }else{
            // zjh 存储 等待初始化标识，true为等待，直到初始化完成
            wx.setStorageSync('wait', false);
            var wait = wx.getStorageSync('wait')
            console.log('storage.wait...:' + wait);
        }
       
    },


    globalData: {
        userInfo: null,
        auth: false,
        logged:false,
        hasLogin:true
    },

    // 引入常用的配置和工具
    qcloud:qcloud,
    config:config,
    util:util,

})