// optimizejsTask.dependTask = ["jshint", "html2js"];

module.exports = optimizejsTask;

function optimizejsTask(){
    var gulp = require("gulp");
    var sourcemap = require("gulp-sourcemaps");

    var requirejsOptimize = require('gulp-requirejs-optimize');
    var ngAnnotate = require("gulp-ng-annotate");
    var rename = require("gulp-rename");
    var uglify = require("gulp-uglify");
    var concat = require("gulp-concat");

    var amdOptions = require("./snippets/amd.options.json");

    var stream =
		gulp
        .src("src/app/ng-ui-app.js")
        .pipe(sourcemap.init({
            loadMaps: true
        }))
        .pipe(requirejsOptimize(amdOptions))
        .pipe(concat("ng-ui.js"))
        .pipe(ngAnnotate())
        .pipe(gulp.dest("./dist"))
        .pipe(rename("ng-ui.min.js"))
        .pipe(uglify({
            preserveComments: "license"
        }))
        .pipe(sourcemap.write("/", {
            includeContent: true,
            debug: false
        }));

        stream.pipe(gulp.dest("./dist"));

		return stream;
}