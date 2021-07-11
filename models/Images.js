const mongoose = require('mongoose');
const { Schema } = mongoose;

const ImageSchema = new Schema({
  username: {
    type: String,
    index: true,
  },
  userImg: String,
  userUrl: String,
  likes: Array,
  likesNumber: {
    type: Number,
    index: true
  },
  title: {
    type: String,
    index: true,
  },
  base64: String,
}, { timestamps: true });

module.exports = ImageSchema;
