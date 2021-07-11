const mongoose = require('mongoose');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser')
const app = express();
const port = process.env.PORT || 3000;
const { verifyToken, getUserInfos, postNewImage, getLatestImages, likeImage } = require('./src/functions');
const secret = process.env.SECRET;
const mongoKey = process.env.MONGO;


mongoose.connect(`mongodb+srv://pcartau:${mongoKey}@cluster0.ro61w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('[GATEWAY]: Connected to Database');
});


const publicRoutes = ['/auth'];

app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({limit: '1mb'}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
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
    "redirect_uri": "https://42gag.netlify.app/login"
  }).then((data) => {
    res.send(data.data);
  }).catch((e) => {
    res.sendStatus(400);
  });
});


app.get('/homepage/:page', async(req, res) => {
  const images = await getLatestImages(req.params.page);

  res.send(images);
});


app.post('/image', async(req, res) => {
  const userData = await getUserInfos(req.headers.authorization);
  const title = req.body.title;
  
  title.length = 100;
  postNewImage({
    username: req.body.hidden ? 'anonym' : userData.login,
    userImg: req.body.hidden ? 'https://www.cregybad.org/wp-content/uploads/2017/10/user.png' : userData.image_url,
    userUrl: req.body.hidden ? 'https://profile.intra.42.fr/users/norminet' : `https://profile.intra.42.fr/users/${userData.login}`,
    title: req.body.title,
    base64: req.body.base64,
    likes: [],
    likesNumber: 0,
  });

  res.sendStatus(200);
});


app.post('/like/:image_id', async(req, res) => {
  const userData = await getUserInfos(req.headers.authorization);

  await likeImage(userData.login, req.params.image_id);
  res.sendStatus(200);
});

app.listen(port);