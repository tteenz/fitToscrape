// require dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");

var PORT = process.env.PORT || 8000;

// initialize Express
var app = express();

// use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json({
  type: "application/json"
}));

// serve the public directory
app.use(express.static("public"));

// use promises with Mongo and connect to the database
var databaseUrl = "news";
mongoose.Promise = Promise;
app.use(logger("dev"));
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/fitToscrape";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);


// use handlebars
app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Hook mongojs configuration to the db variable
var db = require("./models");

// get all articles from the database that are not saved
app.get("/", function (req, res) {

  db.Article.find({
    saved: false
  },

    function (error, dbArticle) {
      if (error) {
        console.log(error);
      } else {
        res.render("index", {
          articles: dbArticle
        });
      }
    })
})

// Axios called to scrape articles
app.get("/scrape", function (req, res) {
  axios.get("https://www.theverge.com/tech").then(function (response) {

    var $ = cheerio.load(response.data);

    // Grab h2 for title and link
    $("h2.c-entry-box--compact__title").each(function (i, element) {

      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      console.log(result);

      // Create a new Article 
      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.redirect("/")
  });
});

// Routes for saved articles
app.get("/saved", function (req, res) {
  db.Article.find({
    saved: true
  })
    .then(function (dbArticle) {
      // Renders with handlebar
      res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function (err) {
      res.json(err);
    })

});

// Routes for saving article
app.put("/saved/:id", function (req, res) {
  db.Article.findByIdAndUpdate(
    req.params.id, {
      $set: req.body
    }, {
      new: true
    })
    .then(function (dbArticle) {
      res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Routes for saving article
app.post("/submit/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      var articleIdFromString = mongoose.Types.ObjectId(req.params.id)
      return db.Article.findByIdAndUpdate(articleIdFromString, {
        $push: {
          notes: dbNote._id
        }
      })
    })
    .then(function (dbArticle) {
      res.json(dbNote);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Routes for finding note
app.get("/notes/article/:id", function (req, res) {
  db.Article.findOne({ "_id": req.params.id })
    .populate("notes")
    .exec(function (error, data) {
      if (error) {
        console.log(error);
      } else {
        res.json(data);
      }
    });
});


app.get("/notes/:id", function (req, res) {

  db.Note.findOneAndRemove({ _id: req.params.id }, function (error, data) {
    if (error) {
      console.log(error);
    } else {
    }
    res.json(data);
  });
});

// Listening
app.listen(PORT, function () {
  console.log("App is running on port " + PORT + "!");
});