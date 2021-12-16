const gulp = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();

function followStyles() {
  return gulp.src('src/style/**/*.scss')
    .pipe(scss())
    .pipe(cleanCss())
    .pipe(
      rename({
        extname: '.min.css'
      })
    )
    .pipe(gulp.dest('./dist/styles/'))
    .pipe(browserSync.stream());
}

function followScripts(){
  return gulp.src('src/script/*.ts')
    .pipe(ts())
    .pipe(
      uglify()
    )
    .pipe(
      rename({
        extname: '.min.js'
      })
    )
    .pipe(gulp.dest('./dist/script/'))
    .pipe(browserSync.stream());
}

function reloadHtml(done) {
  browserSync.reload();
  done();
}

function watchApplication() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
  gulp.watch('./src/style/**/*.scss', followStyles);
  gulp.watch('./src/script/**/*.ts', followScripts);
  gulp.watch('./*.html', reloadHtml);
}

gulp.task('watchApplication', watchApplication);
gulp.task('buildApplication', gulp.parallel(followStyles, followScripts));
gulp.task('startApplication', gulp.series('buildApplication', 'watchApplication'));