// Get the site config
var config  = require('./config');
var express = require('express');
var http    = require('http');
var path    = require('path');
var admin   = require('./routes/admin').Admin({
    user : config.user,
    pass : config.pass
});

// Initialize the blog
var blog = require('./routes/blog').Blog({
    website     : config.website,
    route       : 'blog/',
    username    : config.fullname,
    description : config.description,
    dbport      : config.dbport,
    db          : config.db
});

// Initialize the Express app
var app = express();

// Session management
app.use(express.cookieParser());
app.use(express.session({secret: config.secret }));

// All environments
app.set('view engine', 'ejs');
app.set('port', config.port);
app.use(express.favicon());
app.use(express.query());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express['static'](path.join(__dirname, 'public')));

// Development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Administration routes
app.get(  '/admin/login',   function (req, res) {
    res.render('admin/login', {
        recent : [],
        name   : config.fullname
    });
});
app.post( '/admin/login',   admin.login  );
app.post( '/admin/logout',  admin.logout );

// Application routes
app.get(  '/',              blog.all     );
app.get(  '/blog',          blog.all     );
app.get(  '/blog/id/:id',   blog.single  );
app.get(  '/blog/edit/:id', blog.edit    );
app.get(  '/blog/create',   blog.create  );
app.get(  '/blog/rss',      blog.rss     );
app.get(  '/blog/admin',    blog.admin   );
app.get(  '/blog/editDraft/:id', blog.editDraft );

app.post( '/blog/author',           blog.author       );
app.post( '/blog/comment/:id',      blog.comment      );
app.post( '/blog/commentreply/:id', blog.commentReply );

// Static routes
app.get(  '/index',    function (req, res) { res.render('index',          { recent:[], name: config.fullname });     });
app.get(  '/about',    function (req, res) { res.render('pages/about',    { recent:[], name: config.fullname });     });
app.get(  '/resume',   function (req, res) { res.render('pages/resume',   { recent:[], name: config.fullname });   });
app.get(  '/projects', function (req, res) { res.render('pages/projects', { recent:[], name: config.fullname }); });
app.get(  '/projects/:project', function (req, res) {
    res.render('pages/projects/' + req.params.project, {recent: []});
});

// Run the server
app.listen(app.get('port'), function () {
    console.log('Server listening on ' + app.get('port'));
});

