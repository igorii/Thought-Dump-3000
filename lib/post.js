var Comment  = require('./comment.js').Comment;
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// The schema for blog posts
var Post = new Schema({
    title      : String,
    date       : Date,
    github     : String,
    body       : String,
    comments   : [Comment]
});

exports = {
    Post: Post
};

