// pages/stockin/stockin.js
// //获取应用实例
var app = getApp()
var qcloud = app.qcloud;
var util = app.util;
var config = app.config;
var initMax = 30; //滑块初始化时候的最大值
var hasLoad = false;  // 判断是否经历过load
var inlistMax = 100;  //限制清单的最大数量，防止恶意操作导致本地缓存爆满
var subListMax = 100; //限制每张清单的条数

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
        },
        list:{},
        currentSubList:[],
        itemNum:0,
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        util.mylog(options)
        
        //从缓存中获取对应入库清单
        this.data.list = wx.getStorageSync('inlist');
        this.data.currentSubList = this.data.list[options.code] === undefined 
                                    || this.data.list[options.code] === [] 
                                    ? [] : this.data.list[options.code];

        util.mylog('list',this.data.list);                     
        util.mylog('currentSubList',this.data.currentSubList);

        //获取款号 和 获取清单条数
        this.setData({
            code: options.code,
            itemNum:this.data.currentSubList.length            
        })

        //重置一下currentProduct
        app.globalData.currentProduct = null;

        hasLoad = true;
        util.mylog('hasLoad : ',hasLoad);   
        //网络查询货号
        this.searchProduct(options.code);

    },


    /**
     * 查询货号
     * @param   {[type]}  code  [description]
     * @return  {[type]}        [description]
     */
    searchProduct:function(code){

        var that = this;

        qcloud.request({
            url: config.service.generalUrl+'/search?product_code='+code,
            login: true,
            method:'GET',
            success(result) {
                util.mylog('result Data : ',result);
                var res = result.data;

                app.globalData.currentProduct = res.data.stock.skus;
                util.mylog('currentProduct : ',app.globalData.currentProduct)
            },

            fail(error) {
                app.globalData.currentProduct = null;
            }
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

    showListDialog(result) {
        this.setData({
            dialog:{
                title:'清单条目',
                content:[
                    {
                        image:'in.png',
                        content:result.color+' , '+result.size+' , '+result.stock_amount+' 件'
                    }
                ]
            }
        })
        this.listDialog.showDialog(result);
    },

    //加入清单事件
    _addEvent(e) {
        util.mylog(e);
        util.mylog('你点击了确定');
        this.listDialog.hideDialog();

        //加入本地缓存清单
        this.addToList(e.detail);
    },

    //取消事件
    _cancelEvent1(e) {
        util.mylog(e);
        util.mylog('你点击了取消');
        this.dialog.hideDialog();
    },

    //取消事件
    _cancelEvent2(e) {
        util.mylog(e);
        util.mylog('你点击了取消');
        this.listDialog.hideDialog();
    },
    //确认直接入库事件
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

        var mydata = {
            stocks:[
                data
            ]
        };
        // mydata[0]=data;
        util.mylog(mydata);

        qcloud.request({
            url: config.service.generalUrl+'/stocks',
            login: true,
            method:'POST',
            data:mydata,
            success(result) {
                util.mylog('result Data : ',result);
                var res = result.data;
                //隐藏加载动画
                wx.hideToast();

                //后台返回后跳转(用重定向的方式)
                wx.redirectTo({
                  url: '../msg/msg_success?operate=入库&type=in&url='+url
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

        // 增加清单
        if(e.detail.target.id === "add_list"){
            if(this.data.currentSubList.length >= subListMax){
                util.mylog('subListMax',subListMax);
                util.showModel('已达到最大限制','清单条数已达到'+subListMax+'条，请先将当前清单入库');
            }else{
                this.showListDialog(result);
            }
            
            return;
        }

        // 查看清单
        if(e.detail.target.id === "check_list"){

            // this.showNoAction("开发中...","拍照功能正在开发中...")
            // 跳转到清单页面
            if(this.data.currentSubList.length == 0){
                util.showFail('清单为空');
                return;
            }
            wx.navigateTo({
               url: '../inlist/inlist?code='+this.data.code
            })
            return;
        }

        //弹出确认框
        this.showDialog(result);
    },

    /**
     * 加入本地缓存清单
     * @param  {[type]}  data  [description]
     */
    addToList:function(data){
        util.mylog("addToList",data);

        var that = this;

        var result = {};
        result['color'] = data['color'];
        result['size'] = data['size'];
        result['number'] = parseInt(data['stock_amount']);

        var existed = -1;

        for(var key in this.data.currentSubList){
            if(this.data.currentSubList[key]['color'] === data['color']
                && this.data.currentSubList[key]['size'] === data['size']){
                existed = key;
                break;
            }
        }

        // 有已存在的sku，则提示是否需要合并
        if(existed !== -1){
            wx.showModal({
                title: '提示',
                content: '清单中已存在该sku,要累加入库数吗？',
                success: function(res) {
                    if (res.confirm) {
                        console.log('用户点击确定')
                        that.data.currentSubList[existed]['number'] += parseInt(result['number']);
                        //将清单写入缓存
                        that.setStorageList('cumulative');
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })

            return;
        }

        this.data.currentSubList.push(result);
        
        //将清单写入缓存
        this.setStorageList('add');

    },

    /**
     * 将清单写入缓存
     */
    setStorageList:function(type){
        //存储清单
        var that = this;

        this.data.list = this.data.list === undefined 
                        || this.data.list === {} || this.data.list === "" || this.data.list === null
                        ? {} : this.data.list;

        that.data.list[that.data.code] = that.data.currentSubList;

        wx.setStorage({
            key:"inlist",
            data:that.data.list,
            success:function(){
                that.setData({
                    itemNum:that.data.currentSubList.length            
                })

                if(type === 'add'){
                    util.showSuccess('已成功加入清单');
                }

                if(type === 'cumulative'){
                    util.showSuccess('入库数累加成功');
                }

                //更新一下清单的添加时间
                app.globalData.listAddTime[that.data.code] = Date.parse(new Date());
                wx.setStorageSync('listAddTime', app.globalData.listAddTime);
            },
            fail:function(){
                util.showFail('加入清单失败，请再试一次');
            }
        })
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

        this.listDialog = this.selectComponent("#list_dialog");
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        util.mylog('hasLoad before show : ',hasLoad); 

        //没有获取到库存信息时
        // if(!hasLoad && app.globalData.currentProduct === null){
        //     //网络查询货号
        //     util.mylog('code in show : ',this.data.code); 
        //     this.searchProduct(this.data.code);
        // }

        if(!hasLoad){

            this.data.list = wx.getStorageSync('inlist');
            this.data.currentSubList = this.data.list[this.data.code] === undefined 
                                        || this.data.list[this.data.code] === [] 
                                        ? [] : this.data.list[this.data.code];

            util.mylog('list in show',this.data.list);                     
            util.mylog('currentSubList in show',this.data.currentSubList);

            
        }

        //判断清单数是否达到了限制，
        util.mylog('app.globalData.listAddTime.length',Object.getOwnPropertyNames(app.globalData.listAddTime).length);
        if( Object.getOwnPropertyNames(app.globalData.listAddTime).length >= inlistMax){
            util.mylog('inlistMax',inlistMax);
            var minTime = Date.parse(new Date());
            var getKey = 0;
            //获取时间最小值(最早加入清单的时间)
            for(var key in app.globalData.listAddTime){
                if(minTime >= app.globalData.listAddTime[key]){
                    minTime = app.globalData.listAddTime[key];
                    getKey = key;
                }
            }

            util.mylog('getKey',getKey);

            //删除最早加入的清单
            delete this.data.list[getKey]; 
            delete app.globalData.listAddTime[getKey];

            //更新缓存
            wx.setStorageSync('inlist', this.data.list);
            wx.setStorageSync('listAddTime', app.globalData.listAddTime);

            //更新当前清单
            this.data.currentSubList = this.data.list[this.data.code] === undefined 
                                        || this.data.list[this.data.code] === [] 
                                        ? [] : this.data.list[this.data.code];
        }

        // 获取清单条数
        this.setData({
            itemNum:this.data.currentSubList.length            
        })

        hasLoad = false;
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