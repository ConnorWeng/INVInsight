var constants = require('./constants');
var utils = require('./utils');
var Session = require('./session');
var loginLib = require('./login');
var Signature = require('./signature');  //zjh 2018-04-29

var noop = function noop() {};

var buildAuthHeader = function buildAuthHeader(session) {
    var header = {};

    if (session) {
        header[constants.WX_HEADER_SKEY.toLowerCase()] = session;
    }

    return header;
};

/***
 * @class
 * 表示请求过程中发生的异常
 */
var RequestError = (function () {
    function RequestError(type, message) {
        Error.call(this, message);
        this.type = type;
        this.message = message;
    }

    RequestError.prototype = new Error();
    RequestError.prototype.constructor = RequestError;

    return RequestError;
})();

function request(options) {
    if (typeof options !== 'object') {
        var message = '请求传参应为 object 类型，但实际传了 ' + (typeof options) + ' 类型';
        throw new RequestError(constants.ERR_INVALID_PARAMS, message);
    }

    console.log('request begin');

    var requireLogin = options.login;
    var success = options.success || noop;
    var fail = options.fail || noop;
    var complete = options.complete || noop;
    var originHeader = options.header || {};

    // 成功回调
    var callSuccess = function () {
        success.apply(null, arguments);
        complete.apply(null, arguments);
    };

    // 失败回调
    var callFail = function (error) {
        fail.call(null, error);
        complete.call(null, error);
    };

    // 是否已经进行过重试
    var hasRetried = false;

    if (requireLogin) {
        doRequestWithLogin();
    } else {
        doRequest();
    }

    // 登录后再请求
    function doRequestWithLogin() {
        loginLib.login({ success: doRequest, fail: callFail });
    }

    // 实际进行请求的方法
    function doRequest() {
        var authHeader = buildAuthHeader(Session.get());

        // zjh 处理签名
        var time = Date.parse(new Date())/1000;
        var timestamp = {timestamp:time};
        var signParams = utils.extend({}, options.data, timestamp);
        console.log("request signParams :");
        console.log(signParams);
        var signature = Signature.signature(signParams);
        console.log("request outer mdsignture :"+signature);
        //zjh 加入头部
        authHeader['timestamp'] = time;
        authHeader['signature'] = signature;

        console.log('real request begin');

        wx.request(utils.extend({}, options, {
            header: utils.extend({}, originHeader, authHeader),

            success: function (response) {
                var data = response.data;
                console.log('request return :');
                console.log(response);
                var error, message;
                if (data && data.code === 451) {  //zjh 451代表登录态已经过期
                    Session.clear();
                    // 如果是登录态无效，并且还没重试过，会尝试登录后刷新凭据重新请求
                    if (!hasRetried) {
                        hasRetried = true;
                        doRequestWithLogin();
                        return;
                    }

                    message = '登录态已过期';
                    error = new RequestError(data.error, message);

                    callFail(error);
                    return;
                } else if(data && data.code === 403){  //zjh 403 意味着本地的token与服务器上的不一致，则更新一下

                    Session.clear();
                    // 如果认证失败，并且还没重试过，会尝试登录后刷新凭据重新请求
                    if (!hasRetried) {
                        hasRetried = true;
                        doRequestWithLogin();
                        return;
                    }

                    message = '认证失败';
                    error = new RequestError(data.error, message);

                    callFail(error);
                    return;

                }else {
                    callSuccess.apply(null, arguments);
                }
            },

            fail: callFail,
            complete: noop,
        }));
    };

};

module.exports = {
    RequestError: RequestError,
    request: request,
};