
var app = getApp()
var qcloud = app.qcloud;
var util = app.util;
var config = app.config;

Page({
	data:{
		operate:'',
		url:''
	},
	/**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        this.setData({
            url: decodeURIComponent(options.url),
            operate:options.operate
        })
        console.log('success onLoad url',this.data.url)

        //出入库成功后，设置要自动刷新的页面
        app.globalData.refresh.home = 1;
        app.globalData.refresh.store = 1;
        app.globalData.refresh.stock = 1;
        app.globalData.refresh.detail = 1;
    },

    close:function(e){
    	console.log('close page',e)
    	wx.navigateBack({
		  delta: 1
		})
    },

    doagain:function(e){
    	console.log('doagain',e)
    	wx.redirectTo({
		  url: this.data.url
		})
    }
});