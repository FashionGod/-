// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  // npm install--save wx - server - sdk

  // 向用户集合中对应的用户记录中话题对象数组里添加一个新的话题对象---------测试成功-------------

  //目前在form_note。js调用

  return await db.collection('user-info').where({
    _id: wxContext.OPENID,

  }).update({
    data: {
      mysubRecord: _.push({
      trueNumber: event.trueNumber,
      subject : event.subject,
      time: db.serverDate(),
      userChoice:event.userChoice,
      answer: event.answer
      }),
    }
  });//success!!!!!!!!!!!!!!!!!!!!!

}