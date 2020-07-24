// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  return db.collection('user-info').doc(wxContext.OPENID)
    .get()
    .then(res => {
      return handleSuccess(res.data.subjectHistory)
    })
    .catch(err => {
      handleErr(err)
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