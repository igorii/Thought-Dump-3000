var marked = require('marked'); // Markdown compilation

// Setup the markdown compiler
marked.setOptions({
    gfm: true,
    highlight: function (code, lang, callback) {
        pygmentize({ lang: lang, format: 'html' }, code, function (err, result) {
            if (err) return callback(err);
            callback(null, result.toString());
        });
    },
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    langPrefix: 'lang-'
});

Articles = function () {};

var articleCounter = 1;
Articles.prototype.articles  = [];
Articles.prototype.markdowns = [];

/**
 * Find every article.
 */
Articles.prototype.findAll = function (callback) {
    callback(null, this.articles);
};


/*
 * Find a specific article by ID.
 */
Articles.prototype.findById = function (id, callback) {
    var result = null;
    for (var i = 0, j = this.articles.length; i < j; i++) {
        if (this.articles[i]._id == id) {
            result = this.articles[i];
            break;
        }
    }

    callback(null, result);
};

/**
 * Save lists of articles of individual articles. Takes a 
 * markdown article and converts it to html, while saving the
 * markdown source in a separate table.
 */
Articles.prototype.save = function (articles, callback) {
    var article = null;

    // Enlist the articles data if it is a single article
    if (typeof(articles.length) === "undefined")
        articles = [articles];

    for (var i = 0; i < articles.length; i++) {

        // Create the new article entry
        article = {
            title      : articles[i].title,
            comments   : articles[i].comments,
            _id        : articleCounter++,
            created_at : new Date()
        };

        // Save markdown entries
        if (articles[i].markdown)
            article.body = marked(articles[i].markdown);
        
        // TODO: Support other save types?

        // 
        if (article.comments === undefined)
            article.comments = [];

        // Set the date for each comment to now
        for (var j = 0; j < article.comments.length; j++) {
            article.comments[j].created_at = new Date();
        }

        // Add the article and save it's source
        this.articles.push(article);
        this.markdowns.push({ _id: article._id, markdown:articles[i].markdown });
    }

    if (callback) callback(null, articles);
};

// Add some initial articles
new Articles().save([
        {title: 'Post one', markdown: 'Body one', comments: [{author: 'Bob', comment: 'I love it'}, {author:'Dave', comment:'This is rubbish!'}]},
        {title: 'Post two', markdown: 'Body two' },
        {title: 'Post three', markdown: 'Body three' }]);

// Finally, export the provider
exports.provider = Articles;
