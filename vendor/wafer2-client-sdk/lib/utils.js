
/**
 * 拓展对象
 */
exports.extend = function extend(target) {
    var sources = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < sources.length; i += 1) {
        var source = sources[i];
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }

    return target;
};

/**
 * 清除空格
 */
exports.Trim = {

    trim:function (str){ //删除左右两端的空格
        return str.replace(/(^\s*)|(\s*$)/g, "");
    },
    　　 
    ltrim:function (str){ //删除左边的空格
        return str.replace(/(^\s*)/g,"");
    },
    rtrim:function (str){ //删除右边的空格
        return str.replace(/(\s*$)/g,"");
    },

    /**
     *  zjh 递归去掉对象属性两边空格
     */
    trimObject:function (obj){
         
        if (typeof obj === 'object') {
            for(var k in obj){
                if(typeof obj[k] === 'object'){
                    obj[k] = this.trimObject(obj[k]);
                }else if(typeof obj === 'string'){
                    obj[k] = this.trim(obj[k]);
                }
            }
        }else if(typeof obj === 'string'){
            obj = this.trim(obj);
        }

        return obj;
    }

};

