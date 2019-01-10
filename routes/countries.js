const express = require('express');
const router = express.Router();

// Bring the models
let Country = require('../models/country');

//route - add Articles
router.get('/all', function(req, res){
  //console.log(req.query.query);
  let searchText = req.query.query;
  //  console.log("searchText: "+searchText);

//where searchText is substring of country name or searchText is substring of code
//let query =   {$or: [ {"name": new RegExp(searchText, 'i')}, {"code": new RegExp(searchText, 'i')}] };
let query =    {"description": new RegExp(searchText, 'i')};
//let query =  {"name": /searchText/);
console.log(query);
Country.find(query,{ "description": true },function(err, countries){
  //console.log(countries);
  res.send(countries);
});

//res.write(Country.find({}));
});



module.exports = router;
