// pages/stockdetail/stockdetail.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        code: '',
        stock_id: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        this.setData({
            code: options.code,
            stock_id:options.stock_id
        })
    },

    stockin:function(e){

        console.log(e);
        var code = this.data.code;
        var id = this.data.stock_id;

        wx.navigateTo({
          url: '../stockin/stockin?code='+code+'&stock_id='+id
        })
    },

    

    stockout:function(e){

        console.log(e);

        var code = this.data.code;
        var id = this.data.stock_id;

        wx.navigateTo({
          url: '../stockout/stockout?code='+code+'&stock_id='+id
        })
    },

    checkRecord:function(e){
        console.log(e);
        var code = this.data.code;
        var id = this.data.stock_id;
        
        wx.navigateTo({
          url: '../stockrecord/stockrecord?code='+code+'&stock_id='+id
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {},
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
    onPullDownRefresh: function() {},
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {}
})