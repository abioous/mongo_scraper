

var express = require("express");
var exphbs  = require('express-handlebars');
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var methodOverride = require('method-override')


// Setting up port and requiring models for syncing
var PORT = process.env.PORT || 8080;


// Creating express app and configuring middleware needed for authentication
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'))


app.use(express.static("public"));

// use handelbar as temple engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');




// Database configuration with mongoose
mongoose.connect("mongodb://localhost/article");
var db = mongoose.connection;


// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});



// Requiring our routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app, db);



app.listen(PORT, function() {
    console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
});
