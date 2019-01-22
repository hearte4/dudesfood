//console.log("Hello World");

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
//const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const config = require ('./config/database.js');
const passport = require('passport');

//file Upload
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const grid = require('gridfs-stream');
const methodoverride = require('method-override');

//Init app
const app = express();

//mongoose.connect('mongodb://localhost/nodekb');
mongoose.connect(config.database);
let conn = mongoose.connection;

//gridfs-stream
let gfs;
//Init stream
conn.once('open', function () {
   gfs = grid(conn.db, mongoose.mongo);
   gfs.collection('uploads');
   app.set('gridfs-stream', gfs);
  // all set!
})

//create storage
const storage = new GridFsStorage({
  url: config.database,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });
//to be used in routes
app.set('upload', upload);

//check connection
conn.once('open', function(){
  console.log('Connected to Mongodb 1');
});

conn.once('error', function(err){
  console.log(err);
})



// Bring the models
let Recipe = require('./models/recipe');

//Load views engine for pug pages
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'pug');

//Load views engine for html pages
app.engine('html', require('ejs').renderFile);
//app.engine('txt'', require('ejs').renderFile);

//Body parser middlewhere -  parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')));

//Express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express validator
app.use(expressValidator());  //this line to be addded

//Passport middleware
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

//session user
app.get('*', function(req, res, next){
  app.locals.user = req.user || null;
  console.log('global var user: '+ req.user || null);
  app.set('user',req.user);
  next();
});

//Home Route
app.get('/',function(req, res){
  Recipe.find()
      .populate({path : 'user', populate : {path : 'avatar'}}) // works
      .exec(function (err, recipes) {
        console.log(recipes);
        res.render('index', {
          title:'Recipes',
          content:'My content',
          recipes: recipes
        });
      });
});


//Route Files
let recipes = require('./routes/recipes');
app.use('/recipes',recipes);

let users = require('./routes/users');
app.use('/users',function(req,res,next){
  req.filesConfig = {
    gfs: gfs
  }
  next();
}, users);


//Start server
app.listen(3002,function(){
  console.log('server started on port 3002..');
  console.log('directory name:'+__dirname);
});

module.exports = app;
