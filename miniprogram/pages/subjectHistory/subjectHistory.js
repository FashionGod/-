// pages/history/history.js
const app = getApp()
import {
  SubjectModel
} from '../../models/subject.js'
const subjectModel = new SubjectModel()

Page({

  data: {
    record: []
  },
  onLoad: function(options) {
    // 获取用户做题记录数组
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    subjectModel.getHistory().then(res => {
        console.log('getHistory', res)
        this.setData({
          record: res
        })
        wx.hideLoading()
      })
      .catch(err => {
        console.error(err)
        wx.hideLoading()
      })
  },
  showRecord: function (e) {
    app.globalData.subjectList = this.data.record[e.currentTarget.dataset.index].subject
    console.log(app.globalData.subjectList)
    wx.navigateTo({
      url: '../function/practice/practice?num=0'
    })
  },
  onUnload:function(){
    
  }
})