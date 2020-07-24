// miniprogram/pages/login/login.js
import {
  UserModel
} from '../../models/user.js'
const userModel = new UserModel()
const app = getApp()
Page({
  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      userModel.updateUserInfo(e.detail.userInfo).then(res => {
        app.globalData.userInfo = res.data
        app.globalData.isAdmin = res.data.isAdmin
        let pages = getCurrentPages(); // 获取页面栈
        let currPage = pages[pages.length - 1]; // 当前页面
        let prevPage = pages[pages.length - 2]; // 上一个页面
        prevPage.setData({
          userInfo: res.data,
          isAdmin: app.globalData.isAdmin
        })
        wx.hideLoading()
        wx.navigateBack({
          delta: 1
        })
      })
    }
  },
  exit: function() {
    wx.navigateBack({
      delta: 1
    })
  }
})