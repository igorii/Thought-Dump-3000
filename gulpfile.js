var gulp   = require('gulp');
var tinylr = require('tiny-lr')();
var app    = require('./app');
var path   = require('path');

function handleFileChange (e) {
    var file = path.relative('public', e.path);

    console.log('');
    console.log('Changed ' + file);
    tinylr.changed({
        body: {
            files: [file]
        }
    });
}

gulp.task('default', function () {
    gulp.run('lr-server');
    gulp.run('main-server');

    gulp.watch('public/stylesheets/*.css', handleFileChange);
});

gulp.task('lr-server', function () {
    tinylr.listen(35729);
});

gulp.task('main-server', function () {
    app.run();
});

