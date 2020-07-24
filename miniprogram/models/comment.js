const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate

class CommentModel {

  addComment({
    type, // 1评论文章 2回复评论
    articleId,
    commentId = '', //不为空则为回复评论
    content,
  }) {
    return wx.cloud.callFunction({
      name: 'addComment',
      data: {
        articleId: articleId,
        commentId: commentId,
        content: content,
        type: type
      }
    })
  }

  deleteComment({
    type,
    _id,
    articleId
  }) {
    return wx.cloud.callFunction({
      name: 'deleteComment',
      data: {
        _id: _id,
        articleId: articleId,
        type: type
      }
    })
  }

  getComment({
    articleId,
    start = 0
  }) {
    return wx.cloud.callFunction({
      name: 'getComment',
      data: {
        articleId: articleId,
        start: start
      }
    }).then(res => {
      console.log('getComment', res)
      return res.result.data
    })
  }
}
export {
  CommentModel
}