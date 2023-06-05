const mongoose = require('mongoose')

const LikedPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.ObjectId,
      ref: 'User'
    },
    postId: {
      type: mongoose.ObjectId,
      ref: 'Post'
    }
  }, {
  timestamps: true
}
)

const LikedPost = mongoose.model('LikedPost',LikedPostSchema);

module.exports = LikedPost;