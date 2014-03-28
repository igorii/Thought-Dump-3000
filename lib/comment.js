// Comment model

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// Comment is a recursively defined model
var CommentSchema = new Schema();
CommentSchema.add({
    date    : Date,
    body    : String,
    user    : String,
    notify  : Boolean,
    email   : String,
    replies : [CommentSchema]
});


// Create the Comment model
var Comment = mongoose.model('comment', CommentSchema);

// Export the Comment model and schema
exports.CommentSchema = CommentSchema;
exports.Comment       = Comment;

