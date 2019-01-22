const express = require('express');
const router = express.Router();

// Bring the models
let Recipe = require('../models/recipe');
let User = require('../models/user');

//app variables



//route - add recipes
router.get('/add',ensureAuthenticated, function(req, res){
  res.render('add_recipe', {
    title: 'Add recipe',
    ingredients: 'recipes ingredients'
  });
  console.log('Get Request');
});



//route -  add  recipe (post), i.e submit post
router.post('/add',
  function(req, res){
    console.log(req.body);
  req.checkBody('title', 'Please set the title').notEmpty();
  //req.checkBody('author', 'Please set the author').notEmpty();
  req.checkBody('ingredients', 'Please enter ingredients').notEmpty();

  //Get the errors
  let errors = req.validationErrors();
  console.log(errors);
  if (errors){
    errors.forEach(function(error){
      req.flash("danger", error.msg);
    });
    //req.flash("danger", "There are errors");
    res.render('add_recipe',{
      title: 'Add recipe'/*,
      errors: errors*/
    });
  } else {  //no errors
    let recipe = new Recipe();
    recipe.title = req.body.title;
    recipe.author = req.user._id;//req.body.author;
    recipe.user = req.user._id;
    recipe.ingredients = req.body.ingredients;
    recipe.process = req.body.process;
    recipe.save(function(err){
      if (err){
         console.log(err);
         return;
      } else {
        console.log(req.flash('success'));
        //console.log(res.locals.flash);
        //req.flash("success", "recipe " +recipe._id+ " added");
        req.flash("success", "New recipe successfully added");
        res.redirect('/');
      }
  } //save function
  );
}// else - no erros
});//post

// route - update single recipe
router.post('/edit/:id', function(req, res){
  let recipe = {};
  recipe.title = req.body.title;
  //recipe.author = req.user._id; //no need to update the
  recipe.ingredients = req.body.ingredients;
  recipe.process = req.body.process;
  let query = {_id: req.params.id};
  Recipe.update(query, recipe, function(err, result){
    if (err) {
      console.log(err);
    } else {
      req.flash("success",recipe.title+' successfully updated');
      res.redirect('/recipes/'+req.params.id);
    }
  });
});

//route - get single recipe for edit
router.get('/edit/:id',ensureAuthenticated, function(req, res){
  var recipeId = req.params.id;
  var ObjectId = require('mongodb').ObjectID;

  const app = require('../app');
  let user = app.get('user');
  console.log('user is:'+user);

  Recipe.find({"_id": new ObjectId(recipeId)},function(err, recipes) {
  if (recipes[0].author==user._id /*req.user._id*/)
  {
    //console.log(recipes);
    //console.log('user is:'+user);
      res.render('edit_recipe', {
        title: 'Edit your '+recipes[0].title +' recipe',
        recipe: recipes[0]
      });
    }
  else {
      req.flash('danger','Insufficient privileges');
      res.redirect('/recipes/'+req.params.id);
  }
});
});

//route - delete recipe
router.delete('/:id',function(req, res){
  //const app = require('../app');
  //let user = app.get('user');
    console.log('user in delete '+req.user._id);
  if (!req.user._id)
      res.status(500).send();
  let query = {_id: req.params.id};
  recipe.findById(req.params.id, function(err, recipe){
      console.log('recipe findById '+recipe);
    if (recipe.author == req.user._id) {
      recipe.remove(query,function(err){
          console.log('deleting recipe');
        if (err){
          console.log('error on delete'+err);
        }
        res.send('');
      });
    } else {
       res.status(500).send();
        req.flash('danger','You are not allowed to delete this recipe');
        res.redirect('/');
    }
  });

})


//route - get single recipe readonly (fact sheet)
router.get('/:id'/*,ensureAuthenticated*/, function(req, res){
  var recipeId = req.params.id;
  var ObjectId = require('mongodb').ObjectID;
  console.log('recipeId '+recipeId);
  Recipe.find({"_id": new ObjectId(recipeId)},function(err, recipes) {
    //console.log(recipes[0]);
    let query = {_id: recipes[0].author};
    User.findOne(query, function(err, user){
        console.log('searchig for the author');
        let author;
      if (user)
      {
        author = user.name
      }
      else {
        author =recipes[0].author
      }
      console.log('no error'+user);
      res.render('recipe', {
        title: recipes[0].title,
        recipe: recipes[0],
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
