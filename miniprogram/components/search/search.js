// components/search/search-cmp.js
import {
  KeywordModel
} from 'keyword.js'
import {
  paginationBev
} from '../behaviors/pagination.js'
import {
  ArticleModel
} from '../../models/article.js'
const articleModel = new ArticleModel()

let keyModel = new KeywordModel()
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  behaviors: [paginationBev],
  properties: {
    more: {
      type: String,
      observer: '_loadMore'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // start:0,
    // count:20,
    historyKeys: [],
    hotKeys: [],
    finished: false,
    q: '',
    loading: false,
    loadingCenter: false
  },

  attached: function() {
    this.setData({
      historyKeys: keyModel.getHistory()
    })
    keyModel.getHot((data) => {
      this.setData({
        hotKeys: data.hot
      })
    })
  },

  /**
   * 组件的方法列表
   * 
   */
  methods: {
    _loadMore: function() {
      if (this.data.loading) {
        return
      }
      if (!this.data.q) {
        return
      }
      let hasMore = this.hasMore()
      if (!hasMore) {
        return
      }
      this.setData({
        loading: true
      })
      articleModel.search({
          keyWord: this.data.q,
          start: this.getCurrentStart()
        }).then(res => {
          this.setMoreData(res)
          this.setData({
            loading: false
          })
        })
        .catch(err => {
          this.setData({
            loading: false
          })
        })
    },

    onCancel: function(event) {
      this.triggerEvent('cancel', {}, {})
    },

    onDelete: function(event) {
      console.log(event)
      this.setData({
        finished: false,
        empty: false,
        q: ''
      })
    },

    onConfirm: function(event) {
      // 首先切换状态，保持客户端流畅
      this.setData({
        finished: true,
        loadingCenter: true,
        empty: false
      })
      // xx
      this.initPagination()
      let q = event.detail.value || event.detail.text
      articleModel.search({
        keyWord: q,
        start: this.getCurrentStart()
      }).then(res => {
        console.log(res)
        if (res.length > 0) {
          keyModel.addToHistory(q)
        }
        this.setMoreData(res)
        this.setData({
          q: q,
          loadingCenter: false
        })
      })
    },

    onView: function(e) {
      let index = e.currentTarget.dataset.index
      app.globalData.cArticle = this.data.dataArray[index]
      wx.navigateTo({
        url: '/pages/articleDetail/articleDetail?mode=1'
      })
    }
  }
})