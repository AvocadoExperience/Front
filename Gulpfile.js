/**
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & tools we'll use
var gulp            = require('gulp'),
    $               = require('gulp-load-plugins')({scope: ['dependencies', 'devDependencies']}),
    del             = require('del'),
    runSequence     = require('run-sequence'),
    browserSync     = require('browser-sync'),
    pagespeed       = require('psi'),
    reload          = browserSync.reload,
    mainBowerFiles  = require('main-bower-files'),
    merge           = require('merge-stream');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src(['app/js/*.js'])
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

gulp.task('scripts', function() {
  return gulp.src(mainBowerFiles('**/*.js').concat(['app/js/app.js']))
		.pipe($.concat('app.min.js'))
		.pipe($.uglify())
    .pipe(gulp.dest('dist/js'));
});


// Optimize images
gulp.task('images', function () {
  return gulp.src('app/img/**/*')
    .pipe($.imagemin({
        progressive: true,
        interlaced: true
    }))
    .pipe(gulp.dest('dist/img'));
});

// Copy all files at the root level (app)
gulp.task('copy', function () {
  return gulp.src([
    'app/*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}));
});

// Copy web fonts to dist
gulp.task('fonts', function () {
  return gulp.src(['app/fonts/*.{ttf,woff,eof,svg}'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Copy data to dist
gulp.task('data', function () {
  return gulp.src(['app/data/**'])
    .pipe(gulp.dest('dist/data'))
    .pipe($.size({title: 'data'}));
});

gulp.task('styles', function(){
  var scssStream = gulp.src('app/scss/**/*.scss')
    .pipe($.sass({
      precision: 10,
      outputStyle: 'compressed',
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe($.concat('app.min.css'))
    .pipe($.cssmin())
    .pipe(gulp.dest('dist/css'));
//     .pipe($.concat('sass.scss'));
    
/*
  var cssStream = gulp.src('bower_components/vis/dist/vis.min.css')
    .pipe($.concat('css.css'));
    
  var mergedStream = merge(scssStream, cssStream)
        .pipe($.concat('app.min.css'))
        .pipe($.cssmin())
        .pipe(gulp.dest('dist/css'));
*/
  var mergedStream = scssStream;

  return mergedStream;
});

// Scan your HTML for assets & optimize them
gulp.task('html', function () {
    return gulp.src(['app/*.html', '!app/js/**/*.html','!app/*input.html'])
      .pipe($.swig({
        defaults: {
            cache: false
        }
      }))
      .pipe($.if('*.html', $.htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        removeAttributeQuotes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,
        minifyCSS: true
      })))
      .pipe(gulp.dest('dist'))
      .pipe($.size({title: 'html'}));

});

// Clean output directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

gulp.task('vendor', function() {
  // Copy all JavaScript vendor scripts and CSS vendor styles
  return gulp.src(
    ['app/**/*min.js',
     'app/**/*min.css'
    ])
    .pipe(gulp.dest('dist'));
});

gulp.task('vendor:min', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(['app/**/jq/**/*.js', 'app/**/bs/**/*.js', 'app/**/mm/**/*.js','app/**/bs/**/*.css','app/**/fa-4.5.0/**/*.{ttf,woff, woff2,eof,svg,css}'])
    .pipe($.if('**/*.js',
      //.pipe($.sourcemaps.init())
      $.uglify({preserveComments: 'license'})))
      //.pipe($.sourcemaps.write())
    .pipe($.if('*.css', $.csso()))

    .pipe(gulp.dest('dist'));
});

gulp.task('serve', ['copy','jshint', 'scripts', 'html', 'styles', 'images', 'fonts', 'data'], function () {

  browserSync({
    notify: false,
    logPrefix: 'Front',
    browser: 'google chrome',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: 'dist',
      index: 'index.html'
    }
  });

//   gulp.watch(['app/**/*.html'], ['html']).on("change", reload);
  gulp.watch(['app/scss/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/**/*.html'], ['html', reload]);
  gulp.watch(['app/js/**/*.js'], ['jshint','scripts']);
  gulp.watch(['app/img/**/*'], ['images']).on("change", reload);
});

gulp.task('default', ['serve']);


// Run PageSpeed Insights
gulp.task('pagespeed', function (cb) {
  // Update the below URL to the public URL of your site
  pagespeed.output('example.com', {
    strategy: 'mobile',
    // By default we use the PageSpeed Insights free (no API key) tier.
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    //key: 'AIzaSyAR6AHXER-otHxp_EcCuewl6dPB4MqtOj4'
  }, cb);
});

// Load custom tasks from the `tasks` directory
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }
