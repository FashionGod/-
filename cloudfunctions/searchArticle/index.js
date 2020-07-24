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
  let re = db.RegExp({
    regexp: '.*' + event.keyWord + '.*'
  })
  return db.collection('article').where({
      keyword: re
    })
    .skip(event.start)
    .limit(5)
    .get()
    .then(res => {
      console.log(res)
      return res.data
    })
    .then(res => {
      res.forEach(v => {
        v.imgUrls = v.imgUrls.slice(0, 3)
      })
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