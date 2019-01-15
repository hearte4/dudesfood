const express = require('express');
const router = express.Router();

// Bring the models
let Article = require('../models/article');
let User = require('../models/user');

//app variables



//route - add Articles
router.get('/add',ensureAuthenticated, function(req, res){
  res.render('add_article', {
    title: 'Add Article',
    content: 'Articles content'
  });
  console.log('Get Request');
});



//route -  add  article (post), i.e submit post
router.post('/add',
  function(req, res){
    console.log(req.body);
  req.checkBody('title', 'Please set the title').notEmpty();
  //req.checkBody('author', 'Please set the author').notEmpty();
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
      title: 'Add Article'/*,
      errors: errors*/
    });
  } else {  //no errors
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;//req.body.author;
    article.content = req.body.content;
    article.save(function(err){
      if (err){
         console.log(err);
         return;
      } else {
        console.log(req.flash('success'));
        //console.log(res.locals.flash);
        //req.flash("success", "Article " +article._id+ " added");
        req.flash("success", "New article successfully added");
        res.redirect('/');
      }
  } //save function
  );
}// else - no erros
});//post

// route - update single article
router.post('/edit/:id', function(req, res){
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
});

//route - get single article for edit
router.get('/edit/:id',ensureAuthenticated, function(req, res){
  var articleId = req.params.id;
  var ObjectId = require('mongodb').ObjectID;

  const app = require('../app');
  let user = app.get('user');
  console.log('user is:'+user);

  Article.find({"_id": new ObjectId(articleId)},function(err, articles) {
  if (articles[0].author==user._id/*req.user._id*/)
  {
    //console.log(articles);
    //console.log('user is:'+user);
      res.render('edit_article', {
        title: 'Edit Article',
        article: articles[0]
      });
    }
  else {
      req.flash('danger','Insufficient privileges');
      res.redirect('/articles/'+req.params.id);
  }
});
});

//route - delete article
router.delete('/:id',function(req, res){
  //const app = require('../app');
  //let user = app.get('user');
    console.log('user in delete '+req.user._id);
  if (!req.user._id)
      res.status(500).send();
  let query = {_id: req.params.id};
  Article.findById(req.params.id, function(err, article){
      console.log('article findById '+article);
    if (article.author == req.user._id) {
      Article.remove(query,function(err){
          console.log('deleting article');
        if (err){
          console.log('error on delete'+err);
        }
        res.send('');
      });
    } else {
       res.status(500).send();
        req.flash('danger','You are not allowed to delete this article');
        res.redirect('/');
    }
  });

})


//route - get single article readonly (fact sheet)
router.get('/:id'/*,ensureAuthenticated*/, function(req, res){
  var articleId = req.params.id;
  var ObjectId = require('mongodb').ObjectID;
  console.log('articleId '+articleId);
  Article.find({"_id": new ObjectId(articleId)},function(err, articles) {
    //console.log(articles[0]);
    let query = {_id: articles[0].author};
    User.findOne(query, function(err, user){
        console.log('searchig for the author');
        let author;
      if (user)
      {
        author = user.name
      }
      else {
        author =articles[0].author
      }
      console.log('no error'+user);
      res.render('article', {
        title: 'Article '+articles[0].title,
        article: articles[0],
        author: author
      });
    });
});
});

function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash('danger','Please log in');
      res.redirect('/users/login');
    }
  }


module.exports = router;
