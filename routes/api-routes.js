
var ObjectId = require('mongoose').Types.ObjectId;

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");


var Article = require("./../models/article.js");
var Comment = require("./../models/comment.js");




//addIfNeeded adds article if it does not exists in database
function addIfNeeded(article) {
    Article.count({ "link": article['link'] }, function( err, count){
       if (err) {
            thorw(err);
        }    
        //this article exists since we were able to find entry in store
        if(count != 0) {
            return;
        }
          // Using our Article model, create a new entry
          // This effectively passes the result object to the entry (and the title and link)
        var entry = new Article(article);
              // Now, save that entry to the db
              entry.save(function(err, doc) {
                // Log any errors
                if (err) {
                    console.log(err);
                }
              });
        });
}

function countNewArticles(articles, callback) {
    var links = [];
    for(var i = 0;i<articles.length;i++) {
        links.push(articles[i].link)
    }
    Article.count({ "link": { $in: links }  }, function(err, count){
        callback(articles.length - count);
    })
}


//screape reads time.com home page to extract articles.
function scrape(callback) {
    request("http://www.time.com/", function(error, response, html) {
            var articles = [];
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(html);

           
             // Now, we grab every article elemnt with 'border-separated-article' class:
                $("article.border-separated-article").each(function(i, element) {
            
                        //the article title is extracted from div h2 a element
                        var link = $(element).find($("div h2 a"));
                        var title = link.text();
                        if(title) {
                            var href = link.attr('href');
                            //the article content is extracted from div p element
                            var content =  $(element).find($("div p")).text();

                            articles.push({
                                'title':title,
                                'link':href,
                                'content':content,
                            })
                        }
                });

               callback(articles);
          })

}

module.exports = function (app) {
    

    //GET  route for scraping  all articles
    app.get("/api/scrape", function (req, res) {
            scrape(function(articles) {
                countNewArticles(articles, function(count) {
                  res.json({
                    'added': count, 
                  });
                })
                for(var i = 0;i<articles.length;i++) {
                   addIfNeeded(articles[i])
                }
            })
    })

    
    // This will get the articles we scraped from the mongoDB
    app.get("/api/articles", function(req, res) {
  
      // Grab every doc in the Articles array
      Article.find({}, function(error, doc) {
        // Log any errors
        if (error) {
          console.log(error);
        }
        // Or send the doc to the browser as a json object
       
      }).populate("comments").exec(function(error, doc) {
           res.json(doc);
      })

    });


     // Grab an article by it's ObjectId
    app.get("/api//articles/:id", function(req, res) {
      // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
      Article.findOne({ "_id": req.params.id })
       // ..and populate all of the notes associated with it
      .populate("comments")
       // now, execute our query
      .exec(function(error, doc) {
        // Log any errors
        if (error) {
          console.log(error);
        }
        // Otherwise, send the doc to the browser as a json object
        else {
          res.json(doc);
        }
      });
    });


     // Grab an article by it's ObjectId
    app.delete("/api/articles/:id", function(req, res) {
      // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
      Article.findOneAndRemove(req.params.id, function (err, doc) {
          if(err) {
              console.log(err);
          } else {
            console.log('removed - sending status back')    
            res.json({status:'ok'})
          }

      });
    });



    // Grab an article by it's ObjectId to add comment
    app.post("/api/articles/:id/comment", function(req, res) {

      // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
      Article.find({ "_id": req.params.id }, function(err, articles) {
            //create new comment document
             var entry = new Comment({
                'body':req.body.comment,
             });
              // Now, save that entry to the db
              entry.save(function(err, doc) {
                // Log any errors
                if (err) {
                    console.log(err);
                } else  {
                    var article = articles[0];
                    //append comment to 
                    article.comments.push(entry);
                    article.save(function(err) {
                        if(err != null) {
                          console.log(err)
                        } else {
                            res.json({status:'ok'})
                        }
                    })
                }
              });
      });
  
  })



     // Grab an article by it's ObjectId
    app.delete("/api/comment/:id", function(req, res) {
      // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
      Comment.findOneAndRemove(req.params.id, function (err, doc) {
          if(err) {
              console.log(err);
          } else {
              res.json({status:'ok'})
          }

      });
    });

   

// Create a new note or replace an existing note
app.post("/api//articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});


}
