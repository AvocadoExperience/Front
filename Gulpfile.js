var gulp           = require("gulp"),
    gutil          = require('gulp-util'),
    htmlmin        = require("gulp-htmlmin"),
    concat         = require("gulp-concat"),
    uglify         = require("gulp-uglify"),
    cssmin         = require("gulp-cssnano"),
    prefixer       = require('gulp-autoprefixer'),
    imagemin       = require("gulp-imagemin"),
    sourcemaps     = require("gulp-sourcemaps"),
    mainBowerFiles = require("main-bower-files"),
    inject         = require("gulp-inject"),
    less           = require("gulp-less"),
    filter         = require("gulp-filter"),
    glob           = require("glob"),
    del            = require('del'),
    swig           = require('gulp-swig'),
    browserSync    = require('browser-sync').create(),
    reload         = browserSync.reload;
        
var paths = {
    html: {
        src:  "src/**/*.html",
        dest: "build"
    },
    javascript: {
        src:  ["src/js/**/*.js"],
        dest: "build/js"
    },
    css: {
        src: ["src/css/**/*.css"],
        dest: "build/css"
    },
    images: {
        src: ["src/img/**/*.jpg", "src/img/**/*.jpeg", "src/img/**/*.png", "src/img/**/*.svg", "src/img/**/*.gif"],
        dest: "build/img"
    },
    ico: {
        src: ["src/*.png", "src/*.svg", "src/*.xml", "src/*.ico", "src/.htaccess"],
        dest: "build"
    },
    less: {
        src: ["src/less/**/*.less", "!src/less/includes/**"],
        dest: "build/css"
    },
    bower: {
        src: "bower_components",
        dest: "build/lib"
    },
    verbatim: {
        src: ["src/manifest.json"],
        dest: "build"
    }
};

gulp.task("clean", function (cb) {
    del(['build'], cb);
});

gulp.task('js-watch', ['scripts'], reload);
gulp.task('bower-watch', ['bower'], reload);
gulp.task('img-watch', ['images'], reload);
gulp.task('ico-watch', ['ico'], reload);
gulp.task('verbatim-watch', ['verbatim'], reload);

gulp.task("html", function(){
    return gulp.src(paths.html.src)
        .pipe(swig({
            defaults: {
                cache: false
            }
        }))
        .pipe(htmlmin({
          collapseWhitespace: true,
          removeComments: true,
          removeAttributeQuotes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyJS: true,
          minifyCSS: true
        }))
        .pipe(gulp.dest(paths.html.dest));
});

gulp.task("less", function(){
    return gulp.src(paths.less.src)
        .pipe(sourcemaps.init())
        .pipe(less({
            paths: ["bower_components/bootstrap/less","bower_components/animate.less/"]
        }).on('error', gutil.log))
        .pipe(prefixer('last 3 versions'))
        .pipe(cssmin())
        .pipe(concat("main.min.css"))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.css.dest))
        .pipe(filter("**/*.css"))
        .pipe(browserSync.stream());
});

gulp.task("scripts", function(){
    return gulp.src(mainBowerFiles().concat(paths.javascript.src))
		.pipe(filter('*.js'))
		.pipe(concat('app.min.js'))
		.pipe(uglify())
        .pipe(gulp.dest(paths.javascript.dest));
});

gulp.task("images", function(){
    return gulp.src(paths.images.src)
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(paths.images.dest));
});

gulp.task("ico", function(){
    return gulp.src(paths.ico.src)
        .pipe(gulp.dest(paths.ico.dest));
});

gulp.task("bower", function(){
    return gulp.src(mainBowerFiles(), {base: "bower_components"})
        .pipe(gulp.dest(paths.bower.dest));
});

gulp.task("verbatim", function(){
    gulp.src(paths.verbatim.src)
        .pipe(gulp.dest(paths.verbatim.dest));
});

// Static Server + watching scss/html files
gulp.task('serve', ['bower','html','less','scripts','images','ico','verbatim'], function() {

    browserSync.init({
        server: "build"
    });

    gulp.watch(paths.less.src, ['less']);
    gulp.watch(paths.html.src, ['html']).on("change", browserSync.reload);
    gulp.watch(paths.javascript.src, ['js-watch']);
    gulp.watch(paths.bower.src, ['bower-watch']);
    gulp.watch(paths.images.src, ['img-watch']);
    gulp.watch(paths.ico.src, ['ico-watch']);
    gulp.watch(paths.verbatim.src, ['verbatim-watch']);

});

gulp.task('default', ['serve']);
