// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  return db.collection('like').where({
      articleId: event.articleId,
      likeId: event.likeId,
      type: event.type,
      _openid: wxContext.OPENID
    }).count()
    .then(res => {
      if (res.total > 0) {
        return handleSuccess({
          liked: true
        })
      } else {
        return handleSuccess({
          liked: false
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