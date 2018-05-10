var utils = require('./utils');
var constants = require('./constants');
var Session = require('./session');
var Signature = require('./signature');  //zjh 2018-04-29

/***
 * @class
 * 表示登录过程中发生的异常
 */
var LoginError = (function () {
    function LoginError(type, message) {
        Error.call(this, message);
        this.type = type;
        this.message = message;
    }

    LoginError.prototype = new Error();
    LoginError.prototype.constructor = LoginError;

    return LoginError;
})();

/**
 * 微信登录，获取 code 和 encryptData
 */
var getWxLoginResult = function getLoginCode(callback) {
    wx.login({
        success: function (loginResult) {
            if (userinfo){
                wx.getSetting({   //zjh 获取设置信息
                    success: res => {

                        if (res.authSetting['scope.userInfo']) {  // zjh 如果用户已经授权过

                            callback(null, {
                                code: loginResult.code,
                                encryptedData: userinfo.encryptedData,
                                iv: userinfo.iv,
                                userInfo: userinfo.userInfo,
                                withUserinfo: 'yes',
                            });
                            console.log('outer userinfo');
                        }else{
                            var error = new LoginError(constants.ERR_WX_GET_USER_INFO, '授权后才能登录');
                            error.detail = res;
                            callback(error, null);
                            console.log('no auth for outer userinfo');
                        }
                    },

                    fail: res => {
                        var error = new LoginError(constants.ERR_WX_GET_USER_INFO, '授权后才能登录');
                        error.detail = res;
                        callback(error, null);
                        console.log('get setting fail');
                    }
                })

            }else{

                wx.getSetting({   //zjh 获取设置信息
                    success: res => {

                        // if (res.authSetting['scope.userInfo']) {  // zjh 如果用户已经授权过
                            // zjh 2018-04-30 该接口获取用户信息，微信已不再支持，用户信息统一通过外面的open-type传进来
                            // 不再去执行下面函数
                            // wx.getUserInfo({    
                            //     success: function (userResult) {
                            //         callback(null, {
                            //             code: loginResult.code,
                            //             encryptedData: userResult.encryptedData,
                            //             iv: userResult.iv,
                            //             userInfo: userResult.userInfo,
                            //             withUserinfo: 'yes',
                            //         });

                            //         console.log('inner userinfo');
                            //     },

                            //     fail: function (userError) {
                            //         var error = new LoginError(constants.ERR_WX_GET_USER_INFO, '获取微信用户信息失败，请检查网络状态');
                            //         error.detail = userError;
                            //         callback(error, null);
                            //     },
                            // });

                        // }else{   //没有进行过授权，则不带用户信息去更新会话

                            callback(null, {
                                code: loginResult.code,
                                encryptedData: 'nothing',
                                iv: 'nothing',
                                userInfo: 'nothing',
                                withUserinfo: 'no',
                            });
                            console.log('login with no userinfo');
                        // }
                    },
                    fail: res => {
                        callback(null, {
                            code: loginResult.code,
                            encryptedData: 'nothing',
                            iv: 'nothing',
                            userInfo: 'nothing',
                            withUserinfo: 'no',
                        });
                        console.log('login with no userinfo');
                    }

                })
                
            }
            
        },

        fail: function (loginError) {
            var error = new LoginError(constants.ERR_WX_LOGIN_FAILED, '微信登录失败，请检查网络状态');
            error.detail = loginError;
            callback(error, null);
        },
    });
};

var noop = function noop() {};
var defaultOptions = {
    method: 'GET',
    success: noop,
    fail: noop,
    loginUrl: null,
};

//zjh 如果之前已经获取到了用户信息，则内部不再获取，增加效率
var userinfo = null;

/**
 * @method
 * 进行服务器登录，以获得登录会话
 *
 * @param {Object} options 登录配置
 * @param {string} options.loginUrl 登录使用的 URL，服务器应该在这个 URL 上处理登录请求
 * @param {string} [options.method] 请求使用的 HTTP 方法，默认为 "GET"
 * @param {Function} options.success(userInfo) 登录成功后的回调函数，参数 userInfo 微信用户信息
 * @param {Function} options.fail(error) 登录失败后的回调函数，参数 error 错误信息
 */ 
