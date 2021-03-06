// Post model

var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;
var CommentSchema = require('./comment.js').CommentSchema;

// The schema for blog posts
var PostSchema = new Schema({
    title      : { type: String, unique: true },
    date       : { type: Date,   default: Date.now },
    markdown   : { type: String, default: '' },
    body       : { type: String, default: '' },
    github     : { type: String, default: '' },
    comments   : [CommentSchema]
});

// Create the Post model, mapping onto the articles collection
var Post  = mongoose.model('articles', PostSchema);
var Draft = mongoose.model('drafts',   PostSchema);

// Export the Post model and schema
exports.Draft      = Draft;
exports.Post       = Post;
exports.PostSchema = PostSchema;

