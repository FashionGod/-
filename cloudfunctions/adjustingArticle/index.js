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
  checkLike()
  checkComment()
  checkCollect()
}

async function checkLike() {
  let tasks = []
  let res = await db.collection('like').aggregate()
    .group({
      _id: '$articleId',
      num: $.sum(1)
    })
    .limit(9999)
    .end()
  res.list.forEach(v => {
    console.log(v._id, v.num)
    tasks.push(db.collection('article')
      .where({
        _id: v._id,
      }).update({
        data: {
          likeCount: v.num,
        },
      }))
  })
  res = await Promise.all(tasks)
  console.log('like', res)
}

async function checkComment() {
  let tasks = []
  let res = await db.collection('comment').aggregate()
    .group({
      _id: '$articleId',
      num: $.sum(1)
    })
    .limit(9999)
    .end()
  res.list.forEach(v => {
    console.log(v._id, v.num)
    tasks.push(db.collection('article')
      .where({
        _id: v._id,
      }).update({
        data: {
          commentCount: v.num,
        },
      }))
  })
  res = await Promise.all(tasks)
  console.log('comment', res)
}

async function checkCollect() {
  let tasks = []
  let res = await db.collection('collect').aggregate()
    .group({
      _id: '$articleId',
      num: $.sum(1)
    })
    .limit(9999)
    .end()
  res.list.forEach(v => {
    console.log(v._id, v.num)
    tasks.push(db.collection('article')
      .where({
        _id: v._id,
      }).update({
        data: {
          collectionCount: v.num,
        },
      }))
  })
  res = await Promise.all(tasks)
  console.log('collect', res)
}