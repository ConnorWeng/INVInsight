// pages/stockout/stockout.js
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
        buttonColor:'',
        items: {},
        dialog:{     //zjh 例子
            title:'xxx 入库',     
            content:[
                {
                    image:'in.png',
                    content:'红色 , XL , 3 件'
                },
            ]
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

        console.log(options)
        this.setData({
            code: options.code
        })

        //获取货号对应的id
        this.data.stockId = options.stock_id;
        
        // util.showBusy('')

        var that = this;

        this.tempset();  //临时设置，对接接口后，清除

        // qcloud.request({
        //     url: config.service.generalUrl+"/stock/stocks/"+this.data.stockId,
        //     login: true,
        //     success(result) {
        //         util.showSuccess('')
        //         that.setData({
        //             code: options.code,
        //             items:result.data.data.skus
        //         })
        //     },
        //     fail(error) {
        //         if (config.debug) {
        //             util.showDebugModel('请求失败', error)
        //         } else {
        //             util.showModel('请求失败', '请求失败，请检查网络状态')
        //         }
        //         console.log('request fail', error)
        //     }
        // })
    },

    // 对接后删除
    tempset:function(e){

    var items = 
        [
            {
                id:1,
                stock_id:2,
                color:'红色',
                size:'XL',
                stock_amount:12,
            },
            {
                id:2,
                stock_id:2,
                color:'黑色',
                size:'XL',
                stock_amount:12,
            },
            {
                id:4,
                stock_id:2,
                color:'白色',
                size:'XL',
                stock_amount:12,
            },

        ];

        for(var key in items){
            items[key]['number'] = 1;
            items[key]['color_style'] ='';
            items[key]['checkbox_color'] ='green';
            items[key]['check'] = false;
        }

        console.log('items : ',items)

        this.setData({
            items:items
        })
    },




    showDialog(result) {

        var content = new Array();
        var items = this.data.items;
        for(var key in items){
            // result.hasOwnProperty(items[key].id)
            // result[items[key].id] !== undefined
            if(result.hasOwnProperty(items[key].id)){
                content.push({
                    image:'out.png',
                    content:items[key].color+' , '+items[key].size+' , '+result[items[key].id]+' 件'
                });
            }
        }

        this.setData({
            dialog:{
                title:result.product_code+' 出库',
                content:content
            }
        })
        this.dialog.showDialog();
    },
    //取消事件
    _cancelEvent(e) {
        console.log(e);
        console.log('你点击了取消');
        this.dialog.hideDialog();
    },
    //确认事件
    _confirmEvent(e) {
        console.log(e);
        console.log('你点击了确定');
        this.dialog.hideDialog();


        //确认后与后台通讯
        //后台返回后跳转(用重定向的方式)
        var url = '../stockout/stockout?code='+this.data.code;
        url = encodeURIComponent(url);  //编码，防止重复?，丢失参数的问题
        wx.redirectTo({
          url: '../msg/msg_success?operate=出库&url='+url
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
        console.log(e);

        for(var key in this.data.items){

            if(this.data.items[key]['id'] == e.target.dataset.id){

                if(!this.data.items[key]['check']){
                    //提示已经达到最大值
                    util.showFail('请先勾选当前项');
                    this.data.items[key]['number'] = 1;
                    this.setData({
                        items: this.data.items
                    })
                    return;
                }

                var after = parseInt(e.detail.value);

                if(after >= this.data.items[key]['stock_amount']){
                    after = this.data.items[key]['stock_amount'];
                    //提示已经达到最大值
                    util.showFail('已达到最大值');
                }

                // 选中后，至少要出库1件
                if(e.detail.value == "" || e.detail.value == 0){
                    after = 1;
                    //提示最小为1
                    util.showFail('出库不能少于1件');
                }

                this.data.items[key]['number'] = after;
                this.setData({
                    items: this.data.items
                })
                break;
            }
        }
        
    },

    /**
     * checkbox事件
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    checkboxChange: function(e) {
        console.log(e)
        console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    },

    /**
     * 点击checkbox
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    bindcheck:function(e){
        console.log('click : ',e)

        var check = false;
        for(var key in this.data.items){
            if(this.data.items[key]['id'] == e.target.id){
                if(e.target.dataset.check){
                    this.data.items[key]['color_style'] = "" 
                    this.data.items[key]['check'] = false;
                    
                }else{
                    this.data.items[key]['color_style'] = "color:#40bacf;" 
                    this.data.items[key]['check'] = true;
                }
                this.setData({
                    items: this.data.items
                })
            }

            if(this.data.items[key]['check']){
                check = true;
            }

        }

        if(check){
            this.setData({
                buttonColor: 'color:#FFFFFF;background-color:#40bacf'
            })
        }else{
            this.setData({
                buttonColor: 'color:grey;background-color:white'
            })
        }
    },

    clickCheck:function(e){
        console.log('clickCheck',e);
    },
    /**
     * 提交表单
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    formSubmit: function(e) {
        console.log(e);

        var check = false;
        for(var key in this.data.items){
            if(this.data.items[key]['check']){
                check = true;
            }
        }
        if(!check){
            util.showFail('请勾选要出库的sku项');
            return;
        }

        var result = [];
        result['stock_id'] = this.data.stockId;
        result['product_code'] = e.detail.value['product_code'];

        var checkArray = e.detail.value.check;

        var sku='';
        var temp = e.detail.value; 
        for (var i = checkArray.length - 1; i >= 0; i--) {
            sku = 'sku_'+checkArray[i];
            result[checkArray[i]] = temp[sku];
        }

        console.log('result:',result);

        //zjh 弹出确认窗口
        this.showDialog(result);
    },

     /**
     * 增加 
     * @param  {[type]}  e  [description]
     */
    addCount: function(e) {

        console.log(e)

        for(var key in this.data.items){
            console.log(this.data.items)
            if(this.data.items[key]['id'] == e.target.dataset.num){

                if(!this.data.items[key]['check']){
                    //提示已经达到最大值
                    util.showFail('请先勾选当前项');
                    return;
                }

                var after = parseInt(this.data.items[key]['number']) + 1;
                if(after >= this.data.items[key]['stock_amount']){
                    after = this.data.items[key]['stock_amount'];
                    //提示已经达到最大值
                    util.showFail('已达到最大值');
                }

                this.data.items[key]['number'] = after;
                this.setData({
                    items: this.data.items
                })
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

        console.log(e)
        console.log(e.target.dataset.num)
        for(var key in this.data.items){
            console.log(this.data.items)
            if(this.data.items[key]['id'] == e.target.dataset.num){

                if(!this.data.items[key]['check']){
                    //提示已经达到最大值
                    util.showFail('请先勾选当前项');
                    return;
                }

                var after = parseInt(this.data.items[key]['number']) - 1;
                after = after >= 1 ? after : 1;
                this.data.items[key]['number'] = after;
                this.setData({
                    items: this.data.items
                })
                break;
            }
        }
        
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