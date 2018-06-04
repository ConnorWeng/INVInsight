
/**
 * 计算签名 zjh 2018-04-29
 */
    
var md5 = require('./md5');
var utils = require('./utils');

var keyName = 'signKey';   // zjh 保存到内存里的签名密钥名称

var Signature = {

    get: function () {
        return wx.getStorageSync(keyName) || null;
    },

    set: function (session) {
        wx.setStorageSync(keyName, session);
    },

    clear: function () {
        wx.removeStorageSync(keyName);
    },

    signature: function (params){
        if (typeof params !== 'object') {
            return false;
        }

        var signKey = this.get();  // 获取签名密钥

        utils.log.mylog('inner get signKey :'+signKey);

        utils.log.mylog('signature params before sort :');
        utils.log.mylog(params);

        var sdic = Object.keys(params).sort();

        var vdic ={};
        for(var ki in sdic){   
            vdic[sdic[ki]] = utils.Trim.trimObject(params[sdic[ki]]);          
        }

        params = vdic;

        utils.log.mylog('signature params after sort :');
        utils.log.mylog(params);

        var val = '';
        var tmp = '';
        var new_str = '';
        for (var key in params) {
            if (typeof params[key] === 'object') {
                val = JSON.stringify(params[key]);
            }else{
                val = params[key];
            }

            tmp = key+"="+val;

            new_str += tmp+'&';
        }

        var signature = new_str + 'secret=' + signKey; 

        utils.log.mylog('signature :'+signature);

        var mdSignature = md5.md5(signature); 
        utils.log.mylog('mdSignature :'+mdSignature);

        return mdSignature;

    }

};



module.exports = Signature;



