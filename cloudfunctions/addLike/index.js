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
  return db.collection('like').add({
      data: {
        _openid: wxContext.OPENID,
        type: event.type,
        articleId: event.articleId,
        likeId: event.likeId
      }
    })
    .then(res => {
      if (event.type == 1) {
        // 点赞文章
        return db.collection('article').doc(event.articleId).update({
          data: {
            likeCount: _.inc(1)
          }
        })
      } else if (event.type == 2) {
        // 点赞评论
        return db.collection('comment').doc(event.likeId).update({
          data: {
            likeCount: _.inc(1)
          }
        })
      }
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