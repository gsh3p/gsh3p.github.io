//
// main gulpfile.js

// define variables
var autoprefixer = require('autoprefixer'),
    browserSync  = require('browser-sync').create(),
    cleancss     = require('gulp-clean-css'),
    concat       = require('gulp-concat'),
    del          = require('del'),
    gulp         = require('gulp'),
    gutil        = require('gulp-util'),
    imagemin     = require('gulp-imagemin'),
    notify       = require('gulp-notify'),
    postcss      = require('gulp-postcss'),
    rename       = require('gulp-rename'),
    run          = require('gulp-run'),
    runSequence  = require('run-sequence'),
    sass         = require('gulp-ruby-sass'),
    uglify       = require('gulp-uglify')

// Include paths file.
var paths = require('./_assets/gulp_config/paths');

// Uses Sass compiler to process styles, adds vendor prefixes, minifies, then
// outputs file to the appropriate location.
gulp.task('build:styles:main', function() {
    return sass(paths.sassFiles + '/style.scss', {
        style: 'compressed',
        trace: true,
        loadPath: [paths.sassFiles]
    }).pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
        .pipe(cleancss())
        .pipe(gulp.dest(paths.jekyllDir))
        .pipe(gulp.dest(paths.siteDir))
        .pipe(browserSync.stream())
        .on('error', gutil.log);
});

// Builds all styles.
gulp.task('build:styles', ['build:styles:main']);

// Deletes CSS.
gulp.task('clean:styles', function(callback) {
    del([paths.jekyllDir + 'style.css',
        paths.siteDir + 'style.css'
    ]);
    callback();
});


// Runs jekyll build command w/ localhost config file.
gulp.task('build:jekyll', function() {
    var shellCommand = 'jekyll build --config _assets/localhost_config.yml';

    return gulp.src('')
        .pipe(run(shellCommand))
        .on('error', gutil.log);
});

// Deletes the entire _site directory.
gulp.task('clean:jekyll', function(callback) {
    del(['_site']);
    callback();
});

// Main clean task.
// Deletes _site directory and processed assets.
gulp.task('clean', ['clean:jekyll',
    'clean:styles']);

// Builds site anew.
gulp.task('build', function(callback) {
    runSequence('clean',
        ['build:styles'],
        'build:jekyll',
        callback);
});

// Default Task: builds site.
gulp.task('default', ['build']);

// Special tasks for building and then reloading BrowserSync.
gulp.task('build:jekyll:watch', ['build:jekyll'], function(callback) {
    browserSync.reload();
    callback();
});

gulp.task('build:scripts:watch', ['build:scripts'], function(callback) {
    browserSync.reload();
    callback();
});



// Static Server + watching files.
// Note: passing anything besides hard-coded literal paths with globs doesn't
// seem to work with gulp.watch().
gulp.task('serve', ['build'], function() {

    browserSync.init({
        server: paths.siteDir,
        ghostMode: false, // Toggle to mirror clicks, reloads etc. (performance)
        logFileChanges: true,
        logLevel: 'debug',
        open: true        // Toggle to automatically open page when starting.
    });

    // Watch site settings.
    gulp.watch(['_config.yml'], ['build:jekyll:watch']);

    // Watch .scss files; changes are piped to browserSync.
    gulp.watch('_assets/sass/**/*.scss', ['build:styles']);

    // Watch .js files.
    gulp.watch('_assets/js/**/*.js', ['build:scripts:watch']);

    // Watch image files; changes are piped to browserSync.
    //gulp.watch('_assets/img/**/*', ['build:images']);

    // Watch posts.
    gulp.watch('_posts/**/*.+(md|markdown|MD)', ['build:jekyll:watch']);

    // Watch drafts if --drafts flag was passed.
    if (module.exports.drafts) {
        gulp.watch('_drafts/*.+(md|markdown|MD)', ['build:jekyll:watch']);
    }

    // Watch html and markdown files.
    gulp.watch(['**/*.+(html|md|markdown|MD)', '!_site/**/*.*'], ['build:jekyll:watch']);

    // Watch RSS feed XML file.
    gulp.watch('feed.xml', ['build:jekyll:watch']);

    // Watch data files.
    gulp.watch('_data/**.*+(yml|yaml|csv|json)', ['build:jekyll:watch']);

    // Watch favicon.png.
    gulp.watch('favicon.png', ['build:jekyll:watch']);
});
