const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
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


module.exports = { formatTime, showBusy, showSuccess, showFail,showModel ,showDebugModel,showTip}
