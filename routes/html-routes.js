
var Article = require("./../models/article.js");


module.exports = function(app) {


  app.get("/", function(req, res) {
      //n query parameters stores number of new articles
      var added =  req.query.n || 0;
      //home needs to be present for menu to be highlighted
      //user presence will drive either profile or login menu option
      res.render('index', {'home':true, 'added':added, 'addedCount':added})
  });



  app.get("/articles", function(req, res) {
       var added =  req.query.n || 0;
        // Grab every doc in the Articles array
      Article.find({}, function(error, doc) {
        // Log any errors
        if (error) {
          console.log(error);
        }
        // Or send the doc to the browser as a json object
       
      }).populate("comments")
      .exec(function(error, doc) {
            res.render('articles', {'articles':doc, 'added':added, 'addedCount':added})
      })

  });



}