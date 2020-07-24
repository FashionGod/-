//获取应用实例
import {
  SubjectModel
} from '../../../models/subject.js'
const subjectModel = new SubjectModel()
import {
  UserModel
} from '../../../models/user.js'
const app = getApp()
Page({
  data: {
    current: 0,
    zimu: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    duicuo: ['✓', '×'],
    showAnswer: false,
    showModal: 0,
    subjectList: [],
    userChoice: [],
    answer: [],
    trueNumber: 0,
    isNullList: [],
    userInfo: null,
    num: 1
  },
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    // 从答题历史页跳转来 
    if (options.num == 0) {
      this.setData({
        num: 0
      })
      //判断对错 
      let subjectList = app.globalData.subjectList
      if (!subjectList) {
        console.log('subjectList不存在', subjectList)
        return
      }
      console.log('zhuangtai', subjectList[0].stateList)

      subjectList.forEach(v => {
        if (!v.stateList) {
          console.log('v.stateList不存在', v.stateList)
          return
        }
        v.stateList.forEach((v1, index) => {

          if (v1 == 'activate' && index != v.answer - 1) { //因为数据库集合里answer是1234不是下标 
            console.log('error', v1, index)
            v.stateList[index] = 'error'
          }
        })
      })
      this.setData({
        showAnswer: true,
        subjectList: subjectList,
      })
      wx.hideLoading()
      return
    }
    //在数据库中随机抽5道题（三道单选两个判断）
    subjectModel.getSubject().then(res => {
      let subjectList = res
      subjectList.forEach(v => {
        if (v.type == 2) {
          // 如果是判断题，只给两个选项记录状态
          v.stateList = new Array(2).fill('')
          v.question = ["正确", "错误"]
        } else if (v.type == 1) {
          v.stateList = new Array(v.question.length).fill('')
        }
      })
      let userInfo = app.globalData.userInfo;
      console.log(userInfo)
      if (userInfo) {
        this.setData({
          userInfo: userInfo,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        })
      }
      this.setData({
        subjectList: subjectList
      })
      wx.hideLoading()
      wx.showToast({
        title: '左右滑动可切换题目',
        icon: 'none'
      })
    }).catch(err => {
      console.error(err)
      wx.showToast({
        title: '题目获取失败',
        icon: "none"
      })
      wx.hideLoading()
    })

  },

  option: function(e) {
    if (this.data.showAnswer) {
      return
    }
    let listIndex = e.currentTarget.dataset.listIndex
    let index = e.currentTarget.dataset.index
    let subjectList = this.data.subjectList
    let item = subjectList[listIndex]
    let stateList = new Array(item.question.length).fill('')
    stateList[index] = 'activate'
    item.stateList = stateList
    console.log(subjectList[listIndex].stateList)
    this.setData({
      subjectList: subjectList
    })
    console.log(subjectList.length)
    setTimeout(() => {
      if (listIndex < subjectList.length - 1) {
        this.setData({
          current: listIndex + 1
        })
      }
    }, 150)
  },
  submitBButton: function() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //判断对错
    let subjectList = this.data.subjectList
    let trueNumber = 5
    let isNullList = []
    let answer = []
    subjectList.forEach(v => {
      answer.push(v.answer)
      let isNull = true //选没选
      v.stateList.forEach((v1, index) => {
        if (v1 == 'activate') {
          isNull = false
        }
        if (v1 == 'activate' && index != v.answer - 1) {
          //因为数据库集合里answer是1234不是下标
          v.stateList[index] = 'error'
          trueNumber--
        }
      })
      if (isNull) {
        trueNumber--
        isNullList.push(true)
      } else {
        isNullList.push(false)
      }
    })
    this.setData({
      showAnswer: true,
      subjectList: subjectList,
      trueNumber: trueNumber,
      answer: answer
    })
    this.data.isNullList = isNullList
    //提交用户做题记录到云函数
    if (!this.data.userInfo) {
      wx.showModal({
        title: '提示',
        content: '由于尚未登录,本次做题历史无法保存',
        showCancel: false
      })
    }
    subjectModel.addHistory({
      trueNumber: this.data.trueNumber,
      subject: this.data.subjectList,
      answer: this.data.answer
    }).then(res => {
      this.setData({
        showModal: 1,
        userInfo: app.globalData.userInfo
      })
      wx.hideLoading()
    }).catch(err => {
      console.error(err)
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      })
      wx.hideLoading()
    })
  },
  backToFunction: function() {
    wx.navigateBack({
      delta: 1
    })
  },
  showAnswer: function() {
    this.setData({
      showModal: 0,
      num: 0
    })
  }
})