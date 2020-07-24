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
  let limit = 20
  let data = []
  return db.collection('comment').where({
      articleId: event.articleId,
      type: 1
    }).count()
    .then(res => {
      let skip = res.total - event.start - limit
      if (skip <= 0) {
        limit = limit + skip
        skip = 0
      }
      return db.collection('comment')
        .where({
          articleId: event.articleId,
          type: 1
        })
        .skip(skip)
        .limit(limit)
        .get()
    })
    .then(res => {
      let ids = []
      res.data.forEach(v => {
        ids.push(v._id)
      })
      data = res.data
      return _getAllReply(event.articleId, ids)
    })
    .then(res => {
      data = data.concat(res)
      // 这里得到所有
      return _handleComment(data, wxContext.OPENID)
    })
    .then(res => {
      return _handleLike(event.articleId, res, wxContext.OPENID)
    })
    .then(res => {
      return _groupComment(res)
    })
    .then(res => {
      return handleSuccess(res.reverse())
    })
    .catch(err => {
      return handleErr(err)
    })
}

function _handleComment(odata, openId) {
  let data = JSON.parse(JSON.stringify(odata))
  let tasks = []
  let ids = []
  data.forEach(v => {
    ids.push(v._openid)
  })
  return db.collection('user-info').where({
      _id: _.in(ids)
    }).get()
    .then(res => {
      data.forEach(v => {
        res.data.forEach(v1 => {
          if (v1._id == v._openid) {
            v.userInfo = v1
            v.formatTime = _timeago(new Date(v.createTime).getTime())
            v.canDelete = false
            if (v._openid == openId) {
              v.canDelete = true
            }
          }
        })
      })
      return data
    })
}

function _handleLike(articleId, odata, openId) {
  let data = JSON.parse(JSON.stringify(odata))
  let ids = []
  data.forEach(v => {
    ids.push(v._id)
  })

  return db.collection('like').aggregate()
    .match({
      articleId: articleId,
      likeId: $.in(ids),
      _openid: openId
    })
    .group({
      _id: '$likeId',
      likes: $.push({
        _id: '$_id',
        _openid: '$_openid',
        articleId: '$articleId',
        likeId: '$likeId',
        type: '$type'
      })
    })
    .end()
    .then(res => {
      // 遍历所有评论
      data.forEach(v1 => {
        v1.liked = false
        // 遍历分组
        res.list.forEach(v => {
          // 如果评论id和分组_id相等
          if (v1._id == v._id) {
            // 遍历分组下的每个赞
            v.likes.forEach(v2 => {
              if (v1._id == v2.likeId) {
                v1.liked = true
              }
            })
          }
        })
      })
      return data
    })
}

function _getAllReply(articleId, ids) {
  // 待优化,最多20条
  return db.collection('comment').aggregate()
    .match({
      type: 2,
      articleId: articleId,
      commentId: $.in(ids)
    })
    .group({
      _id: '$commentId',
      replys: $.push({
        _id: '$_id',
        _openid: '$_openid',
        articleId: '$articleId',
        commentId: '$commentId',
        content: '$content',
        createTime: '$createTime',
        likeCount: '$likeCount',
        type: '$type'
      })
    })
    .end().then(res => {
      let tempData = []
      res.list.forEach(v => {
        tempData = tempData.concat(v.replys)
      })
      return tempData
    })
}

function _groupComment(odata) {
  let data = []
  odata.forEach(v => {
    if (!v.commentId) {
      // 文章评论
      v.replyList = []
      data.push(v)
    } else {
      // 子评论
      data.forEach(v1 => {
        if (v.commentId == v1._id) {
          // 倒序
          v1.replyList.unshift(v)
        }
      })
    }
  })
  return data
}

function _timeago(dateTimeStamp) {
  //dateTimeStamp是一个时间毫秒，注意时间戳是秒的形式，在这个毫秒的基础上除以1000，就是十位数的时间戳。13位数的都是时间毫秒。
  var minute = 1000 * 60; //把分，时，天，周，半个月，一个月用毫秒表示
  var hour = minute * 60;
  var day = hour * 24;
  var week = day * 7;
  var halfamonth = day * 15;
  var month = day * 30;
  var now = new Date().getTime(); //获取当前时间毫秒
  var diffValue = now - dateTimeStamp; //时间差

  if (diffValue < 0) {
    return;
  }
  // 计算时间差的分，时，天，周，月
  var minC = diffValue / minute;
  var hourC = diffValue / hour;
  var dayC = diffValue / day;
  var weekC = diffValue / week;
  var monthC = diffValue / month;
  var result = ""
  if (monthC >= 1 && monthC <= 3) {
    result = " " + parseInt(monthC) + "月前"
  } else if (weekC >= 1 && weekC <= 3) {
    result = " " + parseInt(weekC) + "周前"
  } else if (dayC >= 1 && dayC <= 6) {
    result = " " + parseInt(dayC) + "天前"
  } else if (hourC >= 1 && hourC <= 23) {
    result = " " + parseInt(hourC) + "小时前"
  } else if (minC >= 1 && minC <= 59) {
    result = " " + parseInt(minC) + "分钟前"
  } else if (diffValue >= 0 && diffValue <= minute) {
    result = "刚刚"
  } else {
    var datetime = new Date();
    datetime.setTime(dateTimeStamp);
    var Nyear = datetime.getFullYear();
    var Nmonth = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    var Ndate = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    var Nhour = datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime.getHours();
    var Nminute = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
    var Nsecond = datetime.getSeconds() < 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
    result = Nyear + "-" + Nmonth + "-" + Ndate
  }
  return result;
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