const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

var config = require('../config')  //zjh 获取配置信息

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    mask:true,
    duration: 10000
})

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
})

// 显示成功提示
var showFail = text => wx.showToast({
    title: text,
    icon: 'none'
})

// 显示失败提示
var showDebugModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    })
}

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: content,
        showCancel: false
    })
}

// 显示提示
var showTip = (title,content,action)=>{
    wx.hideToast();

    wx.showModal({
        title,
        content: content,
        success:function(res){
          if(res.confirm){
            action();
          }
        }
    })
}


//自定义打印log
var mylog = function(){
  if(config.debug){
    for(var i=0;i<arguments.length;i++){
      console.log(arguments[i]);
    }
  }
  
}


//制作简单异步函数
var myAsync=function(time,object,callback){
    //read data
    setTimeout(function(){
        callback(object);
    },time);//x毫秒后回调
};


module.exports = { formatTime, showBusy, showSuccess, showFail,showModel ,showDebugModel,showTip,mylog,myAsync}
