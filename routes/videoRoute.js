const express = require("express");
const router = express.Router();
const Video=require('../models/videoModal')
const authMiddleware = require("../middlewares/authMiddleware");
const cloudinary=require('../config/cloudinaryConfig')

router.post('/upload-video',authMiddleware,async(req,res)=>{
  try {
    const { title, description } = req.body;

    if (!req.files || !req.files.video) {
      return res.status(400).send({ success: false, message: 'Video file is required' });
    }

    const videoFile = req.files.video;

    // Upload the video to Cloudinary
    const result = await cloudinary.uploader.upload(videoFile.tempFilePath, {
      resource_type: 'video',
      folder: 'videos',
      eager: [
        { format: 'jpg', width: 300, height: 200, crop: 'pad' }
      ]
    });
    // console.log(result)
    const videoSrc = result.secure_url;
    const user = req.body.userId
    const thumbnailSrc = result.eager[0].secure_url;

    const newVideo = new Video({
      title,
      description,
      videoSrc,
      user,
      thumbnailSrc
    });

    await newVideo.save();
    res.status(201).send({ success: true, data: newVideo });
  } catch (error) {
    console.error('Failed to upload video:', error);
    res.status(500).send({ success: false, message: 'Error uploading video', error });
  }
});

module.exports = router;