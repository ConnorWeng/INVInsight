// pages/speak/speak.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        nullHouse: false, //先设置隐藏
        dialog:{
            title:'168873 入库',
            content:[
                {
                    image:'in.png',
                    content:'红色 , XL , 3 件'
                },
                {
                    image:'out.png',
                    content:'白色 , 均码 , 3 件'
                },
            ]
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {},
    clickArea: function() {
        var that = this;
        this.setData({
            nullHouse: false, //弹窗显示
        })
        setTimeout(function() {
            that.setData({
                nullHouse: true,
            }) //1秒之后弹窗隐藏
        }, 1000)
    },

     showDialog(){
        this.dialog.showDialog();
      },
      //取消事件
      _cancelEvent(e){
        console.log(e);
        console.log('你点击了取消');
        console.log(this.data.dialog.title);
        this.dialog.hideDialog();
      },
      //确认事件
      _confirmEvent(e){
        console.log(e);
        console.log('你点击了确定');
        console.log(this.dialog.title);
        this.dialog.hideDialog();
      },

    showCover:function(e){
        //获得cover组件
        // var cover = this.selectComponent("#cover");

        // cover.showCover();
        console.log('tapcover');
    },
        /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        //获得dialog组件
        this.dialog = this.selectComponent("#dialog");
    },
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