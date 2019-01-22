const express = require('express');
const path = require('path');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring the models
const User = require('../models/user');

const multer = require("multer")
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const config = require ('../config/database.js');
//const upload = multer({ dest: "uploads/" })

//file upload
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




//let upload;

router.get('/register', function(req, res){
  res.render('register');
});

router.post('/register',function(req, res){
  let user = new User();
  let name = req.body.name;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let password2 = req.body.password2;

  //validations
  req.checkBody('name', 'Please enter your name').notEmpty();
  req.checkBody('username', 'Please enter your username').notEmpty();
  req.checkBody('email', 'Please enter your Email').notEmpty().isEmail();
  req.checkBody('password2', 'Please enter password').equals(req.body.password);
  req.check("password2", "Password is illegal").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i");

  let errors = req.validationErrors();
  if (errors)
  {
    console.log(errors);
    errors.forEach(function(error){
        req.flash("danger",error.msg);
    });
    res.render('register',{
      name: req.body.name,
      username:  req.body.username,
      email: req.body.email
    });
  }
 else {
   user.name =  req.body.name;
   user.email =  req.body.email;
   user.username =  req.body.username;

   bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
        if (err){
          console.log(err);
        } else {
          user.password = hash;
          console.log(user);
          //save

          user.save(function(err){
            if (err){
              console.log(err);
            } else {
              req.flash("success","User "+user.name +" registered");
              res.redirect("login");
            }
          });

        }
    });

});


 }

});

//login form
router.get('/login',function(req, res){
    //console.log(req.params);
    //console.log(req.params.username+' '+req.params.password);
  let user = {
  username: req.params.username,
  password: req.params.password
};

  //console.log(user);
  res.render('login',{
  username: /*req.params.username,*/ 'elad@gmail.com',
  password: /*req.params.password*/ 'centk4Ii'
  });
});

//login process
router.post('/login', function(req, res, next){
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/users/login',
                                   failureFlash: true }
  )(req,res,next);
});

//logout
router.get('/logout',function(req, res){
  req.logout();
  req.flash("success","You are now logged out..");
  res.redirect('/users/login');
});

//get all files
router.get('/profile', function(req, res){
  const app = require('../app');
  let gfs = app.get('gridfs-stream');
  //upload = req.fileUploadConfig.upload;
  //upload = app.get('upload');
  console.log('my gfs:'+gfs);
  gfs.files.find().toArray(function(err, files){
    if (!files || files.length==0){
      res.render('userprofile',{files:false, filename:"no file selected"});
    } else {
      files.map(function(file){
          if (file.contentType=='image/jpeg' || file.contentType =='image/png'){
              file.isImage = true;
          } else {
              file.isImage = false;
          }
      });
      console.log(files);
      res.render('userprofile',{files: files});
    }
  });
  //console.log(req.flash('msg1'));
//res.render('fileUpload.html');
});

router.post('/profile',upload.single('file'),
function(req, res){
  //res.json({file:req.file});
  User.findById(req.user._id,function(err, user){
        console.log(user);
        console.log(req.file.id);
    user.avatar = req.file.id;
    //user.name ='Elad Heart';
    user.save(function(err){
      if (err) {
        console.log(err);
      } else {
        req.flash("success", "Your avatar has been updated");
        res.redirect('/');
      /*  res.redirect('userprofile',{
          finename: req.file.filename
        });*/
        /*res.json({file:req.file,
        user: user});*/
      }
    });
  });
});

router.get('/',function(req,res){
  User.find()
  .populate("avatar")
  .exec(function(err,users){
    //res.json(users);
    res.render('users.ejs',{
      users: users
    })
  });
});

router.get('/details',function(req,res){
  User.find()
  .populate("photo")
  .exec(function(err,users){
    res.json(users);

  });
});

router.get('/avatar/:filename',function(req,res){
  console.log(req.params.filename);
  app = require('../app.js');
  gfs =  req.filesConfig.gfs;//app.get('gridfs-stream');
  gfs.files.findOne({filename: req.params.filename}, function(err, file){
    if(!file){
      res.json({err: "file does not exist"});
    }
    else { //file exists
      //res.json(file);

      //check if image
      if (file.contentType == "image/jpeg") {
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({err: "not an image"});
      }

    }
  });
});


/*router.post('/login', function(req, res){
let user = {
  username: req.body.username
};
  console.log(user.username);
User.findOne({"username": user.username}, function(err, user){
  if (err)
  {
    console.log(err);
    req.flash("danger","Intenral error occured");
    res.render('login',{
      username: req.body.username,
      password: req.body.password
    });
  }
  else if (user==null)
  {
    req.flash("danger","Incorrect user or password");
    res.render('login',{
      username: req.body.username,
      password: req.body.password
    });
  }
  else
  {
    console.log(user);
    bcrypt.compare(req.body.password, user.password, function(err, match)
    {
    console.log(match);
    if (match)
      res.redirect('/');
    else {
      req.flash("danger","Incorrect user or password");
      res.render('login',{
        username: req.body.username,
        password: req.body.password
      });
    }
  });
}
});
});*/

module.exports = router;
