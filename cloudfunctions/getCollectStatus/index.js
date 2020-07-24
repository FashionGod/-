// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  return db.collection('collect').where({
      _openid: wxContext.OPENID,
      articleId: event.articleId
    }).count()
    .then(res => {
      if (res.total > 0) {
        return handleSuccess({
          collectd: true
        })
      } else {
        return handleSuccess({
          collectd: false
        })
      }
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