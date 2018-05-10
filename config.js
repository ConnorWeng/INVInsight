/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
// var host = 'https://vubyu8ns.qcloud.la';  //个人账号云服务器
// var host = 'http://mp.com:89';  //zjh 本地测试

// var host = 'http://172.18.18.108:89';  //zjh 局域网内测试

var host = 'http://120.24.63.15';  //测试服务器

var apiVersion = 'v1';   //api版本

var generalUrl = `${host}/api/${apiVersion}`;  //配置通用url部分

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        generalUrl,

        // 登录地址，用于建立会话
        loginUrl: `${generalUrl}/auth/session`,

        // 获取会话中的用户信息
        usersUrl: `${generalUrl}/auth/users`,

    },

    //数字签名密钥
    signKey:'mini_program_api_secret', 

    // 是否为调试模式
    debug:true
};

module.exports = config;