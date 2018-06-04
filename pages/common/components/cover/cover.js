// pages/common/components/cover/cover.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {},
    /**
     * 组件的初始数据
     */
    data: {
        // 遮罩显示控制 
        isShow: false,
    },
    /**
     * 组件的方法列表
     */
    methods: {
        //隐藏遮罩 
        hideCover(e) {
            this.setData({
                isShow: !this.data.isShow
            })

            // this.triggerEvent("hideCover", e.detail)
        },
        //展示遮罩
        showCover(e) {
            this.setData({
                isShow: !this.data.isShow
            })

            // this.triggerEvent("showCover", e.detail)
        }
    }
})