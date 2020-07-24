const db = wx.cloud.database()
const _ = db.command
class CollectModel {
  addCollect({
    articleId
  }) {
    return wx.cloud.callFunction({
        name: 'addCollect',
        data: {
          articleId: articleId
        }
      }).then(res => {
        return res.result
      })
      .catch(err => {
        console.log(err)
      })
  }

  deleteCollect({
    articleId
  }) {
    console.log(articleId)
    return wx.cloud.callFunction({
        name: 'deleteCollect',
        data: {
          articleId: articleId
        }
      }).then(res => {
        return res.result
      })
      .catch(err => {
        console.log(err)
      })
  }

  getCollectd({
    articleId
  }) {
    return wx.cloud.callFunction({
        name: 'getCollectStatus',
        data: {
          articleId: articleId
        }
      }).then(res => {
        console.log(res)
        return res.result.data.collectd
      })
      .catch(err => {
        console.error('getCollectd', err)
      })
  }

  getCollect() {
    return wx.cloud.callFunction({
        name: 'getCollect'
      }).then(res => {
        console.log('getCollect', res)
        return res.result.data
      })
      .catch(err => {
        console.error(err)
      })
  }
}
export {
  CollectModel
}