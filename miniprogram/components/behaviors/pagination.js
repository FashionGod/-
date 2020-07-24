let paginationBev = Behavior({
  properties: {

  },
  data: {
    start: 0,
    dataArray: [],
    empty: false,
    ending: false
  },
  methods: {
    setMoreData: function(dataArray) {
      if (dataArray.length < 5) {
        this.data.ending = true
        if (this.data.dataArray == false && dataArray.length == 0) {
          this.setData({
            empty: true
          })
        }
      }
      console.log('dataArray', this.data.dataArray)
      let temp = this.data.dataArray.concat(dataArray)
      console.log('temp', temp)
      this.data.start = temp.length
      this.setData({
        dataArray: temp
      })
      return true
    },

    hasMore: function() {
      return !this.data.ending
    },

    getCurrentStart: function() {
      return this.data.start
    },

    initPagination: function() {
      this.data.ending = false
      this.data.start = 0
      this.data.dataArray = []
      this.setData({
        dataArray: []
      })
    }
  }
})


export {
  paginationBev
}