//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')
var util = require('./utils/util.js')

App({
    onLaunch: function () {
        //zjh 设置登录地址
        qcloud.setLoginUrl(config.service.loginUrl) 
        //zjh 设置签名密钥
        util.mylog('app signKey :'+config.signKey);
        qcloud.Signature.set(config.signKey);
        //zjh 设置调试模式
        qcloud.setDebug(config.debug) 
        
        
        var session = qcloud.getSession();
        util.mylog('current session is : '+session);

        var that = this;  // 保存一下this

        // 是否为初次登录，或者打开小程序后从未登录过，或者小程序删除后再次打开
        // 是，则代表session不存在，需要在后台初始化用户关联信息或者更新新的session
        if(!session){  

            // zjh 存储 等待初始化标识，true为等待，直到初始化完成
            wx.setStorageSync('wait', true);
            var wait = wx.getStorageSync('wait')
            util.mylog('storage.wait...:' + wait);

            qcloud.login({
                success(result) {

                    util.mylog('init result:');
                    util.mylog(result);

                    qcloud.clearSession();   //以防 用户修改过头像昵称等资料时，我们后台没有更新
                    util.mylog('successfully create openid for our server');
                    that.globalData.hasLogin = true;   // zjh 曾经授权登录过，后台拥有用户资料
                    util.mylog('hasLogin :' + that.globalData.hasLogin );

                    wx.setStorageSync('wait', false);  //初始化已经完毕，无需再等待，可进入主界面
                    util.mylog('storage.wait.success...:' + false);

                },

                fail(error){
                    util.mylog('init error:');
                    util.mylog(error);

                    that.globalData.hasLogin = false;   // zjh 未曾授权登录过
                    util.mylog('hasLogin :' + that.globalData.hasLogin );

                    wx.setStorageSync('wait', false);  //初始化已经完毕，无需再等待，可进入初始界面（针对未曾登录过的用户）
                    util.mylog('storage.wait.success...:' + false);
                }
            })
        }else{
            // zjh 存储 等待初始化标识，true为等待，直到初始化完成
            wx.setStorageSync('wait', false);
            var wait = wx.getStorageSync('wait')
            util.mylog('storage.wait...:' + wait);
        }


        //删除超过3天都没有入库的货号的清单
        that.globalData.listAddTime = wx.getStorageSync('listAddTime');
        that.globalData.listAddTime = that.globalData.listAddTime === undefined 
                        || that.globalData.listAddTime === {} || that.globalData.listAddTime === "" || that.globalData.listAddTime === null
                        ? {} : that.globalData.listAddTime;

        util.myAsync(10,that.globalData.listAddTime,function(object) {
            
            util.mylog('++++++++ delete list ++++++++');

            if(JSON.stringify(that.globalData.listAddTime) !== "{}"){ //不为空对象

                var nowDate = Date.parse(new Date());
                var tmpDate = null;

                var list = wx.getStorageSync('inlist');

                list = list === undefined || list === {} || list === "" || list === null ? {} : list

                for(var key in that.globalData.listAddTime){
                    
                    tmpDate = that.globalData.listAddTime[key];
                    util.mylog('nowDate',nowDate);
                    util.mylog('tmpDate',tmpDate);
                    util.mylog((nowDate-tmpDate)/(1000*60*60*24));
                    if( (nowDate-tmpDate)/(1000*60*60*24) > 3){  //大于3天
                        delete list[key];  //删除某个商品的入库清单
                        delete that.globalData.listAddTime[key];
                    }
                }

                //更新缓存
                wx.setStorageSync('inlist', list);
                wx.setStorageSync('listAddTime', that.globalData.listAddTime);
            }
        });
       
        util.mylog('+++++++ app end ++++++++');
    },


    globalData: {
        userInfo: null,
        storeInfo:null,
        auth: false,
        logged:false,
        hasLogin:true,
        refresh:{
            home:0,
            store:0,
            stock:0,
            detail:0
        },
        currentProduct:null,
        listAddTime:null,
    },

    // 引入常用的配置和工具
    qcloud:qcloud,
    config:config,
    util:util,

})