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
	id:   '_id',
});



gulp.task("json-server", function(){
    return gulp.src("data/restaurants.json")
        .pipe(server.pipe());
});

//browser sync task
gulp.task('serve', ['html', 'sass', 'js', 'img', 'copyfiles','json-server'], function () {

    browserSync.init({
        server: "./dist"
    });

    gulp.watch("app/scss/*.scss", ['sass']);
    gulp.watch("app/js/*.js", ['js']);
    gulp.watch("app/*.html").on('change', browserSync.reload);
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
        .pipe(concat('main.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("dist/css"))
        .pipe(browserSync.stream());
});

// process JS files and return the stream.
gulp.task('js', function () {
    return gulp.src(['app/js/blazy.js',
                    'app/js/idb.js',
                    'app/js/swhelper.js',
                     'app/js/dbhelper.js',
                     'app/js/index.js',
                     'app/js/restaurant_info.js'
                    ])
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream());
});

gulp.task('img', function () {
    return gulp.src("app/img/*")
        .pipe(imagemin({
            progressive: true,
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
