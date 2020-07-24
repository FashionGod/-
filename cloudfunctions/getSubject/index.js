// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  let subjectList = []
  //随机获取3道单选题
  return db.collection('subjects').aggregate()
    .match({
      type: 1
    })
    .sample({
      size: 3
    })
    .end()
    .then(res => {
      subjectList = subjectList.concat(res.list)
      //随机获取2道判断题
      return db.collection('subjects').aggregate()
        .match({
          type: 2
        })
        .sample({
          size: 2
        })
        .end()
    })
    .then(res => {
      subjectList = subjectList.concat(res.list)
      return handleSuccess(subjectList)
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