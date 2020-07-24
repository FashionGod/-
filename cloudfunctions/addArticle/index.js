// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  let data = event.data
  return db.collection('article').add({
      data: {
        title: data.title,
        introduce: data.introduce,
        keyword: data.keyword,
        imgUrls: data.imgUrls,
        json: data.json,
        hotComment: {},
        likeCount: 0,
        commentCount: 0,
        collectionCount: 0,
        poster: wxContext.OPENID,
        createTime: db.serverDate()
      }
    })
    .then(res => {
      return handleSuccess()
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