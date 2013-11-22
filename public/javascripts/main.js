$(main);

function main () { 
  SiteI = new Site();
  SiteI.views.main();
}

var Site = function () {
  this.attachLinks();
};

/*
 * Prelude
 */

var SProto = Site.prototype;
SProto.modes = { Home:0, Content:1 };
SProto.currentMode = SProto.modes.Home;
SProto.attachLinks = function () {
  var that = this;
  
  $('#blog-btn-sidebar').click(function () { 
    that.views.content(); 
    that.blog.main();
  });
  $('#projects-btn-sidebar').click(function () { that.views.content(); });;
  $('#about-btn-sidebar').click(function () { that.views.content(); });
  $('#contact-btn-sidebar').click(function () { that.views.content(); });
  
  $('#blog-btn-main').click(function () { 
    that.views.content(); 
    that.blog.main();
  });
  $('#projects-btn-main').click(function () { that.views.content(); });
  $('#about-btn-main').click(function () { that.views.content(); });
  $('#contact-btn-main').click(function () { that.views.content(); });
};

/*
 * Views
 */

SProto.views = {};
SProto.views.main = function () {
  $('#site-content').empty();
  $('#footer').show();
  $('#nav-main').show();
  $('#sidebar').hide();  
  $('#nav-sidebar').hide();
  $('#site-content').hide();
};

SProto.views.home = function () {
  $('#site-content').empty();
  $('#footer').fadeIn(200);
  $('#nav-main').fadeIn(200);
  $('#sidebar').fadeOut(200);  
  $('#nav-sidebar').fadeOut(200);
  $('#site-content').fadeOut(200);
};

SProto.views.content = function () {
  $('#site-content').empty();
  $('#footer').fadeOut(200);
  $('#nav-main').fadeOut(200);
  $('#sidebar').fadeIn(200);  
  $('#nav-sidebar').fadeIn(200);
  $('#site-content').fadeIn(200);
};

SProto.blog = {};
SProto.blog.main = function () {
  var $content = $('#site-content');
  $.get('/blog/raw', function (articles) { 
    articles.forEach(function (article) {
      var $area = $('<div>').addClass('article');
      $('<h3>').text(article.title).appendTo($area);
      $('<div>').html(article.body).addClass('article-content').appendTo($area);      
      $area.appendTo($content);        
    });
  });
};
