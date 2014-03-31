var mongoose = require('mongoose');
var uuid   = require('node-uuid');    // uuid/guid
var mongo  = require('mongodb');      // Db
var marked = require('marked');       // Markdown compilation
var hljs   = require('highlight.js'); // Syntax colouring

// Setup the markdown compiler
marked.setOptions({
    gfm: true,
    highlight: function (code, lang) {
        // TODO: support lang since it's provided
        return hljs.highlightAuto(code).value;
    },
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    langPrefix: 'lang-'
});

/**
 * Articles constructor
 */
//Articles = function (host, port) {
//    this.db = new mongo.Db('blog', new mongo.Server(host, port, {
//        auto_reconnect: true,
//        safe: false,
//        w: 0
//    }, {}));
//
//    this.db.open(function () {
//    });
//};
//
//Articles.prototype.getArticlesFromDb = function (callback) {
//    this.db.collection('articles', function (error, coll) {
//        if (error) callback(error);
//        else callback(null, coll);
//    });
//};
//
//Articles.prototype.getDraftsFromDb = function (callback) {
//    this.db.collection('drafts', function (error, coll) {
//        if (error) callback(error);
//        else callback(null, coll);
//    });
//};
//
///**
// * Find every article.
// */
//Articles.prototype.findAll = function (callback) {
//    this.getArticlesFromDb(function (error, coll) {
//        if (error) return callback(error);
//
//        coll.find().toArray(function (error, array) {
//            if (error) callback(error);
//            else callback(null, array);
//        });
//    });
//};
//
///**
// * Find every draft.
// */
//Articles.prototype.findDrafts = function (callback) {
//    this.getDraftsFromDb(function (error, coll) {
//        if (error) return callback(error);
//
//        coll.find().toArray(function (error, array) {
//            if (error) callback(error);
//            else callback(null, array);
//        });
//    });
//};
//
///*
// * Find a specific article by ID.
// */
//Articles.prototype.findById = function (id, callback) {
//    this.getArticlesFromDb(function (error, coll) {
//        if (error) return callback(error);
//
//        coll.findOne({
//            _id: coll.db.bson_serializer.ObjectID.createFromHexString(id)
//        }, function (error, result) {
//            if (error) callback(error);
//            else callback(null, result);
//        });
//    });
//};
//
///*
// * Find a specific article by ID.
// */
//Articles.prototype.findDraftById = function (id, callback) {
//    this.getDraftsFromDb(function (error, coll) {
//        if (error) return callback(error);
//
//        coll.findOne({
//            _id: coll.db.bson_serializer.ObjectID.createFromHexString(id)
//        }, function (error, result) {
//            if (error) callback(error);
//            else callback(null, result);
//        });
//    });
//};
//
///**
// * Given an article, with an existing _id, update the matching
// * article in the database. Doing it this way allows comments and
// * metadata to persist.
// */
//Articles.prototype.update = function (article, callback) {
//    var that = this;
//
//    this.getArticlesFromDb(function (error, coll) {
//        if (error) return callback(error);
//
//        that.findById(article._id, function (error, old) {
//            if (error) return callback(error);
//
//            // Replace the old body with the new
//            old.title  = article.title;
//            old.body   = article.body;
//            old.github = article.github;
//
//            // Devel toggle to clear comments
//            old.comments = [];
//
//            // Save the article with the new body in place
//            coll.save(old, function () {
//                if (callback) callback(null, old);
//            });
//        });
//    });
//};
//
///**
// */
//Articles.prototype.replyTo = function (parentID, comment, callback) {
//    var that = this;
//
//    this.getArticlesFromDb(function (error, coll) {
//        if (error) return callback(error);
//
//        that.findById(comment._id, function (error, article) {
//            if (error) return callback(error);
//
//            comment.date       = new Date();
//            comment.replies    = [];
//            comment._id        = uuid.v4();  // Create a new uuid for the comment
//
//            // Find the parent comment
//            var i, j;
//            for (i = 0, j = article.comments.length; i < j; ++i) {
//                // If not the correct parent comment, skip it
//                if (article.comments[i]._id !== parentID)
//                    continue;
//
//                // Add the comment as a reply to the parent
//                article.comments[i].replies.push(comment);
//                break;
//            }
//
//            // Save the article with the new body in place
//            coll.save(article, function () {
//                if (callback) callback(null, article);
//            });
//        });
//    });
//};
//
///**
// * Given a comment with the same _id as an article, add the comment
// * to the array of comments for the article and timestamp it.
// */
//Articles.prototype.comment = function (comment, callback) {
//    var that = this;
//
//    this.getArticlesFromDb(function (error, coll) {
//        if (error) return callback(error);
//
//        that.findById(comment._id, function (error, article) {
//            if (error) return callback(error);
//
//            comment.date       = new Date();
//            comment.replies    = [];
//            comment._id        = uuid.v4();  // Create a new uuid for the comment
//
//            article.comments.push(comment);
//
//            // Save the article with the new body in place
//            coll.save(article, function () {
//                if (callback) callback(null, article);
//            });
//        });
//    });
//};
//
///**
// * Save lists of articles of individual articles. Takes a
// * markdown article and converts it to html, while saving the
// * markdown source in a separate table.
// */
//Articles.prototype.publish = function (articles, callback) {
//    this.getArticlesFromDb(function (error, coll) {
//        if (error) return callback(error);
//
//        var article = null;
//
//        // Enlist the articles data if it is a single article
//        if (typeof(articles.length) === "undefined")
//            articles = [articles];
//
//        articles = articles.map(function (entry) {
//
//            // Create the new article entry
//            article = {
//                 title      : entry.title,
//                 date       : entry.created,
//                 github     : entry.github,
//                 comments   : []
//            };
//
//            // Save markdown entries
//            if (entry.markdown)
//                article.body = marked(entry.markdown);
//
//            return article;
//        });
//
//        coll.insert(articles, function () {
//            if (callback) callback(null, articles);
//        });
//    });
//};
//
///**
// * Save lists of articles of individual articles. Takes a
// * markdown article and converts it to html, while saving the
// * markdown source in a separate table.
// */
//Articles.prototype.save = function (articles, callback) {
//    this.getDraftsFromDb(function (error, coll) {
//        if (error) return callback(error);
//
//        var article = null;
//
//        // Enlist the articles data if it is a single article
//        if (typeof(articles.length) === "undefined")
//            articles = [articles];
//
//        articles = articles.map(function (entry) {
//            return {
//                 title      : entry.title,
//                 github     : entry.github,
//                 body       : entry.markdown
//            };
//        });
//
//        coll.insert(articles, function () {
//            if (callback) callback(null, articles);
//        });
//    });
//};
//
//// Finally, export the provider
//exports.provider = Articles;
