const app = getApp()
Page({

  data: {},

  onLoad: function(options) {

  },


  onShow: function() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    this.getComment()

  },


  delete: function(e) {
    let type = e.currentTarget.dataset.type
    let index = e.currentTarget.dataset.index
    let comments = this.data.comments
    if (type == 1) {
      var commentId = comments[index]._id
      var content = comments[index].content
    } else if (type == 2) {
      let cIndex = e.currentTarget.dataset.cindex
      var commentId = comments[index].children[cIndex]._id
      var content = comments[index].children[cIndex].content
    }
    wx.showModal({
      title: '删除',
      content: '确认删除' + content + '吗?',
      success: (res) => {
        if (res.confirm) {
          // 清空回复状态
          this.setData({
            releaseFocus: false,
            releaseName: "",
            commentText: ""
          })
          wx.showLoading({
            title: '加载中...',
          })
          wx.cloud.callFunction({
            name: 'deleteComment',
            data: {
              commentId: commentId
            }
          }).then(res => {
            wx.hideLoading()
            wx.showToast({
              title: '删除成功',
            })
            this.getComment()
          }).catch(err => {
            wx.hideLoading()
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          })
        }
      }
    })
  },


  getComment: function(e) {
    wx.cloud.callFunction({
      name: 'getMyComment',
      data: {}
    }).then(res => {

      console.log(res)
      var newcomments = res.result.comments.reverse()
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
              v.articleTitle = item.articleTitle
              newcomments.push(v)
            }
          })
        }
        let time = new Date(item.createTime).getTime()
        item.time = time
      })
      return newcomments
    }).catch(err => {
      wx.showToast({
          title: '加载失败',
          icon: 'none'
        }),
        wx.hideLoading()
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
      allcomment.forEach((item) => {
        item.createTime = item.createTime.substring(0, 10);
      })
      var timeout = setTimeout(function() {
        that.setData({
          comments: allcomment,
        })
      }, 200)
      wx.hideLoading()
    })

  },

  articleDetail: function(e) {
    wx.showLoading({
      title: '加载中',
    })
    let index = e.currentTarget.dataset.index
    wx.cloud.callFunction({
      name: 'getOneArticle',
      data: {
        articleId: this.data.comments[index].articleId
      }
    }).then(res => {
      app.globalData.cArticle = res.result.data
      console.log(res.result.data)
      wx.navigateTo({
        url: '../articleDetail/articleDetail?mode=1'
      })
      }).catch(err => {
        console.log(err)
      })
  },

})