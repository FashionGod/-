// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'czj-kk36j'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  // 先取出集合记录总数
  const countResult = await db.collection('article').count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('article').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  let articles = (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
  let imgs = []
  console.log(articles.data)
  articles.data.forEach(v => {
    v.imgUrls.forEach(img => {
      imgs.push(img)
    })
    v.json.forEach(v2 => {
      if (v2.type == 'img') {
        // console.log(v2.content)
        imgs.push(v2.content)
      }
    })
  })
  imgs = unique(imgs)
  const c = Math.ceil(imgs.length / 50)
  console.log('c', c)
  let imgUrls = []
  for (let i = 0; i < c; i++) {
    console.log(imgs.slice(i * 50, i * 50 + 50))
    await cloud.getTempFileURL({
      fileList: imgs.slice(i * 50, i * 50 + 50)
    }).then(res => {
      res.fileList.forEach(v => {
        imgUrls.push(v.tempFileURL)
      })
      console.log(res.fileList)
    }).catch(error => {
      console.error(error)
    })
  }
  console.log(imgUrls)
  console.log(imgUrls.length)

}

function unique(arr) {
  for (var i = 0, len = arr.length; i < len; i++) {
    for (var j = i + 1, len = arr.length; j < len; j++) {
      if (arr[i] === arr[j]) {
        arr.splice(j, 1);
        j--; // 每删除一个数j的值就减1
        len--; // j值减小时len也要相应减1（减少循环次数，节省性能）   
        // console.log(j,len)
      }
    }
  }
  return arr;
}