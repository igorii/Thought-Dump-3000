// Pull in the article provider
var Provider = require('../lib/articles').provider;

// Create a new provider
var provider = new Provider('localhost', 27017);

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

exports.single = function (req, res) {
    provider.findById(req.params.id, function (error, doc) {
        if (error || doc === null) {
            res.status(500).end();
        } else {
            res.render('article', {
                article: doc
            });
        }
    });
};

exports.all = function (req, res) {
    provider.findAll(function (error, docs) {
        if (error) {
            res.status(500).end();
        } else {
            res.render('blog', {
                articles: docs.sort(function (a1, a2) { 
                    return a1.created_at < a2.created_at;
                })
            });
        }
    });
};

exports.create = function (req, res) {
    res.render('create');
};

exports.save = function (req, res) {
    // TODO: improve this
    if (req.param('user') !== user || req.param('pass') !== pass)
        return res.status(401).send('Unauthorized');

    // If authorized, save the article
    provider.save({
        title    : req.param('title'),
        created  : req.param('created') !== '' ? new Date(req.param('created')) : new Date(), 
        markdown : req.param('markdown')
    }, function (error, docs) {
        if (error) {
            res.status(500).end();
        } else {
            res.redirect('/blog');
        }
    });
};

// TODO: 
// 1) Serve article by id
// 2) Add article
// 3) Paginate articles
