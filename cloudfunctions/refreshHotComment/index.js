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
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  // 清空热评
  await db.collection('article').where({})
    .update({
      data: {
        hotComment: _.set({})
      }
    })

  // 得到每篇文章的热评id
  let res = await db.collection('comment')
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
    .limit(9999)
    .end()
  console.log(res)
  let tasks = []
  res.list.forEach(v => {
    tasks.push(
      db.collection('comment')
      .doc(v.hotComment)
      .get()
      .then(res => {
        let hotComment = res.data
        return db.collection('user-info')
          .doc(hotComment._openid)
          .get()
          .then(res => {
            hotComment.userInfo = res.data
            console.log(hotComment)
            return hotComment
          })
      })
      .then(res => {
        return db.collection('article').doc(res.articleId).update({
          data: {
            hotComment: res
          }
        })
      })
    )
  })
  res = await Promise.all(tasks)
  console.log(res)

}