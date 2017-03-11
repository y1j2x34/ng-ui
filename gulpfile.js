"use strict";

var gulp = require("gulp");
var webserver = require("gulp-webserver");
var jshint = require('gulp-jshint');
var map = require("map-stream");

var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var requirejsOptimize = require('gulp-requirejs-optimize');
var replace = require("gulp-replace");

var ngAnnotate = require("gulp-ng-annotate");
var ngHtml2Js = require("gulp-ng-html2js");

var minifyHtml = require("gulp-minify-html");
var wrap = require("gulp-wrap");

var opts = require("./gulp.options.json");
var amdOptions = require("./src/app/amd.options.json");

gulp.task("webserver", webserverTask);
gulp.task("validatejs", validatejsTask);
gulp.task("html2js", ngHtml2JsTask);
gulp.task("opitimizejs", ["validatejs", "html2js"], opitimizejsTask);
gulp.task("default", ["opitimizejs"]);

function webserverTask() {
    var stream = gulp.src("./").pipe(webserver(opts.webserver));
    stream.emit("kill");
}

var exitOnJshintError = map(function(file) {
    if (file.jshint && !file.jshint.success) {
        console.error("脚本错误！请修改正确后重新构建！");
        process.exit(1);
    }
});

function validatejsTask() {
    gulp.src(opts.source.js)
        .pipe(jshint())
        .pipe(jshint.reporter("default"))
        .pipe(exitOnJshintError);
}

function ngHtml2JsTask() {
    return gulp.src(opts.partials.sources)
        .pipe(minifyHtml(opts.partials.minifyHtmlOptions))
        .pipe(ngHtml2Js(opts.partials.html2jsOptions))
        .pipe(concat(opts.partials.concatName))
        .pipe(wrap({
            src: "wrap-partials.tpl"
        }, {}, {
            parse: false
        }))
        .pipe(gulp.dest(opts.partials.destPath));
}

function opitimizejsTask() {
    var opitimizeOptions = opts.opitimize;

    var sourcemapOptions = {
        mapSources: function(sourcePath) {
            // 无特殊处理
            return sourcePath;
        }
    };
    var sourcemapWrieOptions = opitimizeOptions.sourcemap.writeOptions;

    for (var key in sourcemapWrieOptions) {
        sourcemapOptions[key] = sourcemapWrieOptions[key];
    }

    var gulppipe =
		gulp
        .src("src/app/ng-ui-app.js")
        .pipe(sourcemap.init(opitimizeOptions.sourcemap.initOptions))
        .pipe(requirejsOptimize(amdOptions))
        .pipe(concat("ng-ui.js"))
        .pipe(replace(/\$\{env\}/g, opts.env))
        .pipe(ngAnnotate())
        .pipe(gulp.dest(opitimizeOptions.dest))
        .pipe(rename("ng-ui.min.js"))
        .pipe(uglify(opitimizeOptions.uglify))
        .pipe(sourcemap.write("/", sourcemapOptions));

        gulppipe.pipe(gulp.dest(opitimizeOptions.dest));

		return gulppipe;
}