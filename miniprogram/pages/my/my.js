// miniprogram/pages/my/my.js
const app = getApp()
import {
  CollectModel
} from '../../models/collect.js'

import {
  UserModel
} from '../../models/user.js'

const collectModel = new CollectModel()
const userModel = new UserModel()

Page({
  data: {
    isAdmin: false,
    remind: '加载中',
    userInfo: null
  },
  onLoad: function () {
    console.log(app.globalData.userInfo)
    this.setData({
      userInfo: app.globalData.userInfo,
      isAdmin: app.globalData.isAdmin,
    })
    console.log(!this.data.userInfo)

    // this.getunReadcomNum()
  },
  onReady: function () {
    setTimeout(() => {
      this.setData({
        remind: ''
      })
    }, 0)
  },

  onShow: function () {
    console.log('11111');
    this.setData({
      userInfo: app.globalData.userInfo,
      isAdmin: app.globalData.isAdmin
    })
    // this.getunReadcomNum();

  },
  onClick: function (e) {
    let index = parseInt(e.currentTarget.dataset.index)
    switch (index) {
      case 1:
        console.log(index)
        wx.navigateTo({
          url: '/pages/collect/collect'
        })
        break
      case 2:
        console.log(index)
        wx.navigateTo({
          url: '/pages/comment/comment'
        })
        break
      case 3:
        console.log(index)
        wx.navigateTo({
          url: '/pages/subjectHistory/subjectHistory'
        })
        break
      case 4:
        console.log(index)
        wx.navigateTo({
          url: '/pages/feedback/feedback'
        })
        break
      case 5:
        console.log(index)
        wx.navigateTo({
          url: '/pages/admin/function/function'
        })
        break
      case 6:
        console.log(index)
        wx.navigateTo({
          url: '/pages/about/about'
        })
        break
    }
  },

  getunReadcomNum: function (e) {
    wx.cloud.callFunction({
      name: 'getunReadcomNum',
      data: {}
    }).then(res => {
      console.log(res)
      var newcomments = res.result.comments.reverse()
      // this.setData({
      // comments: newcomments,
      // })
      let childcomments = []
      newcomments.forEach((item) => {
        if (item.children) {
          // console.log(item.children)
          item.children.forEach((v) => {
            if (v.nickName != item.nickName) {
              let time = new Date(v.createTime).getTime()
              v.time = time
              v.articledetail = item.articledetail
              let farther2 = {}
              v.farther = {}
              farther2.nickName = item.nickName
              farther2.content = item.content
              farther2.avatarUrl = item.avatarUrl
              v.farther = farther2
              v.farthernickName = item.nickName
              newcomments.push(v)
            }
          })
        }
        let time = new Date(item.createTime).getTime()
        item.time = time
      })
      return newcomments
    }).then(res => {
      // console.log(res)
      let allcomments = res
      // console.log(allcomments)
      //对newcomments进行冒泡排序
      let newcomments = allcomments
      for (let i = 0; i < newcomments.length - 1; i++) {
        for (let j = 0; j < newcomments.length - 1 - i; j++) {
          // 判断左边和右边时间戳哪个大，左边比右边小意味着 右边的更新 要交换
          if (newcomments[j].time < newcomments[j + 1].time) {
            console.log('change')
            let temp
            temp = newcomments[j]
            newcomments[j] = newcomments[j + 1]
            newcomments[j + 1] = temp
          }
        }
      }
      return newcomments
    }).then(res => {
      let allcomment = res
      console.log(res)
      let that = this
      //顺便查未读数
      let unReadNum = 0
      allcomment.forEach((item) => {
        item.createTime = item.createTime.substring(0, 10);
        if (item.farther != '' && item.read == 0 && item._openid != app.globalData.userInfo._id) {
          unReadNum++
        }
      })
      var timeout = setTimeout(function () {
        that.setData({
          unReadNum: unReadNum
        })
      }, 200)
    })
  },

  login: function () {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  }


})