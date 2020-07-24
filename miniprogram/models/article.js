const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate

class ArticleModel {

  getOneArticle(articleId) {
    return wx.cloud.callFunction({
        name: 'getOneArticle',
        data: {
          articleId: articleId
        }
      }).then(res => {
        console.log(res)
        return res.result.data
      })
      .catch(err => {
        console.error(err)
      })
  }
  getArticleInIds(articleIds) {
    return wx.cloud.callFunction({
        name: 'getArticleInIds',
        data: {
          articleIds: articleIds
        }
      }).then(res => {
        console.log(res)
        return res.result.data
      })
      .catch(err => {
        console.error(err)
      })
  }
  getAllArticleId() {
    return wx.cloud.callFunction({
        name: 'getAllArticleId'
      }).then(res => {
        return res.result.data
      })
      .catch(err => {
        console.error(err)
      })
  }
  getArticle(start) {
    return wx.cloud.callFunction({
        name: 'getArticle',
        data: {
          start: start
        }
      }).then(res => {
        return res.result.data
      })
      .catch(err => {
        console.error(err)
      })
  }
  search({
    keyWord,
    start
  }) {
    return wx.cloud.callFunction({
        name: 'searchArticle',
        data: {
          keyWord: keyWord,
          start: start
        }
      }).then(res => {
        return res.result.data
      })
      .catch(err => {
        console.error(err)
      })

    let re = db.RegExp({
      regexp: '.*' + keyWord + '.*'
    })
  }
  getHotArticle() {
    return wx.cloud.callFunction({
        name: 'getHotArticle'
      }).then(res => {
        return res.result.data
      })
      .catch(err => {
        console.error(err)
      })
  }
}
export {
  ArticleModel
}