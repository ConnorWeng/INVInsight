// pages/stockdetail/stockdetail.js
// 
//获取应用实例
var app = getApp()
var qcloud = app.qcloud;
var util = app.util;
var config = app.config;

Page({
    /**
     * 页面的初始数据
     */
    data: {
        code: '',
        stock_id: 0,
        result:{},
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        util.mylog(options)
        this.setData({
            code: options.code,
            stock_id:options.stock_id
        })

        //网络查询
        this.searchProduct(this.data.code);

        //关闭自动刷新
        if(app.globalData.refresh.detail == 1){
            app.globalData.refresh.detail = 0;
        }
    },

    stockin:function(e){

        util.mylog(e);
        var code = this.data.code;
        var id = this.data.stock_id;

        wx.navigateTo({
          url: '../stockin/stockin?code='+code+'&stock_id='+id
        })
    },

    

    stockout:function(e){

        util.mylog(e);

        var code = this.data.code;
        var id = this.data.stock_id;

        wx.navigateTo({
          url: '../stockout/stockout?code='+code+'&stock_id='+id
        })
    },

    checkRecord:function(e){
        util.mylog(e);
        var code = this.data.code;
        var id = this.data.stock_id;
        
        wx.navigateTo({
          url: '../stockrecord/stockrecord?code='+code+'&stock_id='+id
        })
    },

    /**
     * 查询货号
     * @param   {[type]}  code  [description]
     * @return  {[type]}        [description]
     */
    searchProduct:function(code){
        //显示加载动画
        wx.showNavigationBarLoading();

        var that = this;

        qcloud.request({
            url: config.service.generalUrl+'/search?product_code='+code,
            login: true,
            method:'GET',
            success(result) {
                util.mylog('result Data : ',result);
                var res = result.data;
                //隐藏加载动画
                wx.hideNavigationBarLoading()
                //停止刷新
                wx.stopPullDownRefresh()
                that.setData({
                    result:res.data
                })

                //关闭自动刷新
                app.globalData.refresh.detail = 0;
            },

            fail(error) {

                //隐藏加载动画
                wx.hideNavigationBarLoading()
                //停止刷新
                wx.stopPullDownRefresh()
                util.showDebugModel('请求失败', error)
            }
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        //出入库后自动刷新
        if(app.globalData.refresh.detail == 1){
            this.searchProduct(this.data.code);
        }
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.searchProduct(this.data.code);
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {}
})