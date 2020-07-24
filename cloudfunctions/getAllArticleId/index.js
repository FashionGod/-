// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()
const _ = db.command
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()

  const countResult = await db.collection('article').count()
  const total = countResult.total
  const batchTimes = Math.ceil(total / 100)
  const tasks = []
  let ids = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('article').skip(i * MAX_LIMIT).limit(MAX_LIMIT).field({
      _id: true
    }).get().then(res => {
      res.data.forEach(v => {
        ids.push(v._id)
      })
    })
    tasks.push(promise)
  }
  return Promise.all(tasks).then(res => {
    return handleSuccess(ids)
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