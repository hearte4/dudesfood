let mongoose = require('mongoose');
let User = require('./user');

let recipeSchema = mongoose.Schema({
  title:{
    type: String,
    required: true,
  },
  author:{
    type: String,
    required: true
  },
  user: {
        type    : mongoose.Schema.Types.ObjectId,
        ref     : 'User',
        required: true
    },
  ingredients:{
    type: String,
    required: true
  },
  process:{
    type: String,
    required: true
  }
});

recipeSchema.virtual('fullname').get(function() {
    User.findById(this.author, function(err, user){
      console.log('in recipeSchema.virtual '+ user);
        return user.name;
    });
    //this.first + ' ' + this.last;
});

let Recipe = module.exports = mongoose.model('Recipe', recipeSchema);
