// Pull in the article provider
var articles = require('../lib/articles').provider;

// Create a new provider
var provider = new articles();

var user = 'user';
var pass = 'pass';

// Serve all articles
exports.articles = function (req, res) {
    provider.findAll(function (error, docs) {
        if (error) { 
            res.status(500).end();
        } else {
            res.send(docs);
        }
    });
};

exports.save = function (req, res) {
    // TODO: Do proper auth, not this makeshift garbage
    if (req.param('user') !== user || req.param('pass') !== pass)
        return res.status(401).send('Unauthorized');

    // If authorized, save the article
    provider.save({
        title : req.param('title'),
        markdown : req.param('markdown')
    }, function (error, docs) {
        if (error) {
            res.status(500).end();
        } else {
            res.redirect('/');
        }
    });
};

// TODO: 
// 1) Serve article by id
// 2) Add article
// 3) Paginate articles
