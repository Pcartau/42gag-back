const mongoose = require('mongoose');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser')
const app = express();
const port = process.env.PORT || 3000;
const { verifyToken, getUserInfos, postNewImage, getLatestImages } = require('./src/functions');
const secret = 'f2e69704ea9d781489a7b6796b571c804ca9173e2ad4350fa02d306bb7c1afa7';


mongoose.connect(`mongodb+srv://pcartau:L2p8913YZ6hULCMU@cluster0.ro61w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('[GATEWAY]: Connected to Database');
});


const publicRoutes = ['/login'];

app.use(bodyParser.json());
app.use((req, res, next) => {
  if (publicRoutes.includes(req.path)) {
    return next();
  }
  verifyToken(req.headers.authorization).then((valid) => {
    if (valid) {
      next();
    } else {
      res.sendStatus(401);
    }
  });
});


app.post('/auth', (req, res) => {
  if (!req.body.code) {
    return res.sendStatus(400);
  }

  axios.post('https://api.intra.42.fr/oauth/token', {
    "grant_type": "authorization_code",
    "client_id": "e7233ee8c8e4af846bda55aad3a6e99d9a2ff94e1e49c007f69320f647c55083",
    "client_secret": secret,
    "code": req.body.code,
    "redirect_uri": "http://localhost:3000"
  }).then((data) => {
    res.send(data.data);
  }).catch(() => {
    res.sendStatus(400);
  });
});


app.get('/homepage/:page', async(req, res) => {
  const images = await getLatestImages(req.params.page);

  res.send(images);
});


app.post('/image', async(req, res) => {
  const userData = await getUserInfos(req.headers.authorization);
  
  postNewImage({
    username: userData.login,
    userImg: userData.image_url,
    userUrl: userData.url,
    title: req.body.title,
    base64: req.body.base64,
  }).catch(() => res.sendStatus(500));

  res.sendStatus(200);
});


app.listen(port);