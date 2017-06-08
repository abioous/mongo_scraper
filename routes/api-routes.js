
var ObjectId = require('mongoose').Types.ObjectId;

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");


var Article = require("./../models/article.js");





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

                console.log(articles);

               var newCount = 0;
                for(var i = 0;i<articles.length;i++) {
                    
                    var article = articles[i];

                        var addIfNeeded = function(article) {
                            Article.count({ "link": article['link'] }, function( err, count){
                               if (err) {
                                    thorw(err);
                                }

                                //if article linkg does not exists create anew article
                                if(count == 0) {
                                  newCount++
                                  
                                  console.log('adding article')
                                  console.log(articles[i]);

                                  // Using our Article model, create a new entry
                                  // This effectively passes the result object to the entry (and the title and link)
                                var entry = new Article(articles[i]);
                                      // Now, save that entry to the db
                                      entry.save(function(err, doc) {
                                        // Log any errors
                                        if (err) {
                                            console.log(err);
                                        }
                                      });
                                }
                             });
                      }
                      addIfNeeded(a)
                }
                res.json({
                  'articles': articles, 
                });
            })
    })


    
    // This will get the articles we scraped from the mongoDB
    app.get("/api/articles", function(req, res) {
      
        console.log('reading articles');

      // Grab every doc in the Articles array
      Article.find({}, function(error, doc) {
        // Log any errors
        if (error) {
          console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
          res.json(doc);
        }
      });
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
          
          console.log('removing ' + req.params.id)
          if(err) {
              console.log(err);
          } else {
              console.log(doc)

          }

      });
    });




 // story1.save(function (err) {
 //    if (err) return handleError(err);
 //    // thats it!
 //  });
 //  //then add story to person
 //  aaron.stories.push(story1);
 //  aaron.save(callback);



// FBFriendModel.find({
//     id: 333
// }, function (err, docs) {
//     docs.remove(); //Remove all the documents that match!
// });

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
