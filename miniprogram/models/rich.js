const FileSystemManager = wx.getFileSystemManager()
const cla = {
  title1: {
    name: "div",
    arr: {
      style: 'width:100%;font-size:21px;line-height:30px;margin-bottom:3px;margin-top:4px;color:#4C5264;font-weight:750;'
    }
  },
  title2: {
    name: "div",
    arr: {
      style: 'width:100%;font-size:20px;line-height:30px;margin-bottom:3px;margin-top:4px;color:#4C5264;font-weight:650;'
    }
  },
  title3: {
    name: "div",
    arr: {
      style: 'width:100%;font-size:19px;line-height:30px;margin-bottom:3px;margin-top:4px;color:#4C5264;font-weight:450;'
    }
  },
  content: {
    name: "div",
    arr: {
      style: 'width:100%;font-size:18px;line-height:20px;margin-bottom:16px;color:#4C5264;font-weight:300;'
    }
  },
  using: {
    name: "div",
    arr: {
      style: 'width:100%;font-size:17px;background:none repeat scroll 0 0 rgba(102,128,153,.15);;line-height:20px;margin-bottom:16px;margin-top:8px;color:#4C5264;font-weight:300;'
    }
  },
  li: {
    name: "li",
    arr: {
      style: 'width:100%;line-height:20px;font-weight:300;font-size:18px;color:#4C5264;'
    }
  },
  img: {
    name: "img",
    arr: {
      style: 'width:100%;'
    }
  }
}
class RichModel {
  rawJson = null
  articleData = null
  title = null
  introduce = null
  keyword = null


  constructor(rawJson) {
    let t = JSON.parse(JSON.stringify(rawJson))
    t = t.filter(v => {
      switch (v.type) {
        case 'mkname':
          this.title = v.content
          v = null
          break
        case 'mkcontent':
          this.introduce = v.content
          v = null
          break
        case 'mktype':
          this.keyword = v.content
          v = null
          break
      }
      return !!v
    })
    this.rawJson = t
  }



  getTitle() {
    return this.title
  }
  getIntroduce() {
    return this.introduce
  }
  getKeyword() {
    return this.keyword
  }


  getRawJson() {
    return this.rawJson
  }

  // 上传时调用 调用后可以调用 getImgUrls
  getCloudJson() {
    let data = JSON.parse(JSON.stringify(this.rawJson))
    console.log(data)
    let tasks = []
    data.forEach((v, index) => {
      if (v.type == 'img') {
        console.log(v)
        let filePath = this._base64ToFile(v.content)
        console.log(filePath)
        let p = this._updateImgToCloud(filePath).then(res => {
          v.content = res.fileID
          return res.fileID
        })
        tasks.push(p)
      }
    })
    return Promise.all(tasks)
      .then(res => {
        this.imgUrls = res
        return data
      }).catch(err => {
        return err
      })
  }

  getImgUrls() {
    return this.imgUrls
  }

  // 浏览调用
  getRichJson() {
    return this._handleCloudImg(this.rawJson).then(res => {
      let data = res
      let nodes = [];
      let imgIndexs = []
      data.forEach(v => {
        let temp = {}
        temp.name = cla[v.type].name
        if (temp.name == 'img') {
          let t = {}
          t.style = 'width:100%;'
          t.src = v.content
          temp.attrs = t
          temp.children = []
        } else {
          temp.attrs = cla[v.type].arr
          temp.children = [{
            type: 'text',
            text: v.content
          }]
        }
        nodes.push(temp)
      })
      return nodes
    })
  }

  _handleCloudImg(s) {
    let data = JSON.parse(JSON.stringify(s))
    let fileList = []
    let imgIndexList = []
    data.forEach((v, index) => {
      if (v.type == 'img') {
        if (v.content.substring(0, 8) == 'cloud://') {
          imgIndexList.push(index)
          fileList.push({
            fileID: v.content,
            maxAge: 60,
          })
        }
      }
    })
    return wx.cloud.getTempFileURL({
      fileList: fileList
    }).then(res => {
      res.fileList.forEach((v, index) => {
        data[imgIndexList[index]].content = v.tempFileURL
      })
      return data
    }).catch(err => {
      console.log(err)
      return err
    })
  }

  _base64ToFile(b64Str) {
    let imgData = new String(b64Str)
    let name = wx.env.USER_DATA_PATH + '/' + Math.floor(Math.random() * 10000000) + '.' + imgData.slice(imgData.indexOf("/") + 1, imgData.indexOf(";"))
    let r = FileSystemManager.writeFileSync(
      name,
      imgData.slice(imgData.indexOf(",")),
      'base64'
    )
    if (r) {
      return null
    } else {
      return name
    }
  }

  _updateImgToCloud(filePath) {
    let data = FileSystemManager.readFileSync(filePath)
    let cloudPath = "img/" + filePath.substr(filePath.lastIndexOf("/") + 1)
    return wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath
    })
  }
}



export {
  RichModel
}