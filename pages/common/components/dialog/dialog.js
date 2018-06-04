// pages/common/components/dialog/dialog.js
Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持 
    },
    /**
     * 组件的属性列表
     */
    properties: {
        // 弹窗标题 
        title: {
            // 属性名 
            type: String,
            // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型） 
            value: '标题' // 属性初始值（可选），如果未指定则会根据类型选择一个 
        },
        // 弹窗内容 
        content: {
            type: Array,
            value: [
                {
                    image:'in.png',
                    content:'红色 , XL , 3 件'
                },

            ]
        },
        // 弹窗取消按钮文字 
        cancelText: {
            type: String,
            value: '取消'
        },
        // 弹窗确认按钮文字 
        confirmText: {
            type: String,
            value: '确定'
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        // 弹窗显示控制 
        isShow: false,

        //外部数据
        outerData:{}
    },
    /**
     * 组件的方法列表
     */
    methods: {
        /* * 公有方法 */
        //隐藏弹框 
        hideDialog() {
            this.setData({
                isShow: !this.data.isShow
            })
        },
        //展示弹框
        showDialog(data) {
            this.setData({
                isShow: !this.data.isShow
            })

            this.data.outerData  = data;
        },
        /* * 内部私有方法建议以下划线开头 * triggerEvent 用于触发事件 */
        _cancelEvent(e) {
            //触发取消回调
            console.log('inner cancel',e);
            this.triggerEvent("cancelEvent",e.detail)
        },
        _confirmEvent(e) { 
            //触发成功回调 
            console.log('inner confirm',e);
            this.triggerEvent("confirmEvent",this.data.outerData); 
        }
    }
})