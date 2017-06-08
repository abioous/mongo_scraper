
var Article = require("./../models/article.js");


module.exports = function(app) {


  app.get("/", function(req, res) {
      //home needs to be present for menu to be highlighted
      //user presence will drive either profile or login menu option
      res.render('index', {home:true})
  });



  app.get("/articles", function(req, res) {
      
        // Grab every doc in the Articles array
      Article.find({}, function(error, doc) {
        // Log any errors
        if (error) {
          console.log(error);
        } else {
            //render.article doucment
            console.log(doc)
            res.render('articles', {articles:doc})
        }
      });

  });



}