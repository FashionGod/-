// miniprogram/pages/admin/addArticle/addArticle.js
import {
  RichModel
} from '../../../models/rich.js'
import {
  AdminModel
} from '../../../models/admin.js'
const adminModel = new AdminModel()
const FileSystemManager = wx.getFileSystemManager()
const app = getApp()
let richModel
Page({
  data: {
    title: null,
    introduce: null,
    keyword: null,
    article: null
  },
  onUpdate: function() {

    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.scanCode({
      success: (res) => {
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        wx.downloadFile({
          url: res.result,
          success: (res) => {
            if (res.statusCode == 200) {
              let raw = FileSystemManager.readFileSync(res.tempFilePath, "utf8")
              try {
                let data = JSON.parse(raw)
                richModel = new RichModel(data)
                let title = richModel.getTitle()
                let introduce = richModel.getIntroduce()
                let keyword = richModel.getKeyword()
                let article = richModel.getRawJson()
                if (title) {
                  this.setData({
                    title: title
                  })
                }
                if (introduce) {
                  this.setData({
                    introduce: introduce
                  })
                }
                if (keyword) {
                  this.setData({
                    keyword: keyword
                  })
                }
                this.setData({
                  article: article
                })
                wx.showModal({
                  title: '下载成功',
                  content: '是否立即预览文章',
                  success: (res) => {
                    if (res.confirm) {
                      this.onView()
                    }
                  }
                })
              } catch (e) {
                console.log(e)
                wx.showModal({
                  title: '错误',
                  content: raw,
                  showCancel: false
                })
              }
            } else {
              wx.showModal({
                title: '错误',
                content: '下载失败,请重试',
                showCancel: false
              })
            }
            wx.hideLoading()
          },
          fail: (res) => {
            wx.hideLoading()
            wx.showModal({
              title: '错误',
              content: '下载失败,请重试',
              showCancel: false
            })
          }
        })
      },
      complete: (res) => {
        wx.hideLoading()
      }
    })
  },
  onView: function() {
    app.globalData.cArticle = this.data.article
    wx.navigateTo({
      url: '/pages/articleDetail/articleDetail?mode=0'
    })
  },
  onDelete: function() {
    wx.showModal({
      title: '提示',
      content: '确定要删除吗?',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            article: null
          })
        }
      }
    })

  },
  bindFormSubmit: function(e) {
    console.log(e)
    let title = e.detail.value.title
    let introduce = e.detail.value.introduce
    let keyword = e.detail.value.keyword
    if (!title) {
      wx.showModal({
        title: '提示',
        content: '请先填写标题',
        showCancel: false
      })
      return
    } else if (!introduce) {
      wx.showModal({
        title: '提示',
        content: '请先填写介绍',
        showCancel: false
      })
      return
    } else if (!keyword) {
      wx.showModal({
        title: '提示',
        content: '请先填写关键字',
        showCancel: false
      })
      return
    } else if (!this.data.article) {
      wx.showModal({
        title: '提示',
        content: '请先上传文章',
        showCancel: false
      })
      return
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    richModel.getCloudJson().then(res => {
      adminModel.addArticle({
        title: title,
        introduce: introduce,
        keyword: keyword,
        imgUrls: richModel.getImgUrls(),
        json: res
      }).then(res => {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '上传成功',
          showCancel: false,
          success: (res) => {
            wx.navigateBack({
              delta: 1
            })
          }
        })
      }).catch(err => {
        wx.showModal({
          title: '错误',
          content: '上传失败',
          showCancel: false,
        })
      })
    })
  }
})