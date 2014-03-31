// Dependencies
var hljs   = require('highlight.js');   // Syntax colouring
var marked   = require('marked');       // Markdown compilation
var mongoose = require('mongoose');
var html_md  = require('html-md');
var RSS      = require('rss');
var emailjs  = require('emailjs');
var grav     = require('gravatar');

var Articles = require('../lib/post');
var Post     = Articles.Post;
var Draft    = Articles.Draft;
var Comment  = require('../lib/comment').Comment;

// options => website, route, username, description, dbport
exports.Blog = function (options) {

    // Setup the markdown compiler
    marked.setOptions({
        gfm         : true,
        tables      : true,
        breaks      : false,
        pedantic    : false,
        sanitize    : true,
        smartLists  : true,
        smartypants : false,
        langPrefix  : 'lang-',
        highlight: function (code, lang) {
            // TODO: support lang since it's provided
            return hljs.highlightAuto(code).value;
        }
    });

    mongoose.connect('mongodb://localhost:4000/blog');
    var db = mongoose.connection;

    // Initialize the rss feed
    //var feed = new RSS({
    //    title       : options.username + '\'s Blog',
    //    description : options.description,
    //    feed_url    : options.website + options.route + 'rss/',
    //    site_url    : options.website,
    //    author      : options.username,
    //    language    : 'English'
    //});

    // Create a new provider
    //var _Provider = require('../lib/articles').provider;
    //var provider  = new _Provider('localhost', options.dbport);

    //function addToRss (feed, article) {
    //    feed.item({
    //        title       : article.title,
    //        description : 'New blog post at ' + options.website,
    //        url         : options.website + '/blog/id/' + article._id,
    //        guid        : '' + article._id,
    //        date        : article['created-at']
    //    });

    //    return feed;
    //}

    // Initialize the RSS feed upon startup
    //setTimeout(function () {
    //    provider.findAll(function (error, docs) {
    //        if (error) return;
    //        else docs.forEach(function (article) {
    //            addToRss(feed, article);
    //        });
    //    });
    //}, 1000);

    // Serve all articles
    function articles (req, res) {
        Post.find({}, function (err, posts) {
            if (err)
                return res.status(500).end();

            res.send(posts);
        });
        //provider.findAll(function (error, docs) {
        //    if (error) {
        //        res.status(500).end();
        //    } else {
        //        res.send(docs);
        //    }
        //});
    }

    /*
     * Given a list of comments, add a gravatar attribute to
     * the comment with the gravatar image for the user associated
     * with the comment.
     */
    function resolveGravatars (comments) {
        return comments.map(resolveGravatar);
    }

    function resolveGravatar (comment) {
        if (comment instanceof Array)
            return resolveGravatars(comment);

        comment.gravatar = grav.url(comment.email, {s: '40', r: 'pg', d: 'retro'});
        return comment;
    }

    function single (req, res) {
        Post.findOne({ _id: req.params.id }, function (err, post) {
            if (err || post === null)
                return res.status(500).end();

            console.log('Found post');
            console.log(post);

            // Add a flag to render comments
            post.full     = true;
            post.comments = resolveGravatar(post.comments);

            // Render the view
            res.render(options.route + 'article', {
                article: post,
                recent: []
            });
        });
        //provider.findById(req.params.id, function (error, doc) {
        //    if (error || doc === null) {
        //        res.status(500).end();
        //    } else {
        //        doc.full = true; // Flag to add comments
        //        doc.comments = resolveGravatar(doc.comments);
        //        res.render(options.route + 'article', {
        //            article: doc,
        //            recent: []
        //        });
        //    }
        //});
    }

    function comment (req, res) {

        var com = new Comment({
            body  : req.param('content'),
            email : req.param('email'),
            user  : req.param('user')
        });

        console.log('Created comment');
        console.log(com);

        Post.findOne({ _id: req.param('id') }, function (err, post) {

            console.log('Error: ' + err);
            console.log('Post: ' + post);

            if (err || post === null)
                return res.status(500).end();

            // Add the comment to the post
            post.comments.push(com.toObject());

            // Update the post in the database
            post.save(function (err) {
                if (err) {
                    console.log(err);
                    return res.status(500).end();
                }

                res.redirect('/blog/id/' + req.param('_id'));
            });
        });

        // Update the article with the new body
        //provider.comment({
        //    user    : req.param('name') || 'Anonymous',
        //    email   : req.param('email'),
        //    content : req.param('content'),
        //    notify  : req.param('notify') || 'off',
        //    _id     : req.param('_id')
        //}, function (error, docs) {
        //    if (error) res.status(500).end();
        //    else {

        //        // TODO: Email all users with the 'notify' flag set
        //        // TODO: Add 'reply to' mechanism to reply to comments
        //        //       and restrict the above emails being sent

        //        // Direct the user to the updated page
        //        res.redirect('/blog/id/' + req.param('_id'));
        //    }
        //});
    }

    // TODO
    //function notify () {}

    function commentReply (req, res) {
    //    provider.replyTo(req.param('parent_id'), {
    //        user    : req.param('name') || 'Anonymous',
    //        email   : req.param('email'),
    //        content : req.param('content'),
    //        notify  : req.param('notify') || 'off',
    //        _id     : req.param('_id')
    //    }, function (error, article) {
    //        if (error) res.status(500).end();
    //        else {

    //            // Notify the parent of the reply if necessary
    //            if (req.param('notify') === 'on') {
    //                var parents = article.comments.filter(function (article) {
    //                    return article._id === req.param('parent_id');
    //                });

    //                if (parents.length > 0) {
    //                    var email = parents[0].email;
    //                    notify(email, req.param('name'), req.param('content'));
    //                }
    //            }

    //            // Redirect to the article
    //            res.redirect('/blog/id/' + req.param('_id'));
    //        }
    //    });
    }

    function recent (callback) {
        Post.find({}, function (err, posts) {
            if (err || posts === null)
                return callback([]);
            callback(sortByDate(posts).slice(0, 3));
        });
        //provider.findAll(function (error, docs) {
        //    if (error) callback([]);
        //    else callback(docs.sort(function (a1, a2) {
        //        return a1.date < a2.date;
        //    }).slice(0,3)); // Take the first 3
        //});
    }

    function sortByDate (items) {
        return items.sort(function (p1, p2) {
            return p1.date < p2.date;
        });
    }

    function all (req, res) {
        Post.find({}, function (err, posts) {
            if (err || posts === null)
                return res.status(500).end();

            res.render(options.route + 'blog', {
                recent   : [],
                articles : sortByDate(posts)
                    .filter(function (p) {
                        return p.body;
                    })
                    .map(function (article) {
                        article.body = article.body.split('</p>')[0] + '</p>' +
                            article.body.split('</p>')[1] + '</p>';

                        return article;
                    })
            });
        });

        //provider.findAll(function (error, docs) {
        //    recent(function (recent) {
        //        if (error) {
        //            res.status(500).end();
        //        } else {
        //            res.render(options.route + 'blog', {
        //                articles: docs.sort(function (a1, a2) {
        //                    return a1.date < a2.date;
        //                }).filter(function (article) {
        //                    return article.body;
        //                }).map(function (article) {
        //                    article.body = article.body.split('</p>')[0] + '</p>' +
        //                        article.body.split('</p>')[1] + '</p>';
        //                    return article;
        //                }),
        //                recent: recent
        //            });
        //        }
        //    });
        //});
    }

    function edit (req, res) {

        Post.findOne({ _id: req.params.id }, function (err, post) {
            if (err || post === null)
                return res.status(500).end();

            post.isDraft = 'false';
            post.draftID  = '';

            res.render(options.route + 'edit', {
                article: post,
                recent: []
            });
        });

        //provider.findById(req.params.id, function (error, doc) {
        //    if (error || doc === null) {
        //        res.status(500).end();
        //    } else {
        //        res.render(options.route + 'edit', {
        //            article: {
        //                body       : doc.body,
        //                github     : doc.github,
        //                date       : doc.created_at,
        //                title      : doc.title,
        //                _id        : doc._id
        //            },
        //            recent: []
        //        });
        //    }
        //});
    }

    function editDraft (req, res) {

        Draft.findOne({ _id: req.params.id }, function (err, draft) {
            if (err || draft === null)
                return res.status(500).end();

            var article     = draft;
            article.isDraft = 'true';

            res.render(options.route + 'edit', {
                article: article,
                recent: []
            });
        });

        //provider.findDraftById(req.params.id, function (error, doc) {
        //    if (error || doc === null) {
        //        res.status(500).end();
        //    } else {
        //        res.render(options.route + 'edit', {
        //            article: doc,
        //            recent: []
        //        });
        //    }
        //});
    }

    function update (req, res) {

        //if (req.session.user === undefined)
        //    return res.status(401).send('Unauthorized');

        //// Update the article with the new body
        //provider.update({
        //    title  : req.param('title'),
        //    body   : req.param('body'),
        //    github : req.param('github') || '',
        //    _id    : req.param('_id')
        //}, function (error, docs) {
        //    if (error)
        //        res.status(500).end();
        //    else
        //        res.redirect('/blog/id/' + req.param('_id'));
        //});
    }

    function create (req, res) {
        if (req.session.user === undefined)
            return res.status(401).send('Unauthorized');

        res.render(options.route + 'edit', {
            article:{
                body    : '',
                _id     : '',
                isDraft : 'false',
                title   : '',
                github  : ''
            },
            recent: []
        });
    }

    function admin (req, res) {
        if (req.session.user === undefined)
            return res.status(401).send('Unauthorized');

        Draft.find({}, function (err, drafts) {
            if (err)
                return res.status(501).end();

            res.render(options.route + 'admin', {
                drafts: drafts,
                recent: []
            });
        });

        //provider.findDrafts(function (error, drafts) {
        //    if (error) return res.status(501).end();

        //    res.render(options.route + 'admin', {
        //        drafts: drafts,
        //        recent: []
        //    });
        //});
    }

    function save (req, res) {

        // Check whether a draft already exists with the same name
        Draft.findOne({ _id: req.param('draftID') }, function (err, draft) {

            if (err || draft === null) {
                draft = new Draft();
            }

            draft.title    = req.param('title');
            draft.body     = req.param('markdown');
            draft.github   = req.param('github');
            draft.bodyType = 'markdown';

            draft.save(function (err) {
                if (err)
                    return res.status(501).end();

                res.redirect('/blog/admin');
            });
        });

        // If authorized, save the article
        //provider.save({
        //    title    : req.param('title'),
        //    github   : req.param('github') || '',
        //    markdown : req.param('markdown')
        //}, function (error, docs) {
        //    if (error) {
        //        res.status(500).end();
        //    } else {
        //        // Redirect to the blog
        //        res.redirect('/blog/admin');
        //    }
        //});
    }

    function publish (req, res) {

        // If a draft already exists, remove it
        if (req.param('isDraft') === 'true') {
            Draft.findOne({ _id: req.param('draftID') }, function(err, draft) {
                if (!err && draft !== null)
                    draft.remove();
            });
        }

        // Save the article as a post
        var post = new Post({
            title     : req.param('title'),
            github    : req.param('github'),
            body      : marked(req.param('markdown')),   // When punlishing, convert markdown to html
            bodyType  : 'html'
        });

        post.save(function (err) {
            if (err)
                return res.status(501).end();

            res.redirect('/blog');
        });
        //provider.publish({
        //    title    : req.param('title'),
        //    github   : req.param('github') || '',
        //    created  : req.param('created') !== '' ? new Date(req.param('created')) : new Date(),
        //    markdown : req.param('markdown')
        //}, function (error, docs) {
        //    if (error) {
        //        res.status(500).end();
        //    } else {

        //        // Add the article to rss
        //        addToRss(feed, docs[0]);

        //        // Redirect to the blog
        //        res.redirect('/blog');
        //    }
        //});
    }

    function author (req, res) {
        if (req.session.user === undefined)
            return res.status(401).send('Unauthorized');

        if (req.param('save')) {
            console.log('Saving');
            save(req, res);
        } else if (req.param('publish')) {
            console.log('Publishing');
            publish(req, res);
        } else {
            res.status(401).send('Unauthorized');
        }
    }

    function rss (req, res) {
        //res.send(feed.xml('  '));
    }

    return {
        articles     : articles,
        single       : single,
        comment      : comment,
        commentReply : commentReply,
        recent       : recent,
        all          : all,
        edit         : edit,
        editDraft    : editDraft,
        update       : update,
        create       : create,
        admin        : admin,
        author       : author,
        rss          : rss
    };
};

