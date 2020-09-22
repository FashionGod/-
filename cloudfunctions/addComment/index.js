// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  // 内容安全监测
  let res = await cloud.openapi.security.msgSecCheck({
    content: event.content
  })
  if (res != 0) {
    return handleErr('含有敏感内容,无法发布')
  }

  return db.collection('comment').add({
      data: {
        _openid: wxContext.OPENID,
        type: event.type,
        articleId: event.articleId,
        commentId: event.commentId,
        content: event.content,
        likeCount: 0,
        read: 0,
        createTime: db.serverDate()
      }
    })
    .then(res => {
      return db.collection('article').doc(event.articleId).update({
        data: {
          commentCount: _.inc(1)
        }
      })
    })
    .then(res => {
      return handleSuccess(res)
    }).catch(err => {
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