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
  return db.collection('collect')
    .add({
      data: {
        _openid: wxContext.OPENID,
        articleId: event.articleId
      }
    })
    .then(res => {
      return db.collection('article').doc(event.articleId).update({
        data: {
          collectCount: _.inc(1)
        }
      })
    })
    .then(res => {
      return handleSuccess(res)
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