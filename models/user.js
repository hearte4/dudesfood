let mongoose = require('mongoose');
let File = require('./file');

let userSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  avatar:{
        type    : mongoose.Schema.Types.ObjectId,
        ref     : 'File',
        required: false
    },
});

const User = module.exports = mongoose.model('User',userSchema);
