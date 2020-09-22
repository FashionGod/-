import {
  RichModel
} from '../../models/rich.js'
import {
  CommentModel
} from '../../models/comment.js'
import {
  LikeModel
} from '../../models/like.js'
import {
  CollectModel
} from '../../models/collect.js'
import {
  ArticleModel
} from '../../models/article.js'
const articleModel = new ArticleModel()
const likeModel = new LikeModel()
const collectModel = new CollectModel()
const app = getApp()
let commentModel = new CommentModel()

Page({
  data: {
    isAdmin: false,
    toVeiw: '',
    commentValue: '',
    replyId: '',
    replyName: '',
    commentList: [],
    start: 0,
    more: true,
    loading: false,
    focus: false,
    likeIcon: '/images/icons/good@filling.png',
    disLikeIcon: '/images/icons/good@gray.png',
    collectIcon: '/images/icons/favorites@filling.png',
    disCollectionIcon: '/images/icons/collect@gray.png',
    liked: false,
    collectd: false,
    showAll: false,
    userInfo: null
  },
  onShareAppMessage: function (res) {
    if (this.data.mode == 1) {
      return {
        title: app.globalData.cArticle.title,
        path: '/pages/start/start?articleId=' + app.globalData.cArticle._id,
        imageUrl: this.data.shareImg
      }
    }
  },
  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo,
      isAdmin: app.globalData.isAdmin
    })
    console.log(this.data.userInfo)
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    this.setData({
      mode: options.mode
    })
    if (this.data.mode == 0) {
      let data = app.globalData.cArticle
      const richModel = new RichModel(data)
      richModel.getRichJson().then(res => {
          this.setData({
            nodes: res
          })
          wx.hideLoading()
        })
        .catch(err => {
          wx.showToast({
            title: '发生错误',
            icon: 'none'
          })
          wx.hideLoading()
        })
    } else if (this.data.mode == 1 || this.data.mode == 2) {
      // 正常模式1 分享模式2

      this.setData({
        isAdmin: app.globalData.isAdmin,
        showAll: true
      })
      let p
      if (this.data.mode == 1) {
        let data = app.globalData.cArticle.json
        const richModel = new RichModel(data)
        p = richModel.getRichJson().then(res => {
          this.setData({
            nodes: res
          })
        })
      } else {
        p = articleModel.getOneArticle(options.articleId)
          .then(res => {
            app.globalData.cArticle = res
            console.log(res)
            let data = app.globalData.cArticle.json
            const richModel = new RichModel(data)
            richModel.getRichJson().then(res => {
              this.setData({
                nodes: res
              })
            })
          })
      }
      p.then(res => {
          let p1 = likeModel.getLiked({
            articleId: app.globalData.cArticle._id,
            likeId: app.globalData.cArticle._id,
            type: 1
          })
          let p2 = collectModel.getCollectd({
            articleId: app.globalData.cArticle._id
          })
          return Promise.all([p1, p2])
        })
        .then(res => {
          this.setData({
            liked: res[0],
            collectd: res[1]
          })
          return this.initShareImg()
        })
        .then(res => {
          this.loadMore({
            init: true
          })
          wx.hideLoading()
        })
        .catch(err => {
          console.log(err)
          wx.showToast({
            title: '发生错误',
            icon: 'none'
          })
          wx.hideLoading()
        })

    }
  },
  onUnload() {
    if (this.data.mode == 2) {
      app.globalData.shareBack = true
    }
  },
  onShow: function () {
    this.setData({
      userInfo: app.globalData.userInfo,
      isAdmin: app.globalData.isAdmin
    })
  },
  initShareImg() {
    return new Promise(resolve => {
      if (app.globalData.cArticle.imgUrls.length > 0) {
        resolve(wx.cloud.downloadFile({
          fileID: app.globalData.cArticle.imgUrls[0]
        }).then(res => {
          // get temp file path
          this.data.shareImg = res.tempFilePath

          console.log(res.tempFilePath)
        }))
      } else {
        resolve(null)
      }
    })
  },
  bindinput: function (e) {
    this.setData({
      commentValue: e.detail.value
    })
  },
  onReplySb: function (e) {
    if (!this.data.userInfo) {
      return
    }
    this.setData({
      // toView: 'c' + e.currentTarget.dataset.replyid,
      replyId: e.currentTarget.dataset.replyid,
      replyName: e.currentTarget.dataset.replyname,
      focus: true
    })
    console.log(this.data.toView)

  },
  onCancleReplySb: function (e) {
    this.setData({
      replyId: '',
      replyName: ''
    })
  },
  onSubmitComment: function (e) {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '需要登录才可以评论',
        icon: 'none'
      })
      return;
    }
    if (!this.data.commentValue) {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let article = app.globalData.cArticle
    console.log(article)
    let p = null
    let commentList = this.data.commentList
    if (this.data.replyId) {
      // 回复某人
      p = commentModel.addComment({
        type: 2,
        articleId: article._id,
        commentId: this.data.replyId,
        content: this.data.commentValue
      })
    } else {
      // 评论文章
      p = commentModel.addComment({
        type: 1,
        articleId: article._id,
        content: this.data.commentValue
      })
    }

    p.then(res => {
        if (res.result.success != true) {
          wx.showToast({
            title: res.result.err,
            icon: 'none'
          })
        } else {
          this.loadMore({
            init: true
          }).then(res => {
            this.onCancleReplySb()
            this.setData({
              commentValue: ''
            })
            wx.showToast({
              title: '评论成功'
            })
          })
        }

      })
  },
  onLpwer: function (e) {
    if (this.data.mode == 1) {
      this.loadMore({
        init: false
      })
    }
  },
  loadMore: function ({
    init = false
  }) {
    if (this.data.loading) {
      return
    }
    if (init) {
      this.data.start = 0
      this.data.more = true
    }
    if (!this.data.more) {
      return
    }
    this.setData({
      loading: true
    })
    return commentModel.getComment({
        articleId: app.globalData.cArticle._id,
        start: this.data.start
      })
      .then(res => {
        console.log(res)
        let commentList = this.data.commentList.concat(res)
        if (init) {
          commentList = res
        }
        console.log(commentList)
        this.setData({
          commentList: commentList,
          start: commentList.length,
          more: res.length == 20 ? true : false,
          loading: false
        })
      })
      .catch(err => {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
        console.log(err)
        this.setData({
          loading: false
        })

      })
  },
  onDeleteComment: function (e) {
    let index = e.currentTarget.dataset.index
    let replyindex = e.currentTarget.dataset.replyindex
    let content
    let type
    if (replyindex == null) {
      content = this.data.commentList[index].content
      type = 1
    } else {
      content = this.data.commentList[index].replyList[replyindex].content
      type = 2
    }
    wx.showModal({
      title: '删除',
      content: '真的要删除 ' + content + ' 吗?',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          commentModel.deleteComment({
              type: type,
              _id: e.currentTarget.dataset.id,
              articleId: app.globalData.cArticle._id
            }).then(res => {
              return this.loadMore({
                init: true
              })
            })
            .then(res => {
              wx.showToast({
                title: '删除成功'
              })
            })
            .catch(err => {
              console.log(err)
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            })
        }
      }
    })

  },
  onLikeComment(e) {
    let index = e.currentTarget.dataset.index
    let replyindex = e.currentTarget.dataset.replyindex
    let likeId
    let commentList = this.data.commentList
    let liked
    if (replyindex == null) {
      likeId = commentList[index]._id
      commentList[index].liked = !commentList[index].liked
      if (commentList[index].liked) {
        commentList[index].likeCount += 1
        liked = true
      } else {
        commentList[index].likeCount -= 1
        liked = false
      }
    } else {
      likeId = commentList[index].replyList[replyindex]._id
      commentList[index].replyList[replyindex].liked = !commentList[index].replyList[replyindex].liked
      if (commentList[index].replyList[replyindex].liked) {
        commentList[index].replyList[replyindex].likeCount += 1
        liked = true
      } else {
        commentList[index].replyList[replyindex].likeCount -= 1
        liked = false
      }
    }
    this.setData({
      commentList: commentList
    })
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (liked) {
      // 点赞
      likeModel.addLike({
        articleId: app.globalData.cArticle._id,
        likeId: likeId,
        type: 2
      }).then(res => {
        console.log(res)
        wx.hideLoading()
      }).catch(err => {
        wx.showToast({
          title: '点赞失败',
          icon: 'none'
        })
      })
    } else {
      // 取消点赞
      likeModel.deleteLike({
        articleId: app.globalData.cArticle._id,
        likeId: likeId,
        type: 2
      }).then(res => {
        console.log(res)
        wx.hideLoading()
      }).catch(err => {
        wx.showToast({
          title: '点赞失败',
          icon: 'none'
        })
      })
    }

  },
  onLikeArticle(e) {
    let liked = this.data.liked
    liked = !liked
    this.setData({
      liked: liked
    })
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (liked) {
      likeModel.addLike({
        articleId: app.globalData.cArticle._id,
        likeId: app.globalData.cArticle._id,
        type: 1
      }).then(res => {
        console.log(res)
        wx.hideLoading()
      }).catch(err => {
        wx.showToast({
          title: '点赞失败',
          icon: 'none'
        })
      })
    } else {
      likeModel.deleteLike({
        articleId: app.globalData.cArticle._id,
        likeId: app.globalData.cArticle._id,
        type: 1
      }).then(res => {
        console.log(res)
        wx.hideLoading()
      }).catch(err => {
        wx.showToast({
          title: '点赞失败',
          icon: 'none'
        })
      })
    }
  },
  onCollect(e) {
    let collectd = this.data.collectd
    collectd = !collectd
    this.setData({
      collectd: collectd
    })
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (collectd) {
      collectModel.addCollect({
        articleId: app.globalData.cArticle._id
      }).then(res => {
        console.log(res)
        wx.hideLoading()
      }).catch(err => {
        wx.showToast({
          title: '收藏失败',
          icon: 'none'
        })
      })
    } else {
      collectModel.deleteCollect({
        articleId: app.globalData.cArticle._id
      }).then(res => {
        console.log(res)
        wx.hideLoading()
      }).catch(err => {
        wx.showToast({
          title: '收藏失败',
          icon: 'none'
        })
      })
    }
  }
})