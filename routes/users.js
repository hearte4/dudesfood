const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring the models
const User = require('../models/user');



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
    res.render('register');
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
  username: req.params.username, //'elad@gmail.com'
  password: req.params.password
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
