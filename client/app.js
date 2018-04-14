  //app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

App({
    onLaunch: function () {
        qcloud.setLoginUrl(config.service.loginUrl)

        // 登录
        wx.login({
          success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
          }
        })

        // zjh 存储 等待授权标识，默认为true，即等待，直到反馈是否已经授权
        wx.setStorageSync('wait', true);
        var wait = wx.getStorageSync('wait')
        console.log('storage.wait...:'+wait);

        // 获取用户信息
        wx.getSetting({
          success: res => {
            //zjh 变更等待标识，表示已经得到了是否已经授权的信息，所以无需再等待了
            wx.setStorageSync('wait', false);
            var wait = wx.getStorageSync('wait')
            console.log('storage.wait.success...:'+wait);

            console.log("getSetting.success.wait");

            if (res.authSetting['scope.userInfo']) {
              this.globalData.auth = true;
              console.log("auth.true");
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  this.globalData.userInfo = res.userInfo

                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res)
                  }
                  console.log("app.getUserInfo.success");
                }

              })
            }
          },
          fail:res=>{
            //zjh 变更等待标识，表示已经得到了是否已经授权的信息，所以无需再等待了
            wx.setStorageSync('wait', false);
            console.log('storage.wait.fail...:'+wait);
            console.log("getSetting.fail.wait");
          }
        })
    },
    globalData: {
      userInfo: null,
      auth: false
    }
})