// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
/*mongoose.Promise = Promise;*/


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
var promise = mongoose.connect("mongodb://localhost/nyt-scraper", {useMongoClient: true}, function(error) {
  if (error) {
    console.log("Mongoose Error: ", error);
  }
});

// Routes
// ======

// A GET request to scrape the NYT website
app.get("/scrape", function(req, res) {

  // First, we grab the body of the html with request
  request("https://www.nytimes.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    let result = [];
    // Now, we grab every h2:
    $("h2.story-heading").each(function(i, element) {

      let article = {};
      // Add the text and href of every link, and save them as properties of the result object
      let title = $(element).children("a").text();
      let link = $(element).children("a").attr("href");

      article.title = title;
      article.link = link;
      result.push(article);

/*        let entry = new Article(result);

        entry.save(function(err, doc) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(doc);
          }
        })*/
    });
    res.json(result);
    console.log("Scrape complete");
  });
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {


  // TODO: Finish the route so it grabs all of the articles

  Article.find({}, function(err, data) {
    if (err) {
      res.send(err);
    }
    else {
      res.send(data);
    }
  });

});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {


  // TODO
  // ====

  // Finish the route so it finds one article using the req.params.id,

  // and run the populate method with "note",

  // then responds with the article with the note included

  Article.findOne({"_id" : req.params.id}).populate("note").exec(function(err, data) {
    if (err) {
      res.send(err)
    }
    else {
      res.send(data);
    }
  })
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {


  // TODO
  // ====

  // save the new note that gets posted to the Notes collection

  // then find an article from the req.params.id

  // and update it's "note" property with the _id of the new note

  var newNote = new Note(req.body);
  newNote.save(function(err, data) {
    if (err) {
      res.send(err)
    }
    else {
      Article.findOneAndUpdate({"_id" : req.params.id}, {"note": data._id}, {new: true}, function(err, data) {
        if (err) {
          res.send(err);
        }
      })
    }
  });
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});