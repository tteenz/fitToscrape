//Dependencies
var express = require('express')
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var logger = require("morgan");
// var axios = require("axios");
// var cheerio = require("cheerio");

//Models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var methodOverride = require("method-override");
mongoose.Promise = Promise;

//initialize express
var app = express()
var router = express.Router();

//
require("./routes/routes")(router);
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static("public"));
app.use(router);

// Database configuration with mongoose
// mongoose.connect("mongodb://localhost/mongo-news-scraper");
//define local mongoDB URI
if(process.env.MONGODB_URI){
	//THIS EXECUTES IF THIS IS IN HEROKU
	mongoose.connect(process.env.MONGODB_URI);
}else {
	mongoose.connect("mongodb://localhost/fitToscrape")
}

var db = mongoose.connection;

// Set up Handlebars.
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(methodOverride("_method"));

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Connection successful.");
});

// Listen on port 3030
app.listen(process.env.PORT || 3030, function() {
  console.log("App running on port 3030!");
});
