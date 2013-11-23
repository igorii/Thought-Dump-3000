// Pull in the article provider
var articles = require('../lib/articles').provider;

// Create a new provider
var provider = new articles();

// Serve all articles
exports.articles = function (req, res) {
    provider.findAll(function (error, docs) {
        if (error) { 
            res.end(500);
        } else {
            res.send(docs);
        }
    });
};

// TODO: 
// 1) Serve article by id
// 2) Add article
// 3) Paginate articles
