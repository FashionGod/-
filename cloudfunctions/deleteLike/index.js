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
  return db.collection('like').where({
      _openid: wxContext.OPENID,
      articleId: event.articleId,
      likeId: event.likeId
    }).get()
    .then(res => {
      if (res.data.length > 0) {
        return res.data[0]
      } else {
        throw 'none1'
      }
    }).then(res => {
      if (res._id) {
        if (event.type == 1) {
          // 文章
          return db.collection('article').doc(res.articleId).update({
            data: {
              likeCount: _.inc(-1)
            }
          }).then(res1 => {
            return res
          })
        } else if (event.type == 2) {
          // 评论
          return db.collection('comment').doc(res.likeId).update({
            data: {
              likeCount: _.inc(-1)
            }
          }).then(res1 => {
            return res
          })
        }
      } else {
        throw 'none2'
      }
    })
    .then(res => {
      return db.collection('like').doc(res._id).remove()
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