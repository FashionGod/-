// miniprogram/pages/article/article.js
import {
  ArticleModel
} from '../../models/article.js'
const articleModel = new ArticleModel()

import {
  AdminModel
} from '../../models/admin.js'
const adminModel = new AdminModel()
const app = getApp()
Page({
  data: {
    searchPanel: false,
    more: false,
    isAdmin: false,
    currentIndex: 0,
    start: 0,
    articles: [],
    hotArticleList: [],
    more: true,
    searchMore: false,
    loading: false,
    showEnd: false,
    articleIds: []
  },
  onLoad: function() {

    this.setData({
      isAdmin: app.globalData.isAdmin
    })
    this.loadMore({
      init: true
    })
    articleModel.getHotArticle().then(res => {
        console.log('hotArticleList', res)
        this.setData({
          hotArticleList: res
        })
      })
      .catch(err => {
        console.log(err)
      })
  },
  onReachBottom: function() {
    if (!this.data.searchPanel) {
      if (!this.data.more) {
        this.setData({
          showEnd: true
        })
        setTimeout(() => {
          this.setData({
            showEnd: false
          })
        }, 1000)
      }
      this.loadMore({
        init: false
      })
    } else {
      console.log('ss')
      this.setData({
        searchMore: !this.data.searchMore
      })
    }
  },
  onPullDownRefresh: function() {
    if (!this.data.searchPanel) {
      this.loadMore({
          init: true
        })
        .then(res => {
          wx.showToast({
            title: '刷新成功'
          })
          wx.stopPullDownRefresh()
        })
      articleModel.getHotArticle().then(res => {
        this.setData({
          hotArticleList: res
        })
      }).catch(err => {
        console.error('getHotArticle', err)
      })
    } else {
      wx.stopPullDownRefresh()
    }
  },
  onShow: function() {
    this.setData({
      isAdmin: app.globalData.isAdmin
    })
  },
  onView: function(e) {
    // wx.navigateTo({
    //   url: '/pages/articleDetail/articleDetail?mode=2&articleId=25c59b425d37bb960133c8515f4a04b1'
    // })
    // return

    let index = e.currentTarget.dataset.index
    app.globalData.cArticle = this.data.articles[index]
    wx.navigateTo({
      url: '/pages/articleDetail/articleDetail?mode=1'
    })
  },
  loadMore: function({
    init
  }) {
    if (this.data.loading) {
      return
    }
    let p
    if (init) {
      p = articleModel.getAllArticleId()
        .then(res => {
          this.data.start = 0
          this.data.more = true
          this.data.articleIds = this.shuffle(res)
        })
    } else {
      p = new Promise(resolve => {
        resolve()
      })
    }
    if (!this.data.more) {
      return
    }
    this.setData({
      loading: true
    })
    return p.then(res => {
      return articleModel.getArticleInIds(this.getArticleId(this.data.start))
        .then(res => {
          res.forEach(v => {
            v.imgUrls = v.imgUrls.slice(0, 1)
          })
          let articles = this.data.articles.concat(res)
          if (init) {
            articles = res
          }
          this.setData({
            articles: articles,
            start: articles.length,
            more: res.length == 5 ? true : false
          })
          this.setData({
            loading: false
          })
        })
        .catch(err => {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
          this.setData({
            loading: false
          })
        })
    })
  },
  shuffle: function(arr) {
    var length = arr.length,
      randomIndex,
      temp;
    while (length) {
      randomIndex = Math.floor(Math.random() * (length--));
      temp = arr[randomIndex];
      arr[randomIndex] = arr[length];
      arr[length] = temp
    }
    return arr;
  },
  getArticleId: function(start) {
    return this.data.articleIds.slice(start, start + 5)
  },
  handleChange: function(e) {
    this.setData({
      currentIndex: e.detail.current
    })
  },
  onDeleteArticle: function(e) {
    let index = e.currentTarget.dataset.index
    let title = this.data.articles[index].title
    let articleId = this.data.articles[index]._id
    wx.showModal({
      title: '删除',
      content: '确认删除 ' + title + ' 吗?',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中...'
          })
          adminModel.deleteArticle({
              articleId: articleId
            }).then(res => {
              console.log(res)
              wx.showToast({
                title: '删除成功'
              })
              this.loadMore({
                init: true
              })
            })
            .catch(err => {
              console.log(err)
              wx.showToast({
                title: '删除失败',
                icon: 'node'
              })
            })
        }
      }
    })
  },
  onActivateSearch: function(e) {
    this.setData({
      searchPanel: true
    })
  },
  onCancel: function(event) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
    setTimeout(() => {
      this.setData({
        searchPanel: false
      })
    }, 100)
  },
  onViewHot: function(e) {
    let index = e.currentTarget.dataset.index
    app.globalData.cArticle = this.data.hotArticleList[index]
    wx.navigateTo({
      url: '/pages/articleDetail/articleDetail?mode=1'
    })
  }
})