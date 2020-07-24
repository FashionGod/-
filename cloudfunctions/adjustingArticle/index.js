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
  let liked = false
  let collected = false
  let test = []
  const tasks1 = []
  const tasks2 = []
  const tasks3 = []
  const tasks4 = []
  const tasks5 = []
  const tasks6 = []
  let allarticle_ids = []
  let allArticleLikeCounts = []
  let allArticleCommentCounts = []
  let allArticleCollectCounts = []
  await db.collection('article').field({
    _id: true,
  })
    .get().then(res => {
      test = res.data
      res.data.forEach(v => {
        // v.forEach(v1 => {
        allarticle_ids.push(v._id)
        // })
      })
      allarticle_ids.forEach(v => {
        const promise1 = db.collection('like')
          .where({
            likeId: v
          }).get()
        promise1.then(res => {
          // test = allarticle_ids
          allArticleLikeCounts.push(res.data.length)
          const promise3 = db.collection('article')
            .where({
              _id: v,
            }).update({
              data: {
                likeCount: res.data.length,
              },
            })
          tasks3.push(promise3)
        })
        tasks1.push(promise1)
      })

      allarticle_ids.forEach(v => {
        const promise2 = db.collection('comment')
          .where({
            articleId: v
          }).get()
        promise2.then(res => {
          // test = allarticle_ids
          allArticleCommentCounts.push(res.data.length)
          const promise4 = db.collection('article')
            .where({
              _id: v,
            }).update({
              data: {
                commentCount: res.data.length,
                // hotComment:{}只有在完全洗白情况下开启
              },
            })
          tasks4.push(promise4)
        })
        tasks2.push(promise2)
      })
      allarticle_ids.forEach(v => {
        const promise5 = db.collection('collect')
          .where({
            articleId: v
          }).get()
        promise5.then(res => {
          // test = allarticle_ids
          allArticleCollectCounts.push(res.data.length)
          const promise6 = db.collection('article')
            .where({
              _id: v,
            }).update({
              data: {
                collectCount: res.data.length,
                // hotComment:{}只有在完全洗白情况下开启
              },
            })
          tasks6.push(promise6)
        })
        tasks5.push(promise5)
      })

      // const promise1 = db.collection('like')
      // .where({
      // likeId: _.in(allarticle_ids)
      // // type: _.in(types)
      // }).get()
      // promise1.then(res => {
      // // test = allarticle_ids
      // allArticleLikeCounts = res
      // })
      // tasks1.push(promise1)
      // await db.collection('like').where({
      // articleId: _.in(allarticle_ids)
      // }).get().then(res => {
      // allArticleLikeCounts = res
      // })
    })
  // let c = await db.collection('like').where({
  // type: 1,
  // openId: wxContext.OPENID,
  // likeId: event.articleId
  // }).count()
  // c = c.total
  // if (c > 0) {
  // liked = true
  // }
  // c = await db.collection('collect').where({
  // type: 1,
  // openId: wxContext.OPENID,
  // collectId: event.articleId
  // }).count()
  // c = c.total
  // if (c > 0) {
  // collected = true
  // }
  await Promise.all(tasks1)
  await Promise.all(tasks2)
  await Promise.all(tasks3)
  await Promise.all(tasks4)
  await Promise.all(tasks5)
  await Promise.all(tasks6)
  return {
    success: true,
    test: test,
    allarticle_ids: allarticle_ids,
    allArticleLikeCounts: allArticleLikeCounts,
    allArticleCommentCounts: allArticleCommentCounts,
    allArticleCollectCounts: allArticleCollectCounts,
  }
}
