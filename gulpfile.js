var gulp   = require('gulp');
var app    = require('./app');

gulp.task('default', function () {
    gulp.run('main-server');
});

gulp.task('main-server', function () {
    app.run();
});

