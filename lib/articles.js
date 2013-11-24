var mongo  = require('mongodb');
var marked = require('marked');       // Markdown compilation
var hljs   = require('highlight.js'); // Syntax colouring

// Setup the markdown compiler
marked.setOptions({
    gfm: true,
    highlight: function (code, lang) {
        // TODO: support lang since it's provided
        return hljs.highlightAuto(code).value
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
Articles = function (host, port) {
    this.db = new mongo.Db('blog', new mongo.Server(host, port, {
        auto_reconnect: true,
        safe: false,
        w: 0
    }, {}));

    this.db.open(function () {
        console.log('Database opened'); 
    });
};

Articles.prototype.getArticlesFromDb = function (callback) {
    this.db.collection('articles', function (error, coll) {
        if (error) callback(error);
        else callback(null, coll);
    });
};

/**
 * Find every article.
 */
Articles.prototype.findAll = function (callback) {
    this.getArticlesFromDb(function (error, coll) {
        console.log('Got collection');
        console.log(error, coll.find);
        if (error) return callback(error);

        coll.find().toArray(function (error, array) {
            console.log(array);
            if (error) callback(error);
            else callback(null, array);
        });;
    });
};


/*
 * Find a specific article by ID.
 */
Articles.prototype.findById = function (id, callback) {
    this.getArticlesFromDb(function (error, coll) {
        if (error) return callback(error);

        coll.findOne({
            _id: coll.db.bson_serializer.ObjectID.createFromHexString(id)
        }, function (error, result) {
            if (error) callback(error);
            else callback(null, result);
        });
    });
};

/**
 * Save lists of articles of individual articles. Takes a 
 * markdown article and converts it to html, while saving the
 * markdown source in a separate table.
 */
Articles.prototype.save = function (articles, callback) {
    this.getArticlesFromDb(function (error, coll) {
        if (error) return callback(error);

        var article = null;
        var toInsert = [];

        // Enlist the articles data if it is a single article
        if (typeof(articles.length) === "undefined")
            articles = [articles];

        for (var i = 0; i < articles.length; i++) {

            // Create the new article entry
            article = {
                title      : articles[i].title,
                comments   : articles[i].comments,
                created_at : new Date()
            };

            // Save markdown entries
            if (articles[i].markdown)
                article.body = marked(articles[i].markdown);

            if (article.comments === undefined)
                article.comments = [];

            // Set the date for each comment to now
            for (var j = 0; j < article.comments.length; j++) {
                article.comments[j].created_at = new Date();
            }

            // Add the article and save it's source
            //this.articles.push(article);
            //this.markdowns.push({ _id: article._id, markdown:articles[i].markdown });

            toInsert.push(article);
        }

        coll.insert(toInsert, function () {
            if (callback) callback(null, toInsert);
        });
    });
};

// Finally, export the provider
exports.provider = Articles;
