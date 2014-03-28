var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

// Comment is a recursively defined model
var Comment = new Schema();

Comment.add({
    date    : Date,
    body    : String,
    user    : String,
    notify  : Boolean,
    email   : String,
    replies : [Comment]
});

exports = {
    Comment: Comment
};

