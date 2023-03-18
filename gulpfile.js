const gulp        = require('gulp');
const browserSync = require('browser-sync');

gulp.task('server', function() {

    browserSync({
        server: {
            baseDir: "build"
        }
    });

    gulp.watch("src/*.html").on('change', browserSync.reload);
});

gulp.task('html', function() {
    return gulp.src("src/*.html")
        .pipe(gulp.dest("build/"));
});

gulp.task('scripts', function() {
    return gulp.src("src/js/**/*.js")
        .pipe(gulp.dest("build/js"));
});

gulp.task('json', function() {
    return gulp.src("src/json/**/*.json")
        .pipe(gulp.dest("build/json"));
});

gulp.task('default', gulp.parallel('server', 'html', 'scripts', 'json'));