let mongoose = require('mongoose');

let countrySchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  code:{
    type: String,
    required: true,
    min: 2,
    max: 2
  }
});

let Country = module.exports = mongoose.model('Country', countrySchema);
