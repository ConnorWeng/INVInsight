var constants = require('./lib/constants');
var login = require('./lib/login');
var Session = require('./lib/session');
var request = require('./lib/request');
var Tunnel = require('./lib/tunnel');
var Signature = require('./lib/signature');  //zjh 2018-04-29

var exports = module.exports = {
    login: login.login,
    setLoginUrl: login.setLoginUrl,
    setDebug:request.setDebug,
    LoginError: login.LoginError,

    clearSession: Session.clear,
    getSession : Session.get,
    request: request.request,
    RequestError: request.RequestError,

    Tunnel: Tunnel,

    Signature: Signature,
};

// 导出错误类型码
Object.keys(constants).forEach(function (key) {
    if (key.indexOf('ERR_') === 0) {
        exports[key] = constants[key];
    }
});