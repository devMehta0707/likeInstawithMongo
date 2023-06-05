const Post = require('../models/posts');
const LikedPost = require('../models/likedPosts');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const path = require('path');

// FILE UPLOAD FUNCTION

async function fileUpload(mediaArr) {
  if (!Array.isArray(mediaArr)) {
    mediaArr = [mediaArr];
  }
  const uploadedMediaArr = [];
  const uploadPromises = mediaArr.map(async (media) => {
    const mediaName = `${Date.now()}-${Math.round(Math.random() * 9999)}.${media.mimetype.split('/')[1]}`;
    const mediaType = media.mimetype.split('/')[0];
    const mediaObj = {
      type: mediaType,
      media: mediaName
    };
    await media.mv(path.join(`${__dirname}/../public/media/${mediaName}`));
    uploadedMediaArr.push(mediaObj);
  });
  await Promise.all(uploadPromises);
  return uploadedMediaArr;
}

// CREATE POST FUNCTION

exports.createPost = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  const { text, isPublic, user_detail, hashtags, friendTags } = req.body;
  const { mediaFiles } = req.files;
  const mediaArr = await fileUpload(mediaFiles);
  await Post.create({
    text: text,
    isPublic: isPublic,
    userId: user_detail.id,
    hashtags: hashtags,
    friendTags: friendTags,
    media: mediaArr
  })
  return res.status(200).json({ code: 200, msg: "Post Created Successfully" })
})

// LIKE POST FUNCTION

exports.likePost = asyncHandler(async (req, res) => {
  const { post_id } = req.params;
  const { user_detail } = req.body;
  const post = await LikedPost.findOne({ 'userId': user_detail.id, 'postId': post_id });
  if (post) {
    return res.status(200).json({ code: 200, msg: "You Already Liked This Post" })
  }
  await LikedPost.create({ userId: user_detail.id, postId: post_id })
  return res.status(200).json({ code: 200, msg: "Post Liked" })
})

// DELETE POST FUNCTION

exports.deletePost = asyncHandler(async (req, res) => {
  const { post_id } = req.params;
  await Post.findByIdAndUpdate(post_id, { isDeleted: true });
  return res.status(200).json({ code: 200, msg: "Post Deleted" })
})

// EDIT POST

exports.editPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text, isPublic, hashtags, friendTags } = req.body;
  const { mediaFiles } = req.files;
  const mediaArr = await fileUpload(mediaFiles);
  await Post.findByIdAndUpdate(postId, 
    { text: text,
      isPublic, isPublic, 
      hashtags: hashtags, 
      friendTags: friendTags, 
      media: mediaArr 
    });
  return res.status(200).json({ code: 200, msg: "Post Updated" })
})