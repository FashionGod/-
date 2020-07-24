// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'czj-kk36j'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    return db.collection('user-info').where({
        _id: wxContext.OPENID
      }).count()
      .then(res => {
        console.log('count', res)
        if (res.total <= 0) {
          return db.collection('user-info').add({
            data: {
              _id: wxContext.OPENID,
              isAdmin: false,
              avatarUrl: event.avatarUrl,
              city: event.city,
              country: event.country,
              gender: event.gender,
              language: event.language,
              nickName: event.nickName,
              province: event.province,
            }
          })
        } else {
          return db.collection('user-info').doc(wxContext.OPENID).update({
            data: {
              avatarUrl: event.avatarUrl,
              city: event.city,
              country: event.country,
              gender: event.gender,
              language: event.language,
              nickName: event.nickName,
              province: event.province,
            }
          })
        }
      })
      .then(res => {
        return db.collection('user-info').doc(wxContext.OPENID).get()
      })
      .then(res => {
        return handleSuccess(res.data)
      })
  } catch (err) {
    return handleErr(err)
  }
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