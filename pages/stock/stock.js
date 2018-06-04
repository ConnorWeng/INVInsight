// pages/stock/stock.js

var app = getApp()
var qcloud = app.qcloud;
var util = app.util;
var config = app.config;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    stocks:[],
    hasStockData:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
        
    //联网查询

    this.getStockData();

    //关闭自动刷新
    if(app.globalData.refresh.stock == 1){
        app.globalData.refresh.stock = 0;
    }
  },

    stockin:function(e){

        util.mylog(e);
        var code = e.currentTarget.dataset.code;
        var id = e.currentTarget.dataset.id;

        wx.navigateTo({
          url: '../stockin/stockin?code='+code+'&stock_id='+id
        })
    },

    

    stockout:function(e){

        util.mylog(e);

        var code = e.currentTarget.dataset.code;
        var id = e.currentTarget.dataset.id;

        wx.navigateTo({
          url: '../stockout/stockout?code='+code+'&stock_id='+id
        })
    },

    checkDetail:function(e){
        util.mylog(e);

        var code = e.currentTarget.dataset.code;
        var id = e.currentTarget.dataset.id;

        wx.navigateTo({
          url: '../stockdetail/stockdetail?code='+code+'&stock_id='+id
        })

    },

    inputFocus:function(e){
        util.mylog(e)
        wx.navigateTo({
          url: '../findstock/findstock'
        })
    },

    /**
     * 获取库存列表
     * @return  {[type]}  [description]
     */
    getStockData:function(){
        //显示加载动画
        wx.showNavigationBarLoading();

        var that = this;

        qcloud.request({
            url: config.service.generalUrl+'/stocks',
            login: true,
            method:'GET',
            success(result) {
                util.mylog('stocks Data : ',result);
                var res = result.data;
                //隐藏加载动画
                wx.hideNavigationBarLoading()
                 //停止刷新
                wx.stopPullDownRefresh()

                that.data.stocks = that.data.stocks.concat(res.data.stocks);
                util.mylog('stocks',res.data.stocks);

                that.setData({
                    hasStockData:true,
                    stocks: res.data.stocks?res.data.stocks:[],
                })

                //关闭自动刷新
                app.globalData.refresh.stock = 0;
            },

            fail(error) {
                util.showDebugModel('请求失败', error)
                //隐藏加载动画
                wx.hideNavigationBarLoading()
                 //停止刷新
                wx.stopPullDownRefresh()
                that.setData({
                    hasStockData:false
                })
            }
        })
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
    //出入库后自动刷新
    if(app.globalData.refresh.stock == 1){
        this.getStockData();
    }
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
    this.getStockData();
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