const mongoose = require('mongoose');
const ImageSchema = require('../models/Images');
const Image = mongoose.model('Images', ImageSchema);
const axios = require('axios');

function verifyToken(token) {
  return axios.get('https://api.intra.42.fr/oauth/token/info', {
    headers: {Authorization: token}
  })
  .then(() => true)
  .catch(() => false);
}

function getUserInfos(token) {
  return axios.get("https://api.intra.42.fr/v2/me", {
    headers: {Authorization: token}
  })
  .then((res) => res.data);
}

function postNewImage(body) {
  const { username, userImg, userUrl, title, base64 } = body;

  new Image({
    username,
    userImg,
    userUrl,
    title,
    base64
  }).save((err) => {
    if (err) throw new Error(err);
  });
}

async function getLatestImages(page=0) {
  const skip = page * 5;
  const images = await Image.find()
    .sort({date: 'desc'})
    .skip(skip)
    .limit(10)
    .exec();

  return images;
}


module.exports = { verifyToken, getUserInfos, postNewImage, getLatestImages };