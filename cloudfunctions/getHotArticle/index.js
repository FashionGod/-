// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return db.collection('article')
    .aggregate()
    .group({
      _id: '$_id',
      totalCount: $.sum(
        $.sum(['$commentCount', '$collectionCount', '$likeCount'])
      )
    })
    .sort({
      totalCount: -1
    })
    .limit(5)
    .end()
    .then(res => {
      console.log('getHotArticle', res)
      let ids = []
      res.list.forEach(v => {
        ids.push(v._id)
      })
      console.log(ids)
      return db.collection('article')
        .where({
          _id: _.in(ids)
        }).get()
    })
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