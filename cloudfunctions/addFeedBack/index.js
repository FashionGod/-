// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()

  return db.collection('feedBack').add({
      data: {
        text: event.text,
        number: event.number,
        time: db.serverDate(),
        _openid: wxContext.OPENID
      }
    }).then(res => {
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