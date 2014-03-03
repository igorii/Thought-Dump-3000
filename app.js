// Get the site config
var config  = require('./config');

var express = require('express');
var http    = require('http');
var path    = require('path');

var admin   = require('./routes/admin');
var blog    = require('./routes/blog').Blog({
    website     : 'timthornton.net',
    route       : 'blog/',
    username    : 'Tim Thornton',
    description : 'A blog of programming and whatever else I fancy.',
    dbport      : config.dbport
});

var app = express();

// Session management
app.use(express.cookieParser());
app.use(express.session({secret: 'sf48p9v1y89p1vpb324ry'}));

// All environments
app.set('view engine', 'ejs');
app.set('port', config.port || 3000);
app.use(express.favicon());

// Date stamped logger
app.use(function (req, res, next) {
    console.log('' + (new Date()) + ': ' + req.url);
    next();
});
app.use(express.logger('dev'));

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express['static'](path.join(__dirname, 'public')));

// Development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Administration routes
app.get(  '/admin/login',   function (req, res) {
  res.render('admin/login', {recent:[]});
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

app.post( '/blog/author',           blog.author       );
app.post( '/blog/update',           blog.update       );
app.post( '/blog/comment/:id',      blog.comment      );
app.post( '/blog/commentreply/:id', blog.commentReply );

app.get(  '/index',    function (req, res) { res.render('index', {recent:[]});     });
app.get(  '/about',    function (req, res) { res.render('pages/about', {recent:[]});     });
app.get(  '/resume',   function (req, res) { res.render('pages/resume', {recent: []});   });
app.get(  '/projects', function (req, res) { res.render('pages/projects', {recent: []}); });
app.get(  '/projects/:project', function (req, res) {
    res.render('pages/projects/' + req.params.project, {recent: []});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
