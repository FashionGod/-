// miniprogram/pages/start/start.js
import {
  UserModel
} from '../../models/user.js'
const userModel = new UserModel()
const app = getApp()
Page({
  data: {
    remind: '加载中'
  },
  onLoad: function(options) {
    app.globalData.shareBack = false
    wx.setNavigationBarTitle({
      title: ''
    })
    new Promise(resolve => {
        wx.getUserInfo({
          success: (res) => {
            console.log(res)
            // return res.userInfo
            resolve(res.userInfo)
          },
          complete: (res) => {
            // return null
            resolve(null)
          }
        })
      }).then(res => {
        console.log(res)
        if (res) {
          return userModel.updateUserInfo(res).then(res => {
            app.globalData.userInfo = res.data
            app.globalData.isAdmin = res.data.isAdmin
          })
        }
      })
      .then(res => {
        if (options.articleId) {
          // 分享进入小程序
          wx.navigateTo({
            url: '/pages/articleDetail/articleDetail?mode=2&articleId=' + options.articleId
          })
        } else {
          app.globalData.shareBack = true
        }
        this.onShow()
      })
  },
  onShow: function() {
    if (app.globalData.shareBack == true) {
      let frist = wx.getStorageSync('frist')
      if (!frist) {
        // 第一次进入小程序
        setTimeout(() => {
          this.setData({
            remind: ''
          })
        }, 2000)
      } else {
        this.enter()
      }
    }
  },
  enter: function() {
    console.log('用户点击进入')
    wx.setStorageSync('frist', true)
    wx.switchTab({
      url: '/pages/article/article'
    })
    // console.log('userInfo', userInfo)
    // app.globalData.userInfo = userInfo

    // userModel.updateUserInfo(userInfo)
    //   .then(res => {
    //     app.globalData.openId = res.data._id
    //     app.globalData.isAdmin = res.data.isAdmin
    //     wx.switchTab({
    //       url: '/pages/article/article'
    //     })
    //   })
    //   .catch(err => {
    //     console.error(err)
    //     wx.showToast({
    //       title: '服务器错误,请重试',
    //       icon: 'none'
    //     })
    //     this.setData({
    //       remind: ''
    //     })
    //   })
  }
})