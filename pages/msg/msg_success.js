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