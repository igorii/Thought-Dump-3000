/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var blog = require('./routes/blog');
var http = require('http');
var path = require('path');
var app = express();

// All environments
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// Development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Application routes
app.get('/',            blog.all); //function (req, res) { res.render('index'); });
app.get('/blog',        blog.all);
app.get('/blog/id/:id', blog.single);
app.get('/blog/create', blog.create);
app.post('/blog/save',  blog.save);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
