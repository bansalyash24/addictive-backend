const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoSrc: {
    type: String,
    required: true,
  },
  thumbnailSrc: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
}, { timestamps: true });

const Video = mongoose.model('videos', VideoSchema);

module.exports = Video;
