// 云函数入口文件
const cloud = require('wx-server-sdk')
//npm install --save wx-server-sdk
cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()
const _ = db.command

exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  return db.collection("feedBack").get()
    .then(res => {
      return handleSuccess(res.data)
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