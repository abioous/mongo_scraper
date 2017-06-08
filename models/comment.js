

// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;


// Create the Comment schema
var CommentSchema = new Schema({
  // Just a string
  body: {
    type: String
  }
});


// Create the Commennt model with the CommentSchema
var Comment = mongoose.model("Comment", CommentSchema);

// Export the Note model
module.exports = Comment;

