// Dependencies
var hljs     = require('highlight.js'); // Syntax colouring
var marked   = require('marked');       // Markdown compilation
var mongoose = require('mongoose');     // MongoDB interface
var RSS      = require('rss');          // RSS feed generation
var grav     = require('gravatar');     // Gravatar API

var Articles = require('../lib/post');
var Post     = Articles.Post;                      // Post model
var Draft    = Articles.Draft;                     // Draft model
var Comment  = require('../lib/comment').Comment;  // Comment model

// options => website, route, username, description, dbport, db
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
        highlight   : function (code, lang) {
            // TODO: support lang since it's provided
            return hljs.highlightAuto(code).value;
        }
    });

    mongoose.connect('mongodb://localhost:' + options.dbport + '/' + options.db);
    var db = mongoose.connection;

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

    /*
     * Given the unique id of a published article, render that article.
     */
    function single (req, res) {
        Post.findOne({ _id: req.params.id }, function (err, post) {
            if (err || post === null)
                return res.status(500).end();

            // Add a flag to render comments
            post.full     = true;
            post.comments = resolveGravatar(post.comments);

            // Render the view
            res.render(options.route + 'article', {
                article : post
            });
        });
    }

    /*
     * Given the unique id of a published article, add a comment with
     * the given content to the comments of the article.
     */
    function comment (req, res) {

        // Find the associated post
        Post.findOne({ _id: req.param('id') }, function (err, post) {

            if (err || post === null)
                return res.status(500).end();

            // Create the comment model
            var com = new Comment({
                body  : req.param('content'),
                email : req.param('email'),
                user  : req.param('user')
            });

            // Add the comment to the post
            post.comments.push(com.toObject());

            // Update the post in the database
            post.save(function (err) {
                if (err)
                    return res.status(500).end();

                res.redirect('/blog/id/' + req.param('_id'));
            });
        });

    }

    /*
     * TODO: Add ability to reply to comments (comments all have a unique
     * id, and are recursively defined to have an array of comments.
     */
    function commentReply (req, res) {}

    /*
     * Retrieve the three most recent published posts from the database.
     */
    function recent (callback) {
        Post.find({}, function (err, posts) {
            if (err || posts === null)
                return callback([]);
            callback(sortByDate(posts).slice(0, 3));
        });
    }

    /*
     * Given a list of objects that contain a 'date' attribute, sort the
     * object by date with most recent first.
     */
    function sortByDate (items) {
        return items.sort(function (p1, p2) {
            return p1.date < p2.date;
        });
    }

    /*
     * Render all the published posts in the database.
     */
    function all (req, res) {

        // Get all the posts
        Post.find({}, function (err, posts) {
            if (err || posts === null)
                return res.status(500).end();

            // Render the main blog view
            res.render(options.route + 'blog', {
                articles : sortByDate(posts)

                    // Only worry about posts that have a body (TODO, clean database)
                    .filter(function (p) {
                        return p.body;
                    })

                    // Snip the post to the first two paragraphs
                    .map(function (article) {
                        // TODO: what about a small post that doesnt even have two paragraphs?
                        article.body = article.body.split('</p>')[0] + '</p>' +
                            article.body.split('</p>')[1] + '</p>';

                        return article;
                    })
            });
        });
    }

    /*
     * Edit a previously published article.
     */
    function edit (req, res) {

        // Find the article to edit
        Post.findOne({ _id: req.params.id }, function (err, post) {
            if (err || post === null)
                return res.status(500).end();

            post.isDraft = 'false';
            post.draftID = '';

            // Render the edit view
            res.render(options.route + 'edit', { article : post });
        });
    }

    /*
     * Edit an unpublished draft.
     */
    function editDraft (req, res) {

        // Find the draft to edit
        Draft.findOne({ _id: req.params.id }, function (err, draft) {
            if (err || draft === null)
                return res.status(500).end();

            draft.isDraft = 'true';

            // Render the edit view
            res.render(options.route + 'edit', { article : draft });
        });
    }

    /*
     * Render a fresh edit view with no content.
     */
    function create (req, res) {
        if (req.session.user === undefined)
            return res.status(401).send('Unauthorized');

        // Render the view
        res.render(options.route + 'edit', {
            article : {
                body     : '',
                markdown : '',
                _id      : '',
                title    : '',
                github   : '',
                isDraft  : 'false'
            }
        });
    }

    /*
     * Render the admin view, showing all unpublished drafts.
     */
    function admin (req, res) {
        if (req.session.user === undefined)
            return res.status(401).send('Unauthorized');

        // Get all the unpublished drafts
        Draft.find({}, function (err, drafts) {
            if (err)
                return res.status(501).end();

            res.render(options.route + 'admin', { drafts : drafts });
        });
    }

    /*
     * Save an article as a draft.
     */
    function save (req, res) {

        // Check whether a draft already exists with the same id
        Draft.findOne({ _id: req.param('draftID') }, function (err, draft) {

            if (err || draft === null) {
                draft = new Draft();
            }

            // Update the drafts content
            draft.title    = req.param('title');
            draft.body     = '';
            draft.markdown = req.param('markdown');
            draft.github   = req.param('github');

            // Save the draft
            draft.save(function (err) {
                if (err)
                    return res.status(501).end();

                res.redirect('/blog/admin');
            });
        });

    }

    /*
     * Publish the article, moving it out of the Draft database if it has
     * previously been saved, and replacing it in the Post database if
     * has previously been published.
     */
    function publish (req, res) {

        // If a draft already exists, remove it
        if (req.param('isDraft') === 'true') {
            Draft.findOne({ _id: req.param('draftID') }, function(err, draft) {
                if (!err && draft !== null)
                    draft.remove();
            });
        }

        // Otherwise, if the post has been published, remove the old one
        else if (req.param('draftID') !== ''){
            Post.findOne({ _id: req.param('draftID') }, function (err, post) {
                if (!err && post !== null) {
                    post.remove();
                }
            });
        }

        // Save the article as a post
        var post = new Post({
            title    : req.param('title'),
            github   : req.param('github'),
            markdown : req.param('markdown'),
            body     : marked(req.param('markdown'))
        });

        post.save(function (err) {
            if (err)
                return res.status(501).end();

            res.redirect('/blog');
        });
    }

    /*
     * Main entry point to saving and publishing articles. Simply dispatch
     * to the correct authoring handler.
     */
    function author (req, res) {
        if (req.session.user === undefined)
            return res.status(401).send('Unauthorized');

        if (req.param('save'))
            save(req, res);
        else if (req.param('publish'))
            publish(req, res);
        else
            res.status(401).send('Unauthorized');
    }

    /*
     * TODO
     */
    function rss (req, res) {}

    // Return all the goodies as module exports
    return {
        single       : single,
        comment      : comment,
        commentReply : commentReply,
        recent       : recent,
        all          : all,
        edit         : edit,
        editDraft    : editDraft,
        create       : create,
        admin        : admin,
        author       : author,
        rss          : rss
    };
};

