// require dependencies
var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var axios = require("axios");

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
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/fitToscrape";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true});
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

// use cheerio to scrape stories from TechCrunch and store them
app.get("/scrape", function (req, res) {
  axios("https://www.theverge.com/tech", function (error, response, html) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(html);
    $("h2.c-entry-box--compact__title").each(function (i, element) {

      // trim() removes whitespace because the items return \n and \t before and after the text
      var title = $(element).find("h2.c-entry-box--compact__title").text().trim();
      var link = $(element).find("h2.c-entry-box--compact__title").attr("href");
      // if these are present in the scraped data, create an article in the database collection
      if (title && link) {
        db.Article.create({
          title: title,
          link: link
        },
          function (err, inserted) {
            if (err) {
              // log the error if one is encountered during the query
              console.log(err);
            } else {
              // otherwise, log the inserted data
              console.log(dbArticle);
            }
          });
        // if there are 10 articles, then return the callback to the frontend
        console.log(i);
        if (i === 10) {
          return res.sendStatus(200);
        }
      }
    });
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