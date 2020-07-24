Component({

  properties: {
    articleData: Object
  },
  data: {
    txtHidden: true,
    showArrow: false
  },
  methods: {
    txtToggle: function() {
      let that = this;
      that.setData({
        txtHidden: !that.data.txtHidden
      })
    }
  },
  attached() { // 生命周期函数执行代码
    let that = this;
    if (that.data.articleData.introduce.length > 100) {
      that.setData({
        showArrow: true
      })
    }
  }
})