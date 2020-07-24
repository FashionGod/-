// 云函数入口文件
const cloud = require('wx-server-sdk')
// npm install --save wx-server-sdk@latest
cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()


  return db.collection('article')
    .update({
      data: {
        hotComment: _.set({})
      }
    })
    .then(res => {
      console.log('update', res)
      return db.collection('comment')
        .aggregate()
        .group({
          _id: {
            articleId: '$articleId',
            _id: '$_id'
          },
          maxLikeCount: $.max('$likeCount')
        })
        .sort({
          maxLikeCount: -1
        })
        .group({
          _id: '$_id.articleId',
          hotComment: $.first('$_id._id')
        })
        .end()
    })
    .then(res => {
      console.log('group', res)
      let tasks = []
      let list = res.list
      list.forEach(v => {
        let p = db.collection('comment')
          .doc(v.hotComment)
          .get()
          .then(res => {
            console.log('hotComment', res)
            let hotComment = res.data
            return db.collection('user-info')
              .doc(hotComment._openid)
              .get()
              .then(res => {
                hotComment.userInfo = res.data
                return hotComment
              })
          })
          .then(res => {
            console.log('hotComment2', res)
            return db.collection('article').doc(res.articleId).update({
              data: {
                hotComment: res
              }
            })
          })
        tasks.push(p)
      })
      return Promise.all(tasks)
    })
    .then(res => {
      return res
    })
}