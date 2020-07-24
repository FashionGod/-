class KeywordModel {
  key = 'q'
  max = 10
  constructor() {

  }

  getHistory() {
    var keywords = wx.getStorageSync(this.key)
    return keywords
  }

  getHot(success) {
    success({
      hot: ['科技', '新东方', '百度', '华为', '阿里巴巴']
    })
  }


  addToHistory(word) {
    let keywords = this.getHistory()
    if (keywords) {
      let index = keywords.indexOf(word)
      if (index == -1) {
        let length = keywords.length
        if (length >= this.max) {
          keywords.pop(word)
        }
        keywords.unshift(word)
      }
      wx.setStorageSync(this.key, keywords)
    } else {
      keywords = [word]
      wx.setStorageSync(this.key, keywords)
    }
  }
}

export {
  KeywordModel
}