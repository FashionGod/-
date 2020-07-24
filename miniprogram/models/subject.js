const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate
const app = getApp()
class SubjectModel {
  getSubject() {
    return wx.cloud.callFunction({
      name: 'getSubject'
    }).then(res => {
      return res.result.data
    })
  }

  getHistory() {
    return wx.cloud.callFunction({
      name: 'getSubjectHistory'
    }).then(res => {
      let data = res.result.data
      console.log(data)
      data.forEach(v => {
        v.time = this._formatTime(v.time, 'yyyy-MM-dd hh:mm:ss')
      })
      return data
    }).catch(err => {
      console.error(err)
      return []
    })
  }

  _formatTime(str, fmt) {
    let date = new Date(str)
    var o = {
      "M+": date.getMonth() + 1, //月份 
      "d+": date.getDate(), //日 
      "h+": date.getHours(), //小时 
      "m+": date.getMinutes(), //分 
      "s+": date.getSeconds(), //秒 
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
      "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      }
    }
    return fmt;
  }

  addHistory({
    trueNumber,
    subject,
    answer
  }) {
    return wx.cloud.callFunction({
      name: 'addSubjectHistory',
      data: {
        trueNumber: trueNumber,
        subject: subject,
        answer: answer
      }
    })
  }
}
export {
  SubjectModel
}