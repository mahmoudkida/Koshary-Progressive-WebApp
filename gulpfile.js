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
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const browserSync = require('browser-sync').create();
var htmlmin = require('gulp-htmlmin');





//browser sync task
gulp.task('serve', ['sass', 'js', 'img'], function () {

    browserSync.init({
        server: "./dist"
    });

    gulp.watch("scss/*.scss", ['sass']);
    gulp.watch("js/*.js", ['js']);
    gulp.watch("*.html").on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function () {
    return gulp.src("scss/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
        }))
        .pipe(concat('main.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("dist/css"))
        .pipe(browserSync.stream());
});

// process JS files and return the stream.
gulp.task('js', function () {
    return gulp.src('js/*js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))

        .pipe(concat('main.js'))
        .pipe(sourcemaps.write())
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream());
});

gulp.task('img', function () {
    return gulp.src("img/*")
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('html', function () {
    return gulp.src('*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('copyfiles', function () {
     return gulp.src(['.htaccess','favicon.ico','humans.txt','icon.png','icon-512.png','manifest.json','robots.txt'])
     .pipe(gulp.dest('dist'));
});

gulp.task('default', ['serve']);
