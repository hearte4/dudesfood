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
//const { check, validationResult } = require('express-validator/check');
//const { check, validationResult } = require('express-validator/check');

mongoose.connect('mongodb://localhost/nodekb');
//mongoose.connect(config.databse);
let db = mongoose.connection;

//check connection
db.once('open', function(){
  console.log('Connected to Mongodb 1');
});

db.once('error', function(err){
  console.log(err);
})

//Init app
const app = express();

// Bring the models
let Article = require('./models/article');

//Load views engine for pug pages
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'pug');

//Load views engine for html pages
app.engine('html', require('ejs').renderFile);
//app.engine('txt'', require('ejs').renderFile);

//static Files
//app.use(express.static('public'));

//Body parser middlewhere -  parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')));

//Express session middleware
//app.use(cookieParser());
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
/*var api = express.Router();
api.use(expressValidator());
const server=express();
server.use(expressValidator());*/

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

  Article.find({},function(err, articles){
    res.render('index', {
      title:'Articles',
      content:'My content',
      articles: articles
    });
  });



 /*let articles = [
    {
      id:1,
      title: 'Article One',
      authoer: 'Elad Heart',
      content: 'This is the content of Article One'
    },
    {
      id:2,
      title: 'Article Two',
      authoer: 'Elad Heart',
      content: 'This is the content of Article Two'
    },
    {
      id:3,
      title: 'Acrticle Three',
      authoer: 'Elad Heart',
      content: 'This is the content of Article Three'
    }
  ];
  res.render('index', {
    title:'Articles',
    content:'My content',
    articles: articles
  });*/
});

//Route Files
let articles = require('./routes/articles');
app.use('/articles',articles);

let users = require('./routes/users');
app.use('/users',users);

let countries = require('./routes/countries');
app.use('/countries',countries);

//route Ajax course
app.get('/ajax1',function(req, res){
  //res.sendFile(__dirname+'/views/ajax1.html');
  res.render('ajax1.html');
});

app.get('/ajax2',function(req, res){
  //res.sendFile(__dirname+'/views/ajax1.html');
  res.render('ajax2.html');
});

app.get('/ajax3',function(req, res){
  //res.sendFile(__dirname+'/views/ajax1.html');
  res.render('ajax3.html');
});

app.get('/autocomplete',function(req, res){
  //res.sendFile(__dirname+'/views/ajax1.html');
  res.render('autocomplete.html');
});

app.get('/arrow',function(req, res){
  //res.sendFile(__dirname+'/views/ajax1.html');
  res.render('arrowfunction.html');
});


app.get('/sample.html',function(req, res){
  //res.sendFile(__dirname+'/views/ajax1.html');
  console.log('get request for sample.html');
  res.render('sample.html');
});

app.get('/sample.txt',function(req, res){
  //res.sendFile(__dirname+'/views/ajax1.html');
  console.log('get request for sample.txt');
  res.render('sample.txt');
});






//route - store messages
app.get('/storemessage', function(req, res){
  req.flash('msg1','I like my life');
  res.send('msg1 message stored');
});

app.get('/getmessage', function(req, res){
  //console.log(req.flash('msg1'));
res.send(req.flash('msg1'));
});

app.get('/requestapi', function(req, res){


        res.header("Content-Type",'application/json');
        res.send(JSON.stringify(req.headers, null, 4));

//res.send(req.route.pretty());
});




//route - add Articles
/*
app.get('/articles/add', function(req, res){
  res.render('add_article', {
    title: 'Add Article',
    content: 'Articles content'
  });
  console.log('Get Request');
});

//route - add article (get)
app.get('/menu', function(req, res){
  res.render('add_article', {
    title: 'Add Article',
    content: 'Articles content'
  });
  console.log('Get Request');
});

//route -  add  article (post), i.e submit post
app.post('/articles/add',
  function(req, res){
    console.log(req.body);
  req.checkBody('title', 'Please set the title').notEmpty();
  req.checkBody('author', 'Please set the author').notEmpty();
  req.checkBody('content', 'Please enter content').notEmpty();

  //Get the errors
  let errors = req.validationErrors();
  console.log(errors);
  if (errors){
    errors.forEach(function(error){
      req.flash("danger", error.msg);
    });
    //req.flash("danger", "There are errors");
    res.render('add_article',{
      title: 'Add Article'
    });
  } else {  //no errors
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.content = req.body.content;
    article.save(function(err){
      if (err){
         console.log(err);
         return;
      } else {
        console.log(req.flash('success'));
        //console.log(res.locals.flash);
        req.flash("success", "Article " +article._id+ " added");
        res.redirect('/');
      }
  } //save function
  );
}// else - no erros
});//post */

//Route - edit article - my own implementation
/*app.post('/articles/edit/:id', function(req, res){
  //let article = {Article.findById(req.params.id)};
  console.log(req.body.content);
  Article.update({ "_id": req.params.id}, {$set:{"title": req.body.title, "content": req.body.content}}, function(err, result){
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });*/
//});

// route - update single article
/*
app.post('/articles/edit/:id', function(req, res){
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.content = req.body.content;
  let query = {_id: req.params.id};
  Article.update(query, article, function(err, result){
    if (err) {
      console.log(err);
    } else {
      req.flash("success",article.title+' successfully updated');
      res.redirect('/articles/'+req.params.id);
    }
  });
});*/

//route - get single article for edit
/*
app.get('/articles/edit/:id', function(req, res){
  var articleId = req.params.id;
  var ObjectId = require('mongodb').ObjectID;
  Article.find({"_id": new ObjectId(articleId)},function(err, articles) {
    console.log(articles);
    res.render('edit_article', {
      title: 'Edit Article',
      article: articles[0]
    });
});
});*/

//route - delete article
/*
app.delete('/article/:id',function(req, res){
  let query = {_id: req.params.id};
  Article.remove(query,function(err){
    if (err){
      console.log(err);
    }
    res.send('');
  });
})*/



/*
//route - get single article readonly (fact sheet)
app.get('/articles/:id', function(req, res){
  var articleId = req.params.id;
  var ObjectId = require('mongodb').ObjectID;
  Article.find({"_id": new ObjectId(articleId)},function(err, articles) {
    console.log(articles);
    res.render('article', {
      title: 'Article '+articles[0].title,
      article: articles[0]
    });
});
}); */




//Start server
app.listen(3001,function(){
  console.log('server started on port 3001..');
  console.log('directory name:'+__dirname);
});

module.exports = app;
