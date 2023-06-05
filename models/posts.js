const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type:  mongoose.ObjectId,
      ref: 'User',
    },
    text: {
      type: String,
      required: true,
    },
    media: [
      {
        _id:false,
        type:{
          type:String,
          required:true
        },
        media:{
          type:String,
          required:true
        }
      }
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    hashtags: [
      {
        type: String,
      },
    ],
    friendTags: [
      {
        type:  mongoose.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        user: {
          type:  mongoose.ObjectId,
          ref: 'User',
        },
        subComments: [
          {
            text: {
              type: String,
              required: true,
            },
            user: {
              type:  mongoose.ObjectId,
              ref: 'User',
            },
          },
        ],
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;