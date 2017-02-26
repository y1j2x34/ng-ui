"use strict";

var gulp = require("gulp");
var webserver = require("gulp-webserver");
var jshint = require('gulp-jshint');
var map = require("map-stream");

var opts = require("./gulp-options.json");

gulp.task("webserver", webserverTask);
gulp.task("validatejs", validatejsTask);

function webserverTask(){
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
