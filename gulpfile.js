const gulp = require('gulp');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const cssmin = require('gulp-cssmin');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const jsImport = require('gulp-js-import');
const sourcemaps = require('gulp-sourcemaps');
const htmlPartial = require('gulp-html-partial');
const clean = require('gulp-clean');
const webp = require('gulp-webp');
const isProd = process.env.NODE_ENV === 'prod';

const htmlFile = [
    'src/*.html'
]

function html() {
    return gulp.src(htmlFile)
        .pipe(htmlPartial({
            basePath: 'src/includes/'
        }))
        .pipe(gulpIf(isProd, htmlmin({
            // collapseWhitespace: true
        })))
        .pipe(gulp.dest('dist'));
}

function app_css() {
    return gulp.src('src/assets/sass/app.scss')
        .pipe(gulpIf(!isProd, sourcemaps.init()))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpIf(!isProd, sourcemaps.write()))
        .pipe(gulpIf(isProd, cssmin()))
        .pipe(concat('app.min.css'))
        .pipe(gulp.dest('dist/assets/css/'));
}

function plugins_css() {
  return gulp.src('src/assets/sass/plugins.scss')
      .pipe(gulpIf(!isProd, sourcemaps.init()))
      .pipe(sass().on('error', sass.logError))
      .pipe(gulpIf(!isProd, sourcemaps.write()))
      .pipe(gulpIf(isProd, cssmin()))
      .pipe(concat('plugins.min.css'))
      .pipe(gulp.dest('dist/assets/css/'));
}

function app_js() {
    return gulp.src('src/assets/js/app.js')
        .pipe(jsImport({
            hideConsole: true
        }))
        .pipe(concat('app.min.js'))
        .pipe(gulpIf(isProd, uglify()))
        .pipe(gulp.dest('dist/assets/js'));
}

function plugins_js() {
  return gulp.src('src/assets/js/plugins.js')
      .pipe(jsImport({
          hideConsole: true
      }))
      .pipe(concat('plugins.min.js'))
      .pipe(gulpIf(isProd, uglify()))
      .pipe(gulp.dest('dist/assets/js'));
}

function img() {
    return gulp.src('src/assets/img/*')
        .pipe(gulpIf(isProd, imagemin()))
        .pipe(gulp.dest('dist/assets/img/'));
}

function uploads() {
  return gulp.src('src/uploads/*')
      .pipe(gulpIf(isProd, imagemin()))
      .pipe(gulp.dest('dist/uploads/'));
}

function img_webp() {
  return gulp.src('src/assets/img/*')
      .pipe(webp())
      .pipe(gulpIf(isProd, imagemin()))
      .pipe(gulp.dest('dist/assets/img/'));
}

function uploads_webp() {
return gulp.src('src/uploads/*')
    .pipe(webp())
    .pipe(gulpIf(isProd, imagemin()))
    .pipe(gulp.dest('dist/uploads/'));
}

function serve() {
    browserSync.init({
        open: true,
        server: './dist'
    });
}

function browserSyncReload(done) {
    browserSync.reload();
    done();
}


function watchFiles() {
    gulp.watch('src/**/*.html', gulp.series(html, browserSyncReload));
    gulp.watch('src/assets/sass/plugins.scss', gulp.series(plugins_css, browserSyncReload));
    gulp.watch('src/assets/sass/app.scss', gulp.series(app_css, browserSyncReload));
    gulp.watch('src/assets/js/*.js', gulp.series(app_js, browserSyncReload));
    gulp.watch('src/assets/js/*.js', gulp.series(plugins_js, browserSyncReload));
    gulp.watch('src/assets/img/**/*.*', gulp.series(img));
    gulp.watch('src/uploads/**/*.*', gulp.series(uploads));
    gulp.watch('src/assets/img/**/*.*', gulp.series(img_webp));
    gulp.watch('src/uploads/**/*.*', gulp.series(uploads_webp));
    return;
}

function del() {
    return gulp.src('dist/*', {read: false})
        .pipe(clean());
}

exports.html = html;
exports.app_css = app_css;
exports.plugins_css = plugins_css;
exports.app_js = app_js;
exports.plugins_js = plugins_js;
exports.del = del;
exports.serve = gulp.parallel(html, app_css, plugins_css, app_js, plugins_js, img, uploads, img_webp, uploads_webp, watchFiles, serve);
exports.default = gulp.series(del, html, app_css, plugins_css, app_js, plugins_js, img, uploads, img_webp, uploads_webp);