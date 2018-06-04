// pages/stockrecord/stockrecord.js
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

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
        tabs: ["入库", "出入库", "出库"],
        activeIndex: '1',
        sliderOffset: 0,
        sliderLeft: 0,
        record:[],
        hasGot:false,
        inRecord:[],
        outRecord:[],
        flash:false,
        code:'',
        stock_id:0
    },
    onLoad: function(options) {
        util.mylog(options)
        this.setData({
            code:options.code,
            stock_id:options.stock_id
        })
        //显示加载动画
        wx.showNavigationBarLoading();

        //动态设置当前页面的标题 zjh
        wx.setNavigationBarTitle({
          title: this.data.code+' 操作记录'
        })

        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 4,
                    sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
                });
            }
        });

        // 获取操作记录
        this.getRecord();
    },
    tabClick: function(e) {
        util.mylog(e);
        this.data.activeIndex = e.currentTarget.id
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id,
            hasGot:false
        });

        // 获取操作记录
        this.getRecord();
    },


    /**
     * 获取操作记录
     * @return  {[type]}  [description]
     */
    getRecord:function(){
        //显示加载动画
        wx.showNavigationBarLoading();

        var that = this;
        
        var url = '';
        util.mylog('activeIndex:',that.data.activeIndex);
        switch(that.data.activeIndex)
        {
            case '0':
                url = '/stocks/logs?type=1&stock_id='+that.data.stock_id;
                if(that.data.inRecord.length != 0 && !that.data.flash){
                    util.mylog('already has inRecord:',that.data.inRecord);
                    //隐藏加载动画
                    wx.hideNavigationBarLoading()
                    that.setData({
                        hasGot:true
                    })
                    return;
                }
                break;
            case '1':
                if(that.data.record.length != 0 && !that.data.flash){
                    util.mylog('already has record:',that.data.record);
                     //隐藏加载动画
                    wx.hideNavigationBarLoading()
                    that.setData({
                        hasGot:true
                    })
                    return;
                }
                url = '/stocks/logs?stock_id='+that.data.stock_id;
                break;
            case '2':
                if(that.data.outRecord.length != 0 && !that.data.flash){
                    util.mylog('already has outRecord:',that.data.outRecord);
                     //隐藏加载动画
                    wx.hideNavigationBarLoading()
                    that.setData({
                        hasGot:true
                    })
                    return;
                }
                url = '/stocks/logs?type=2&stock_id='+that.data.stock_id;
                break;
            default:
                if(that.data.record.length != 0 && !that.data.flash){
                    util.mylog('already has record:',that.data.record);
                     //隐藏加载动画
                    wx.hideNavigationBarLoading()
                    that.setData({
                        hasGot:true
                    })
                    return;
                }
                url = '/stocks/logs?stock_id='+that.data.stock_id;
                break;
        }
        
        util.mylog('current tab : ',url);

        qcloud.request({
            url: config.service.generalUrl+url,
            login: true,
            method:'GET',
            success(result) {
                util.mylog('result Data : ',result);
                var res = result.data;
                //置为非刷新状态
                that.data.flash = false;
                //隐藏加载动画
                wx.hideNavigationBarLoading()
                //停止刷新
                wx.stopPullDownRefresh()
                
                that.setResult(res.data.logs);
            },

            fail(error) {

                //置为非刷新状态
                that.data.flash = false;
                //隐藏加载动画
                wx.hideNavigationBarLoading()
                //停止刷新
                wx.stopPullDownRefresh()

                that.setData({
                    hasGot:true
                })

                // util.showDebugModel('请求失败', error)
            }
        })
    },


    /**
     * 设置结果
     * @param  {[type]}  data  [description]
     */
    setResult:function(data){
        switch(this.data.activeIndex)
        {
            case '0':
                this.setData({
                    inRecord:data,
                    hasGot:true
                });
                break;
            case '1':
                this.setData({
                    record:data,
                    hasGot:true
                });
                break;
            case '2':
                this.setData({
                    outRecord:data,
                    hasGot:true
                });
                break;
            default:
                this.setData({
                    record:data,
                    hasGot:true
                });
        }
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
    onPullDownRefresh: function() {

        //开启刷新
        this.data.flash = true;

        // 获取操作记录
        this.getRecord();
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