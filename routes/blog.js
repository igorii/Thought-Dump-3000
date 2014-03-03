// Dependencies
var html_md = require('html-md');
var RSS     = require('rss');
var emailjs = require('emailjs');
var grav    = require('gravatar');

// options => website, route, username, description, dbport
exports.Blog = function (options) {

    // Initialize the rss feed
    var feed = new RSS({
        title       : options.username + '\'s Blog',
        description : options.description,
        feed_url    : options.website + options.route + 'rss/',
        site_url    : options.website,
        author      : options.username,
        language    : 'English'
    });

    // Create a new provider
    var _Provider = require('../lib/articles').provider;
    var provider  = new _Provider('localhost', options.dbport);

    function addToRss (feed, article) {
        feed.item({
            title       : article.title,
            description : 'New blog post at ' + options.website,
            url         : options.website + '/blog/id/' + article._id,
            guid        : '' + article._id,
            date        : article['created-at']
        });

        return feed;
    }

    // Initialize the RSS feed upon startup
    setTimeout(function () {
        provider.findAll(function (error, docs) {
            if (error) return;
            else docs.forEach(function (article) {
                addToRss(feed, article);
            });
        });
    }, 1000);

    // Serve all articles
    function articles (req, res) {
        provider.findAll(function (error, docs) {
            if (error) {
                res.status(500).end();
            } else {
                res.send(docs);
            }
        });
    }

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
        console.log(req.params.id);
        provider.findById(req.params.id, function (error, doc) {
            if (error || doc === null) {
                res.status(500).end();
            } else {
                doc.full = true; // Flag to add comments
                doc.comments = resolveGravatar(doc.comments);
                res.render(options.route + 'article', {
                    article: doc,
                    recent: []
                });
            }
        });
    }

    function comment (req, res) {

        // Update the article with the new body
        provider.comment({
            user    : req.param('name') || 'Anonymous',
            email   : req.param('email'),
            content : req.param('content'),
            notify  : req.param('notify') || 'off',
            _id     : req.param('_id')
        }, function (error, docs) {
            if (error) res.status(500).end();
            else {

                // TODO: Email all users with the 'notify' flag set
                // TODO: Add 'reply to' mechanism to reply to comments
                //       and restrict the above emails being sent

                // Direct the user to the updated page
                res.redirect('/blog/id/' + req.param('_id'));
            }
        });
    }

    // TODO
    function notify () {}

    function commentReply (req, res) {
        provider.replyTo(req.param('parent_id'), {
            user    : req.param('name') || 'Anonymous',
            email   : req.param('email'),
            content : req.param('content'),
            notify  : req.param('notify') || 'off',
            _id     : req.param('_id')
        }, function (error, article) {
            if (error) res.status(500).end();
            else {

                // Notify the parent of the reply if necessary
                if (req.param('notify') === 'on') {
                    var parents = article.comments.filter(function (article) {
                        return article._id === req.param('parent_id');
                    });

                    if (parents.length > 0) {
                        var email = parents[0].email;
                        notify(email, req.param('name'), req.param('content'));
                    }
                }

                // Redirect to the article
                res.redirect('/blog/id/' + req.param('_id'));
            }
        });
    }

    function recent (callback) {
        provider.findAll(function (error, docs) {
            if (error) callback([]);
            else callback(docs.sort(function (a1, a2) {
                return a1.created_at < a2.created_at;
            }).slice(0,3)); // Take the first 3
        });
    }

    function all (req, res) {
        provider.findAll(function (error, docs) {
            recent(function (recent) {
                if (error) {
                    res.status(500).end();
                } else {
                    res.render(options.route + 'blog', {
                        articles: docs.sort(function (a1, a2) {
                            return a1.created_at < a2.created_at;
                        }).filter(function (article) {
                            return article.body;
                        }).map(function (article) {
                            article.body = article.body.split('</p>')[0] + '</p>' +
                                article.body.split('</p>')[1] + '</p>';
                            return article;
                        }),
                        recent: recent
                    });
                }
            });
        });
    }

    function edit (req, res) {
        provider.findById(req.params.id, function (error, doc) {
            if (error || doc === null) {
                res.status(500).end();
            } else {
                res.render(options.route + 'edit', {
                    article: {
                        body       : doc.body,
                        github     : doc.github,
                        created_at : doc.created_at,
                        title      : doc.title,
                        _id        : doc._id
                    },
                    recent: []
                });
            }
        });
    }

    function editDraft (req, res) {
        provider.findDraftById(req.params.id, function (error, doc) {
            if (error || doc === null) {
                res.status(500).end();
            } else {
                res.render(options.route + 'edit', {
                    article: {
                        body       : doc.body,
                        github     : doc.github,
                        created_at : doc.created_at,
                        title      : doc.title,
                        _id        : doc._id
                    },
                    recent: []
                });
            }
        });
    }

    function update (req, res) {

        if (req.session.user === undefined)
            return res.status(401).send('Unauthorized');

        // Update the article with the new body
        provider.update({
            title  : req.param('title'),
            body   : req.param('body'),
            github : req.param('github') || '',
            _id    : req.param('_id')
        }, function (error, docs) {
            if (error)
                res.status(500).end();
            else
                res.redirect('/blog/id/' + req.param('_id'));
        });
    }

    function create (req, res) {
        if (req.session.user === undefined)
            return res.status(401).send('Unauthorized');

        res.render(options.route + 'create', {recent: []});
    }

    function admin (req, res) {
        if (req.session.user === undefined)
            return res.status(401).send('Unauthorized');

        res.render(options.route + 'admin', {recent: []});
    }

    function save (req, res) {
        if (req.session.user === undefined)
            return res.status(401).send('Unauthorized');

        // If authorized, save the article
        provider.save({
            title    : req.param('title'),
            github   : req.param('github') || '',
            markdown : req.param('markdown')
        }, function (error, docs) {
            if (error) {
                res.status(500).end();
            } else {
                // Redirect to the blog
                res.redirect('/blog/admin');
            }
        });
    }

    function publish (req, res) {
        if (req.session.user === undefined)
            return res.status(401).send('Unauthorized');

        // TODO: check if it exits in the drafts store
        // if so, remove it

        // If authorized, save the article
        provider.publish({
            title    : req.param('title'),
            github   : req.param('github') || '',
            created  : req.param('created') !== '' ? new Date(req.param('created')) : new Date(),
            markdown : req.param('markdown')
        }, function (error, docs) {
            if (error) {
                res.status(500).end();
            } else {

                // Add the article to rss
                addToRss(feed, docs[0]);

                // Redirect to the blog
                res.redirect('/blog');
            }
        });
    }

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

    function rss (req, res) {
        res.send(feed.xml('  '));
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

