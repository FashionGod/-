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
  let history = {}
  history.trueNumber = event.trueNumber
  history.subject = event.subject
  history.answer = event.answer
  history.time = db.serverDate()
  return db.collection('user-info').doc(wxContext.OPENID).update({
      data: {
        subjectHistory: _.push(history)
      }
    })
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