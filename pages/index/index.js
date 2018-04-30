//index.js

//获取应用实例
var app = getApp()
var qcloud = app.qcloud;
var util = app.util;
var config = app.config;

Page({
    data: {
        userInfo: {},
        logged: false,
        takeSession: false,
        requestResult: '',
        loginStatus:true
    },
    //zjh 直接跳转到tp页面
    // onShow: function () {
    //   wx.redirectTo({
    //     url: '../tp/tp',
    //   })
    // },
    onLoad: function (options) {
        console.log("+++ index.begin +++");
    },

    userInfoHandler:function(e){
        if(e.detail.userInfo){
       
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

                        //跳转
                        wx.reLaunch({
                          url: '/pages/home/home'
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

                                //跳转
                                wx.reLaunch({
                                  url: '/pages/home/home'
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
                        util.showModel('登录失败', '请检查网络状态')
                    }
                    
                    console.log('登录失败', error)
                }
            })
        }
        
    },


    auth2:function(){
        wx.openSetting({success:(res)=>{console.log(res);}}); 
    },
   
    auth1:function(){
        // 获取用户信息
        wx.getSetting({
          success: res => {
            console.log(4);
            if (!res.authSetting['scope.userInfo']) {
               console.log(5);
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  app.globalData.userInfo = res.userInfo
                  app.globalData.auth = true;
                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res)
                  }

                  //跳转
                    wx.switchTab({
                      url: '/pages/home/home'
                    })

                }

              })
            }
          }
        })
    },

    //授权
    auth: function () {
        
        wx.getSetting({

            success(res) {
                console.log(3);
                if (!res.authSetting['scope.userInfo']) {
                    wx.authorize({
                        scope: 'scope.userInfo',
                        success() {
                            //平台登录
                            console.log(3);
                            app.globalData.auth = true;
                            //跳转
                            wx.switchTab({
                              url: '/pages/home/home'
                            })
                        }
                    })
                }
            }
        })
        console.log(3);
    },

    getPromission: function() {
        var that = this;
        console.log(that.data.loginStatuss);
        if (!that.data.loginStatus) {
          wx.openSetting({
            success: function (res) {
              if(res) {
                if (res.authSetting["scope.userInfo"] == true) {
                  that.data.loginStatus = true;
                  wx.getUserInfo({
                    withCredentials: false,
                    success: function (res) {
                      console.info("2成功获取用户返回数据");
                      console.info(res.userInfo);
                    },
                    fail: function () {
                      console.info("2授权失败返回数据");
                    }              
                    });
                }
              }         
          },
            fail: function () {
              console.info("设置失败返回数据");
            }        
        });
        }else {
          wx.login({
            success: function (res) {
              if (res.code) { 
                  wx.getUserInfo({
                  withCredentials: false,
                  success: function (res) {
                    console.info("1成功获取用户返回数据");
                    console.info(res.userInfo);
                  },
                  fail: function () {
                    console.info("1授权失败返回数据");
                    that.data.loginStatus = false;
                    // 显示提示弹窗
                    wx.showModal({
                      title: '提示标题',
                      content: '提示内容',
                      success: function (res) {
                        if (res.confirm) {
                          console.log('用户点击确定')
                        } else if (res.cancel) {
                          wx.openSetting({
                            success: function (res) {
                              if (res) {
                                if (res.authSetting["scope.userInfo"] == true) {
                                  that.data.loginStatus = true;
                                  wx.getUserInfo({
                                    withCredentials: false,
                                    success: function (res) {
                                      console.info("3成功获取用户返回数据");
                                      console.info(res.userInfo);
                                    },
                                    fail: function () {
                                      console.info("3授权失败返回数据");
                                    }                               
                                });
                                }
                              }                         
                          },
                            fail: function () {
                              console.info("设置失败返回数据");
                            }                      
                        });
                        }
                      }
                    });
                  }             
              });
              }
            },
            fail: function () {
              console.info("登录失败返回数据");
            }       
        });
        }
      },


    
    // 用户登录示例
    login: function() {
        if (this.data.logged) return

        util.showBusy('正在登录')
        var that = this

        // 调用登录接口
        qcloud.login({
            success(result) {
                if (result) {
                    util.showSuccess('登录成功')
                    that.setData({
                        userInfo: result,
                        logged: true
                    })
                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    qcloud.request({
                        url: config.service.requestUrl,
                        login: true,
                        success(result) {
                            util.showSuccess('登录成功')
                            that.setData({
                                userInfo: result.data.data,
                                logged: true
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
                util.showModel('登录失败', error)
                console.log('登录失败', error)
            }
        })
    },

    // 切换是否带有登录态
    switchRequestMode: function (e) {
        this.setData({
            takeSession: e.detail.value
        })
        this.doRequest()
    },

    doRequest: function () {
        util.showBusy('请求中...')
        var that = this
        var options = {
            url: config.service.requestUrl,
            login: true,
            success (result) {
                util.showSuccess('请求成功完成')
                console.log('request success', result)
                that.setData({
                    requestResult: JSON.stringify(result.data)
                })
            },
            fail (error) {
                util.showModel('请求失败', error);
                console.log('request fail', error);
            }
        }
        if (this.data.takeSession) {  // 使用 qcloud.request 带登录态登录
            qcloud.request(options)
        } else {    // 使用 wx.request 则不带登录态
            wx.request(options)
        }
    },

    // 上传图片接口
    doUpload: function () {
        var that = this

        // 选择图片
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function(res){
                util.showBusy('正在上传')
                var filePath = res.tempFilePaths[0]

                // 上传图片
                wx.uploadFile({
                    url: config.service.uploadUrl,
                    filePath: filePath,
                    name: 'file',

                    success: function(res){
                        util.showSuccess('上传图片成功')
                        res = JSON.parse(res.data)
                        that.setData({
                            imgUrl: res.data.imgUrl
                        })
                    },

                    fail: function(e) {
                        util.showModel('上传图片失败')
                    }
                })

            },
            fail: function(e) {
                console.error(e)
            }
        })
    },

    // 预览图片
    previewImg: function () {
        wx.previewImage({
            current: this.data.imgUrl,
            urls: [this.data.imgUrl]
        })
    },

    // 切换信道的按钮
    switchChange: function (e) {
        var checked = e.detail.value

        if (checked) {
            this.openTunnel()
        } else {
            this.closeTunnel()
        }
    },

    openTunnel: function () {
        util.showBusy('信道连接中...')
        // 创建信道，需要给定后台服务地址
        var tunnel = this.tunnel = new qcloud.Tunnel(config.service.tunnelUrl)

        // 监听信道内置消息，包括 connect/close/reconnecting/reconnect/error
        tunnel.on('connect', () => {
            util.showSuccess('信道已连接')
            console.log('WebSocket 信道已连接')
            this.setData({ tunnelStatus: 'connected' })
        })

        tunnel.on('close', () => {
            util.showSuccess('信道已断开')
            console.log('WebSocket 信道已断开')
            this.setData({ tunnelStatus: 'closed' })
        })

        tunnel.on('reconnecting', () => {
            console.log('WebSocket 信道正在重连...')
            util.showBusy('正在重连')
        })

        tunnel.on('reconnect', () => {
            console.log('WebSocket 信道重连成功')
            util.showSuccess('重连成功')
        })

        tunnel.on('error', error => {
            util.showModel('信道发生错误', error)
            console.error('信道发生错误：', error)
        })

        // 监听自定义消息（服务器进行推送）
        tunnel.on('speak', speak => {
            util.showModel('信道消息', speak)
            console.log('收到说话消息：', speak)
        })

        // 打开信道
        tunnel.open()

        this.setData({ tunnelStatus: 'connecting' })
    },

    /**
     * 点击「发送消息」按钮，测试使用信道发送消息
     */
    sendMessage() {
        if (!this.data.tunnelStatus || !this.data.tunnelStatus === 'connected') return
        // 使用 tunnel.isActive() 来检测当前信道是否处于可用状态
        if (this.tunnel && this.tunnel.isActive()) {
            // 使用信道给服务器推送「speak」消息
            this.tunnel.emit('speak', {
                'word': 'I say something at ' + new Date(),
            });
        }
    },

    /**
     * 点击「关闭信道」按钮，关闭已经打开的信道
     */
    closeTunnel() {
        if (this.tunnel) {
            this.tunnel.close();
        }
        util.showBusy('信道连接中...')
        this.setData({ tunnelStatus: 'closed' })
    }
})
