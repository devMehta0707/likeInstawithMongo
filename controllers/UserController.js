const User = require('../models/users');
const Post = require('../models/posts');
const LikedPost = require('../models/likedPosts');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const SALT_ROUND = 10;
const SECRET_KEY = "InstaApp";
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");

// CHECK UNIQUE EMAIL ID FUNCTION

async function checkEmailAlreadyExist(email) {
  const user = await User.findOne({ email: email });
  return user;
}

async function userNameAlreadyExist(userName) {
  const user = await User.findOne({ username: userName });
  return user;
}

// PASSWORD HASH FUNCTION

async function passwordHash(plainPassword) {
  const hashPass = await bcrypt.hash(plainPassword, SALT_ROUND);
  return hashPass;
}

// COMPARE PASSWORD FUNCTION

async function comparePassword(password, hashPassword) {
  const result = await bcrypt.compare(password, hashPassword);
  return result;
}

// CREATE
exports.register = asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array() });
  }
  const isExist = await checkEmailAlreadyExist(req.body.email);
  if (isExist) {
    return res.status(400).json({ msg: "Email id Already Exist" });
  }
  const isUserNameExist = await userNameAlreadyExist(req.body.username);
  if (isUserNameExist) {
    return res.status(400).json({ msg: "User Name Already Taken" });
  }
  const password = await passwordHash(req.body.password);
  req.body.password = password;
  const result = await User.create(req.body);
  return res.status(200).json({
    msg: "Registered Successfully",
    data: result
  })
})

// LOGIN USER

exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array() })
  }
  const { email, password } = req.body;
  const userExist = await User.findOne({ email: email });
  if (userExist) {
    const passMatch = await comparePassword(password, userExist.password);
    if (passMatch) {
      const token = jwt.sign({ email: userExist.email, id: userExist._id }, SECRET_KEY);
      return res.status(200).json({ code: 200, msg: "Login Successfully", data: userExist, token: token })
    } else {
      return res.status(400).json({ code: 400, msg: "Invalid Credentials" })
    }
  } else {
    return res.status(400).json({ code: 400, msg: "User Not Exist" })
  }
})

// FOLLOW UNFOLLOW FUNCTION

exports.followUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { user_detail } = req.body;
  await User.updateOne(
    { _id: user_id },
    { $addToSet: { followers: user_detail.id } }
  );
  await User.updateOne(
    { _id: user_detail.id },
    { $addToSet: { following: user_id } }
  )
  return res.status(200).json({ code: 200, msg: "Followed Successfully" })
})

exports.unfollowUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { user_detail } = req.body;
  await User.updateOne(
    { _id: user_id },
    { $pull: { followers: user_detail.id } }
  );
  await User.updateOne(
    { _id: user_detail.id },
    { $pull: { following: user_id } }
  )
  return res.status(200).json({ code: 200, msg: "Unfollowed Successfully" })

})

// BLOCK USER FUNCTION

exports.blockUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { user_detail } = req.body;
  await User.updateOne(
    { _id: user_detail.id },
    { $addToSet: { blockedUsers: user_id } }
  )
  return res.status(200).json({ code: 200, msg: "User Blocked Successfully" })
})

// UNBLOCK USER FUNCTION

exports.unblockUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { user_detail } = req.body;
  await User.updateOne(
    { _id: user_detail.id },
    { $pull: { blockedUsers: user_id } }
  )
  return res.status(200).json({ code: 200, msg: "User Unblocked Successfully" })
})

// GET USER PROFILE 

exports.getUserProfile = asyncHandler(async (req, res) => {
  const userDetails = req.body.user_detail;
  const profile = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userDetails.id)
      }
    },
    {
      $lookup: {
        from: "posts",
        let: {
          userId: "$_id"
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$userId', '$$userId']
              },
            }
          },
          {
            $lookup: {
             from: "likedposts",
             let: {
              postId: "$_id"
             },
             pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$postId', "$$postId"]
                  }
                },
              },
              {
                $lookup: {
                  from: "users",
                  foreignField: "_id",
                  localField: "userId",
                  as: "user"
                }
              },
              {
                $unwind: {
                  path: "$user",
                  preserveNullAndEmptyArrays: false
                }
              }
             ],
             as: "likes" 
            }
          }
        ],
        as: "posts"
      }
    }
  ])
  
  return res.status(200).json({ code: 200, data: profile.length > 0 ? profile[0] : {}});
});


// EXPLORE FUNCTION

exports.explore = asyncHandler(async (req, res) => {
  const { user_detail } = req.body;
  const { limit = 10, offset = 0 } = req.query;

  const postFeed = await Post.aggregate([
    {
      $match: {
        isPublic: true,
        isDeleted: false,
        userId: { $ne: new mongoose.Types.ObjectId(user_detail.id) },
      },
    },
    { $sample: { size: parseInt(offset) + parseInt(limit) } },
    { $skip: parseInt(offset) },
    { $limit: parseInt(limit) },
  ]);
  return res.status(200).json({ code: 200, result: postFeed });
});

// EDIT PROFILE

exports.editProfile = asyncHandler(async (req, res) => {
  const { user_detail } = req.body;
  const { name, gender, mobile, isProfilePublic } = req.body;
  await User.findByIdAndUpdate(user_detail.id, { name: name, gender: gender, mobile: mobile, isProfilePublic: isProfilePublic });
  return res.status(200).json({ code: 200, msg: "Profile Updated" })
})