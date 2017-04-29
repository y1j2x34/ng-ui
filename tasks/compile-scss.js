module.exports = function(){
    var sass = require("gulp-sass");
    var gulp = require("gulp");
    var sourcemap = require("gulp-sourcemaps");

    return gulp.src("src/style/bootstrap/ng-ui.scss")
            .pipe(sourcemap.init({
                loadMaps: true
            }))
            .pipe(sass({}).on("error", sass.logError))
            .pipe(sourcemap.write({
                includeContent: false,
                debug: true
            }))
            .pipe(gulp.dest("./dist/css"))
    ;
};