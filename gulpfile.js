//create dist folder
//copy files to dist folder
//compile sass to css
//lint js and css
//compress, transpile and concat js
//optimize images and png
//create json server using gulp
//use browser sync
//create source maps

const gulp = require('gulp');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const browserSync = require('browser-sync').create();
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const useref = require('gulp-useref');
const jsonServer = require("gulp-json-srv");

const server = jsonServer.create({
    port: 3005,
    id: '_id',
});



gulp.task("json-server", function () {
    return gulp.src("data/restaurants.json")
        .pipe(server.pipe());
});

//browser sync task
gulp.task('serve', ['html', 'sass', 'index-js', 'restaurent-detail-js', 'vendor-js', 'img', 'copyfiles'], function () {

    browserSync.init({
        server: "./dist",
        //        https: {
        //            key: "wshwsh.key",
        //            cert: "wshwsh.com.crt"
        //        }
    });

    gulp.watch("app/scss/*.scss", ['sass']);
    gulp.watch("app/js/*.js", ['index-js', 'restaurent-detail-js', 'vendor-js']);
    gulp.watch("app/*.html", ['html']).on('change', browserSync.reload);
    gulp.watch("'sw.js'", ["copyfiles"]);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function () {
    return gulp.src("app/scss/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
        }))
        //.pipe(concat('main.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("dist/css"))
        .pipe(browserSync.stream());
});

// process JS files and return the stream.
gulp.task('index-js', function () {
    return gulp.src([
                    'app/js/indexdbhelper.js',
                     'app/js/dbhelper.js',
                    'app/js/swhelper.js',

                     'app/js/index.js',
                    ])
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('index.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream());
});
gulp.task('restaurent-detail-js', function () {
    return gulp.src([
        'app/js/indexdbhelper.js',
                     'app/js/dbhelper.js',
                    'app/js/swhelper.js',
                     'app/js/restaurant_info.js'
                    ])
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('restaurant_info.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream());
});
gulp.task('vendor-js', function () {
    return gulp.src(['app/js/blazy.js',
                    'app/js/idb.js',
                    ])
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream());
});

gulp.task('img', function () {
    return gulp.src("app/img/*")
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream());
});

gulp.task('html', function () {
    return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('copyfiles', function () {
    return gulp.src(['.htaccess', 'favicon.ico', 'humans.txt', 'app/icon.png', 'app/icon-512.png', 'manifest.json', 'robots.txt', 'sw.js'])
        .pipe(gulp.dest('dist'));
});

gulp.task('lint', function () {
    return gulp.src('js/*js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
});

gulp.task('default', ['serve']);