var login = function login(options) {
    options = utils.extend({}, defaultOptions, options);

    if (!defaultOptions.loginUrl) {
        options.fail(new LoginError(constants.ERR_INVALID_PARAMS, '登录错误：缺少登录地址，请通过 setLoginUrl() 方法设置登录地址'));
        return;
    }

    if(options.userinfo){  //zjh

        userinfo = {
            encryptedData: options.userinfo.encryptedData,
            iv: options.userinfo.iv,
            userInfo: options.userinfo.userInfo,
        };
    }else{
        userinfo = null;
    }

    console.log('userinfo before doLogin : ');
    console.log(userinfo);

    var doLogin = () => getWxLoginResult(function (wxLoginError, wxLoginResult) {
        if (wxLoginError) {
            options.fail(wxLoginError);
            return;
        }
        
        var userInfo = wxLoginResult.userInfo;

        // 构造请求头，包含 code、encryptedData 和 iv
        var code = wxLoginResult.code;
        var encryptedData = wxLoginResult.encryptedData;
        var iv = wxLoginResult.iv;
        var header = {};
        var withUserinfo = wxLoginResult.withUserinfo;  //zjh

        header[constants.WX_HEADER_CODE.toLowerCase()] = code;
        header[constants.WX_HEADER_ENCRYPTED_DATA.toLowerCase()] = encryptedData;
        header[constants.WX_HEADER_IV.toLowerCase()] = iv;
        header[constants.WX_HEADER_WITH_USERINFO.toLowerCase()] = withUserinfo;
        
        // zjh 处理签名
        var time = Date.parse(new Date())/1000;
        var timestamp = {timestamp:time};
        var signParams = utils.extend({}, options.data, timestamp);
        console.log("login signParams :");
        console.log(signParams);
        var signature = Signature.signature(signParams);
        console.log("login outer mdsignture :"+signature);
        //zjh 加入头部
        header['timestamp'] = time;
        header['signature'] = signature;


        // 请求服务器登录地址，获得会话信息
        wx.request({
            url: options.loginUrl,
            header: header,
            method: options.method,
            data: options.data,
            success: function (result) {
                var data = result.data;

                // 成功地响应会话信息
                if (data && data.code === 0 && data.data.skey) {
                    var res = data.data
                    if (res.userinfo) {
                        Session.set(res.skey);
                        if(withUserinfo === 'yes'){  //zjh
                            options.success(userInfo);
                        }else{
                            options.success(res.userinfo);
                        }
                        
                    } else {
                        var errorMessage = '登录失败(' + data.error + ')：' + (data.message || '未知错误');
                        var noSessionError = new LoginError(constants.ERR_LOGIN_SESSION_NOT_RECEIVED, errorMessage);
                        options.fail(noSessionError);
                    }

                // 没有正确响应会话信息
                } else {
                    var noSessionError = new LoginError(constants.ERR_LOGIN_SESSION_NOT_RECEIVED, JSON.stringify(data));
                    options.fail(noSessionError);
                }
            },

            // 响应错误
            fail: function (loginResponseError) {
                var error = new LoginError(constants.ERR_LOGIN_FAILED, '登录失败，可能是网络错误或者服务器发生异常');
                options.fail(error);
            },
        });
    });

    var session = Session.get();
    if (session) {
        wx.checkSession({
            success: function () {
                options.success(session.userInfo);
            },

            fail: function () {
                Session.clear();
                doLogin();
            },
        });
    } else {
        doLogin();
    }
};

var setLoginUrl = function (loginUrl) {
    defaultOptions.loginUrl = loginUrl;
};

module.exports = {
    LoginError: LoginError,
    login: login,
    setLoginUrl: setLoginUrl,
};