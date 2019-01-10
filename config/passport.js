const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcryptjs');


module.exports = function(passport){
  passport.use(new LocalStrategy( function(username,password,done){
  let query = {username: username};
  User.findOne(query, function(err,user){
    if (err) { return done(err); }
    if (!user){
      console.log(user);
      return done(null, false, { message: 'Incorrect username.' });
    }
    console.log(user);
    bcrypt.compare(password, user.password, function(err, match){
      console.log(match);
      if(!match)
        return done(null, false, { message: 'Incorrect password.' });
      else {
        return done(null, user,  { successFlash: 'Welcome!' });
      }
    });
  });
  }));
}

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
