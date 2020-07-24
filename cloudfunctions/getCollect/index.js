// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  return db.collection('collect').where({
      _openid: wxContext.OPENID
    }).get()
    .then(res => {
      let ids = []
      res.data.forEach(v => {
        ids.push(v.articleId)
      })
      return db.collection('article').where({
        _id: _.in(ids)
      }).get()
    })
    .then(res => {
      return handleSuccess(res.data)
    })
    .catch(err => {
      return handleErr(err)
    })
}

function handleSuccess(data = {}) {
  return {
    success: true,
    data: data
  }
}

function handleErr(err) {
  return {
    success: false,
    err: err
  }
}