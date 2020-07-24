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
  let user = await db.collection('user-info').doc(wxContext.OPENID).get()
  if (!user.data.isAdmin) {
    return handleErr('没有权限')
  }
  let tasks = []
  let p
  p = db.collection('article')
    .doc(event.articleId)
    .remove()
  tasks.push(p)
  p = db.collection('like')
    .where({
      articleId: event.articleId
    })
    .remove()
  tasks.push(p)
  p = db.collection('comment')
    .where({
      articleId: event.articleId
    })
    .remove()
  tasks.push(p)
  p = db.collection('collect')
    .where({
      articleId: event.articleId
    })
    .remove()
  tasks.push(p)
  return Promise.all(tasks)
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