const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // userId: {
    //   type: Number,
    //   unique: true,
    // },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    isProfilePublic: {
      type: Boolean,
      default: true,
    },
    followers: [
      {
        type:  mongoose.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type:  mongoose.ObjectId,
        ref: 'User',
      },
    ],
    blockedUsers: [
      {
        type:  mongoose.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User",UserSchema);

module.exports = User;