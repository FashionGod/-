//云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let success = false
  let openIds = []
  let comments = []
  let childs = []
  let article_ids = []
  let commen_ids = []
  let test = []
  let commen_commentIds = []
  const tasks1 = []
  const tasks2 = []
  const tasks3 = []
  const tasks4 = []
  const tasks5 = []
  const tasks6 = []
  const tasks7 = []
  const tasks8 = []
  await db.collection('comment')
    .where({
      _openid: wxContext.OPENID,
    }).get().then(res => {
      console.log(res);
      comments = res.data
      comments.forEach(v => {
        article_ids.push(v.articleId)
        openIds.push(v._openid)
        commen_ids.push(v._id)
        if (v.commentId != '' && v.type == 2) {
          commen_commentIds.push(v.commentId)
        }
      })
      const promise3 = db.collection('article')
        .where({
          _id: _.in(article_ids)
        }).get()
      promise3.then(res => {
        comments.forEach(v => {
          res.data.forEach(v1 => {
            if (v.articleId == v1._id) {
              v.articleTitle = v1.title
              // v.articledetail = v1  占用太多setData资源
            }
          })
        })
      })
      tasks3.push(promise3)
      const promise2 = db.collection('user-info')
        .where({
          _id: wxContext.OPENID,
        }).get()
      promise2.then(res => {
        let nickName = res.data[0].nickName
        let avatarUrl = res.data[0].avatarUrl
        comments.forEach(v => {
          v.nickName = res.data[0].nickName
          v.avatarUrl = res.data[0].avatarUrl
        })
      })
      tasks2.push(promise2)
      const promise1 = db.collection('comment')
        .where({
          commentId: _.in(commen_ids)
        }).get()
      promise1.then(res => {
        childs = res.data
        // 遍历获取所有儿子评论的openid
        let child_openids = []
        res.data.forEach(v1 => {
          child_openids.push(v1._openid)
        })
        // 给所有儿子评论加入头像呢称
        const promise5 = db.collection('user-info')
          .where({
            _id: _.in(child_openids),
          }).get()
        promise5.then(res => {
          childs.forEach(v => {
            res.data.forEach(v1 => {
              if (v._openid == v1._id) {
                v.nickName = v1.nickName
                v.avatarUrl = v1.avatarUrl
              }
            })
          })
        })
        tasks5.push(promise5)
        comments.forEach(v => {
          v.children = [];
          v.unread = false
          res.data.forEach(v1 => {
            if (v._id == v1.commentId) {
              let children1 = v1
              // v1.articleTitle = v.articleTitle
              if (v1.read == 0 && v1._openid != wxContext.OPENID) {
                v1.unread = true
                let num = 1
                const promise4 = db.collection('comment')
                  .where({
                    _id: v1._id,
                  }).update({
                    data: {
                      read: num,
                    },
                  })
                tasks4.push(promise4)
              }
              v.children.push(v1)
            }
          })
        })
      })
      tasks1.push(promise1)
      // 加入父亲对象 promise67 tasks67
      // 获取我的评论中所有父亲评论信息
      const promise6 = db.collection('comment')
        .where({
          _id: _.in(commen_commentIds)
        }).get()
      promise6.then(res => {
        let farthers = res.data
        // 遍历获取所有父亲评论的openid
        let farther_openids = []
        res.data.forEach(v1 => {
          farther_openids.push(v1._openid)
        })
        // 给所有父亲评论加入头像呢称
        const promise7 = db.collection('user-info')
          .where({
            _id: _.in(farther_openids),
          }).get()
        promise7.then(res => {
          farthers.forEach(v => {
            res.data.forEach(v1 => {
              if (v._openid == v1._id) {
                v.nickName = v1.nickName
                v.avatarUrl = v1.avatarUrl
              }
            })
          })
        })
        tasks7.push(promise7)
        comments.forEach(v => {
          v.farther = [];
          test = res
          farthers.forEach(v1 => {
            if (v.commentId == v1._id) {
              v.farther = v1
            }
          })
        })
      })
      tasks6.push(promise6)

    })
  await Promise.all(tasks1)
  await Promise.all(tasks2)
  await Promise.all(tasks3)
  await Promise.all(tasks4)
  await Promise.all(tasks5)
  await Promise.all(tasks6)
  await Promise.all(tasks7)
  return {
    success: success,
    comments: comments,
    test: test,
    commen_ids: commen_ids,
  }
}
