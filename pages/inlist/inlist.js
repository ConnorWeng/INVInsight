// pages/inlist/inlist.js

// //获取应用实例
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
        stockId:0,
        number:1,
        list:{},
        currentSubList:[],
        items: [],
        dialog:{     //zjh 例子
            title:'xxx 入库',     
            content:[
                {
                    image:'in.png',
                    content:'红色 , XL , 3 件'
                },
            ]
        },

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

        util.mylog(options)
        this.setData({
            code: options.code
        })

        //从缓存中获取对应入库清单
        this.data.list = wx.getStorageSync('inlist');
        this.data.currentSubList = this.data.list[options.code] === undefined 
                                    || this.data.list[options.code] === [] 
                                    ? [] : this.data.list[options.code];

        util.mylog('list',this.data.list);                     
        util.mylog('currentSubList',this.data.currentSubList);

        //设置库存量
        this.setResult(this.data.currentSubList);
    },  

    //设置库存量
    setResult:function(data){

        var items = data;

        if(app.globalData.currentProduct !== null){
            for(var key in items){
                items[key]['stock_amount'] = 0;
                
                for(var k in app.globalData.currentProduct){
                    if(app.globalData.currentProduct[k]['color'] === items[key]['color']
                        && app.globalData.currentProduct[k]['size'] === items[key]['size']){
                        items[key]['stock_amount'] = app.globalData.currentProduct[k]['stock_amount'];
                        break;
                    }
                }

            }


        }

        util.mylog('items : ',items)

        this.setData({
            items:items
        })
    },



    showDialog(result) {

        var content = new Array();

        for(var key in result){

            content.push({
                image:'in.png',
                content:result[key].color+' , '+result[key].size+' , '+result[key].number+' 件'
            });

        }

        this.setData({
            dialog:{
                title:this.data.code+' 入库',
                content:content
            }
        })
        this.dialog.showDialog();
    },
    //取消事件
    _cancelEvent(e) {
        util.mylog(e);
        util.mylog('你点击了取消');
        this.dialog.hideDialog();
    },
    //确认事件
    _confirmEvent(e) {
        util.mylog(e);
        util.mylog('你点击了确定');
        this.dialog.hideDialog();


        //确认后与后台通讯
        //后台返回后跳转(用重定向的方式)
        //删除清单
        this.data.currentSubList = [];
        //保存到缓存
        this.saveToStorage();

        var url = '../stockin/stockin?code='+this.data.code;
        url = encodeURIComponent(url);  //编码，防止重复?，丢失参数的问题
        wx.redirectTo({
          url: '../msg/msg_success?operate=入库&type=batchin&url='+url
        })

        //失败
        // wx.redirectTo({
        //   url: '../msg/msg_fail?operate=出库&url='+url
        // })
            

    },


    /**
     * 数量输入改变时触发
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    inputChange:function(e){
        util.mylog(e);

        for(var key in this.data.items){

            if(key == e.target.dataset.id){


                var after = parseInt(e.detail.value);

                // 选中后，至少要出库1件
                if(e.detail.value == "" || e.detail.value == 0){
                    after = 1;
                    //提示最小为1
                    util.showFail('入库不能少于1件');
                }

                this.data.items[key]['number'] = after;
                this.setData({
                    items: this.data.items
                })

                this.data.currentSubList[key]['number'] = after;
                //保存到缓存
                this.saveToStorage();

                break;
            }
        }
        
    },

    /**
     * 删除缓存中的某个sku
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    delete:function(e){
        util.mylog(e);

        var color = this.data.items[e.target.dataset.id].color;
        var size = this.data.items[e.target.dataset.id].size;

        var that = this;
        util.showTip('确定删除该sku？',color+' , '+size,function(){
            // that.data.items.splice(e.target.dataset.id,1);
            that.data.currentSubList.splice(e.target.dataset.id,1); 

            that.setData({
                items: that.data.items
            })

            //保存到缓存
            that.saveToStorage();
        })

        
    },


    /**
     * 提交表单
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    formSubmit: function(e) {
        util.mylog(e);

        var result = this.data.currentSubList;

        util.mylog('result:',result);

        if(this.data.currentSubList.length == 0){
            util.showFail('清单为空');
            return;
        }

        //zjh 弹出确认窗口
        this.showDialog(result);
    },

     /**
     * 增加 
     * @param  {[type]}  e  [description]
     */
    addCount: function(e) {

        util.mylog(e)

        for(var key in this.data.items){
            util.mylog(this.data.items)
            if(key == e.target.dataset.num){

                var after = parseInt(this.data.items[key]['number']) + 1;

                this.data.items[key]['number'] = after;
                this.setData({
                    items: this.data.items
                })


                this.data.currentSubList[key]['number'] = after;
                //保存到缓存
                this.saveToStorage();

                break;
            }
        }

    },
    /**
     * 减少
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    minusCount: function(e) {

        util.mylog(e)
        util.mylog(e.target.dataset.num)
        for(var key in this.data.items){
            util.mylog(this.data.items)
            if(key == e.target.dataset.num){

                var after = parseInt(this.data.items[key]['number']) - 1;
                after = after >= 1 ? after : 1;
                this.data.items[key]['number'] = after;
                this.setData({
                    items: this.data.items
                })

                this.data.currentSubList[key]['number'] = after;
                //保存到缓存
                this.saveToStorage();

                break;
            }
        }
        
    },


    /**
     * 保存到到缓存
     * @return  {[type]}        [description]
     */
    saveToStorage:function(){

        this.data.list = this.data.list === undefined 
                        || this.data.list === {} || this.data.list === "" || this.data.list === null
                        ? {} : this.data.list;

        this.data.list[this.data.code] = this.data.currentSubList;

        wx.setStorageSync('inlist', this.data.list)
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        //获得dialog组件 zjh
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