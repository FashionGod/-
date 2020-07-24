// pages/admin/function/function.js
import {
  AdminModel
} from '../../../models/admin.js'
const adminModel = new AdminModel()
const app = getApp()

Page({

  onClick: function(e) {
    let index = parseInt(e.currentTarget.dataset.index)
    switch (index) {
      case 1:
        console.log(index)
        wx.navigateTo({
          url: '../showFeedBack/showFeedBack'
        })
        break
      case 2:
        console.log(index)
        wx.navigateTo({
          url: '../addArticle/addArticle'
        })
        break
      case 3:
        console.log(index)
        wx.showLoading({
          title: '校准中 请耐心等待',
          mask: true
        })
        let that = this
        adminModel.adjustingArticle().then(res => {
            that.setData({
              res: res
            })
            console.log(res)
            if (res != '') {
              wx.showToast({
                title: '校准成功',
              })
            } else {
              wx.showToast({
                title: '校准失败',
              })
            }

            wx.hideLoading()
          })
          .catch(err => {
            console.error(err)
            wx.showToast({
              title: '校准失败',
            })
           
          })

        break

    }
  }
})