// pages/stockin/stockin.js
// //获取应用实例
var app = getApp()
var qcloud = app.qcloud;
var util = app.util;
var config = app.config;
var initMax = 30; //滑块初始化时候的最大值
Page({
    /**
     * 页面的初始数据
     */
    data: {
        code: '',
        number: 1,
        color: {
            picker: {
                display: '',
                name: 'color'
            },
            input: {
                display: 'display:none',
                name: ''
            }
        },
        size: {
            picker: {
                display: '',
                name: 'size'
            },
            input: {
                display: 'display:none',
                name: ''
            }
        },
        sliderMax: initMax,
        sliderValue: 1,
        colorArray: ['白色', '黑色', '红色', '橙色', '黄色', '绿色', '蓝色', '青色', '紫色', '灰色', '粉色'],
        colorIndex: 0,
        sizeArray: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', '均码'],
        sizeIndex: 0,
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
        util.mylog(options)
        this.setData({
            code: options.code
        })
    },
    showDialog(result) {
        this.setData({
            dialog:{
                title:result.product_code+' 入库',
                content:[
                    {
                        image:'in.png',
                        content:result.color+' , '+result.size+' , '+result.stock_amount+' 件'
                    }
                ]
            }
        })
        this.dialog.showDialog(result);
    },

    showNoAction(title,content) {
        this.setData({
            dialog:{
                title:title,
                content:[
                    {
                        image:'close.png',
                        content:content
                    }
                ]
            }
        })
        this.errDialog.showDialog();
    },

    //无行动事件
    _noEvent(e) {
        util.mylog(e);
        util.mylog('no action');
        this.errDialog.hideDialog();
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
        this.postStock(e.detail);
            
                
    },

    /**
     * 联网推送数据
     * @param   {[type]}  data  [description]
     * @return  {[type]}        [description]
     */
    postStock:function(data){
        //显示加载动画
        util.showBusy('入库中');

        var that = this;
        var url = '../stockin/stockin?code='+this.data.code;
        url = encodeURIComponent(url);  //编码，防止重复?，丢失参数的问题
        util.mylog('url before redirect :'+url);

        qcloud.request({
            url: config.service.generalUrl+'/stocks',
            login: true,
            method:'POST',
            data:data,
            success(result) {
                util.mylog('result Data : ',result);
                var res = result.data;
                //隐藏加载动画
                wx.hideToast();

                //后台返回后跳转(用重定向的方式)
                wx.redirectTo({
                  url: '../msg/msg_success?operate=入库&url='+url
                })
            },

            fail(error) {

                //隐藏加载动画
                wx.hideToast();

                wx.redirectTo({
                    url: '../msg/msg_fail?operate=入库&url='+url
                })

            }
        })
    },

    /**
     * 提交表单
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    formSubmit: function(e) {
        util.mylog(e);
        var result = e.detail.value; //获取表单结果
        if (!e.detail.value.color_switch) { //颜色自定义开关是关闭的
            result.color = this.data.colorArray[result.color];
        }
        if (!e.detail.value.size_switch) { //尺码自定义开关是关闭的
            result.size = this.data.sizeArray[result.size];
        }
        //删除多余的对象属性
        delete result.color_switch;
        delete result.size_switch;
        if (result['color'] == "") {
            util.showFail('请输入颜色');
            return;
        }
        if (result['size'] == "") {
            util.showFail('请输入尺码');
            return;
        }
        util.mylog('result:', result);

        // 拍照功能正在开发中
        if(e.detail.target.id === "photo_confirm"){

            this.showNoAction("开发中...","拍照功能正在开发中...")
            return;
        }

        //弹出确认框
        this.showDialog(result);
    },
    /**
     * 颜色picker选择器
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    pickerColorChange: function(e) {
        util.mylog('color picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            colorIndex: e.detail.value
        })
    },
    /**
     * 尺码picker选择器
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    pickerSizeChange: function(e) {
        util.mylog('size picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            sizeIndex: e.detail.value
        })
    },
    /**
     * 数量输入改变时触发
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    inputChange: function(e) {
        util.mylog(e);
        if (e.detail.value > initMax) { //已经达到了滑块的最大值
            this.setData({
                sliderValue: e.detail.value,
                sliderMax: e.detail.value
            })
        } else {
            var after = e.detail.value >= 1 ? e.detail.value : 1;
            var number = e.detail.value;
            if (e.detail.value == "" || e.detail.value == 0) {
                number = 1;
                //提示最小为1
                util.showFail('入库不能少于1件');
            }
            this.setData({
                sliderValue: after,
                number: number,
                sliderMax: initMax
            })
        }
    },
    /**
     * 自定义颜色
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    colorCustom: function(e) {
        util.mylog(e);
        if (e.detail.value) {
            this.setData({
                color: {
                    picker: {
                        display: 'display:none',
                        name: ''
                    },
                    input: {
                        display: '',
                        name: 'color'
                    }
                }
            })
        } else {
            this.setData({
                color: {
                    picker: {
                        display: '',
                        name: 'color'
                    },
                    input: {
                        display: 'display:none',
                        name: ''
                    }
                }
            })
        }
    },
    /**
     * 自定义尺寸
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    sizeCustom: function(e) {
        util.mylog(e);
        if (e.detail.value) {
            this.setData({
                size: {
                    picker: {
                        display: 'display:none',
                        name: ''
                    },
                    input: {
                        display: '',
                        name: 'size'
                    }
                }
            })
        } else {
            this.setData({
                size: {
                    picker: {
                        display: '',
                        name: 'size'
                    },
                    input: {
                        display: 'display:none',
                        name: ''
                    }
                }
            })
        }
    },
    /**
     * 滑动条
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    sliderchange: function(e) {
        this.setData({
            number: e.detail.value,
            sliderValue: e.detail.value
        })
        util.mylog(e);
    },
    /**
     * 增加 
     * @param  {[type]}  e  [description]
     */
    addCount: function(e) {
        util.mylog('addCount : ' + this.data.sliderValue);
        if (this.data.sliderValue >= this.data.sliderMax) { //已经达到了滑块的最大值
            util.mylog('addCount sliderMax: ' + this.data.sliderMax);
            this.setData({
                number: parseInt(this.data.sliderValue) + 1,
                sliderValue: parseInt(this.data.sliderValue) + 1,
                sliderMax: parseInt(this.data.sliderValue) + 1
            })
        } else {
            this.setData({
                number: parseInt(this.data.sliderValue) + 1,
                sliderValue: parseInt(this.data.sliderValue) + 1
            })
        }
    },
    /**
     * 减少
     * @param   {[type]}  e  [description]
     * @return  {[type]}     [description]
     */
    minusCount: function(e) {
        util.mylog('minusCount : ' + this.data.sliderValue);
        var after = parseInt(this.data.sliderValue) - 1;
        after = after >= 1 ? after : 1;
        this.setData({
            number: after,
            sliderValue: after
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        //获得dialog组件 zjh
        this.dialog = this.selectComponent("#dialog");

        this.errDialog = this.selectComponent("#err_dialog");
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