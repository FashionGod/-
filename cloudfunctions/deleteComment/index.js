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
  if (event.type == 2) {
    // 子评论
    return db.collection('comment').doc(event._id).remove()
      .then(res => {
        return db.collection('article').doc(event.articleId).update({
          data: {
            commentCount: _.inc(-1)
          }
        })
      })
      .then(res => {
        return db.collection('like').where({
          likeId: event._id
        }).remove()
      })
  } else if (event.type == 1) {
    // 大评论
    return db.collection('comment').doc(event._id).remove()
      .then(res => {
        console.log(res)
        let ids = []
        ids.push(event._id)
        return db.collection('comment').where({
            type: 2,
            articleId: event.articleId,
            commentId: event._id
          }).get()
          .then(res => {
            console.log(res)
            res.data.forEach(v => {
              ids.push(v._id)
            })
          })
          .then(() => {
            return db.collection('comment').where({
              _id: _.in(ids)
            }).remove()
          })
          .then((res) => {
            console.log(res)
            return ids
          })
      })
      .then(res => {
        console.log(res)
        return db.collection('article').doc(event.articleId).update({
          data: {
            commentCount: _.inc(-res.length)
          }
        }).then(() => {
          return db.collection('like').where({
            likeId: _.in(res)
          }).remove()
        })
      })
      .then(res => {
        return handleSuccess(res)
      })
      .catch(err => {
        return handleErr(err)
      })
  }
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