const db = wx.cloud.database()

class LikeModel {
  addLike({
    articleId,
    likeId,
    type
  }) {
    return wx.cloud.callFunction({
        name: 'addLike',
        data: {
          articleId: articleId,
          likeId: likeId,
          type: type // 1点赞文章 2点赞评论
        }
      }).then(res => {
        return res.result
      })
      .catch(err => {
        console.log(err)
      })
  }

  deleteLike({
    articleId,
    likeId,
    type
  }) {
    return wx.cloud.callFunction({
        name: 'deleteLike',
        data: {
          articleId: articleId,
          likeId: likeId,
          type: type
        }
      }).then(res => {
        return res.result
      })
      .catch(err => {
        console.log(err)
      })
  }

  getLiked({
    articleId,
    likeId,
    type
  }) {
    return wx.cloud.callFunction({
      name: 'getLikeStatus',
      data: {
        articleId: articleId,
        likeId: likeId,
        type: type
      }
    }).then(res => {
      return res.result.data.liked
    })
  }
}
export {
  LikeModel
}