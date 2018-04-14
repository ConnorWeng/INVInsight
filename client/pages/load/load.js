// pages/load/load.js

//获取应用实例
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("load.begin");

    //zjh 等待授权反馈
    (function load() {
      wx.getStorage({  
        key: 'wait',  
        success: function(res) {      
          console.log('load.wait...:'+res.data);
          if(res.data === false){

            console.log("load.redirect");
            // zjh 没有授权，则跳转到需要授权的页面
            if(!app.globalData.auth){
              wx.reLaunch({
                url:"/pages/index/index"
              })
            }else{  //zjh 有授权则跳转到home页面
              wx.reLaunch({
                url: '/pages/home/home'
              })
            }

          }else{
            load();  // 再去查缓存的wait，直到wait已经变更为false，即可以不用再等待了
          }
        }
      })
    })(0); 
    
  },

  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})