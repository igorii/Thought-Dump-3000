// Comment model

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// Comment is a recursively defined model
var CommentSchema = new Schema();
CommentSchema.add({
    date    : { type: Date,            default: Date.now },
    notify  : { type: Boolean,         default: false },
    replies : { type: [CommentSchema], default: [] },
    body    : String,
    user    : String,
    email   : String
});

// Create the Comment model
var Comment = mongoose.model('comment', CommentSchema);

// Export the Comment model and schema
exports.CommentSchema = CommentSchema;
exports.Comment       = Comment;

