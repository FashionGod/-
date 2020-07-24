const app = getApp()
import {
  CollectModel
} from '../../models/collect.js'


const collectModel = new CollectModel()

Page({
  data: {
    collectList: []
  },
  onLoad: function() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    collectModel.getCollect()
      .then(res => {
        console.log(res)
        this.setData({
          collectList: res
        })
        wx.hideLoading()
      }).catch(err => {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
        wx.hideLoading()
      })
  },
  articleDetail: function(e) {
    let index = e.currentTarget.dataset.index
    app.globalData.cArticle = this.data.collectList[index]
    wx.navigateTo({
      url: '../articleDetail/articleDetail?mode=1'
    })
  }
})