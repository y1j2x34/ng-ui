module.exports = function() {
    var gulp = require("gulp");
    var jshint = require("gulp-jshint");
    var map = require("map-stream");
    return gulp
        .src(["src/app/**/*.js", "!src/app/**/*.spec.js"])
        .pipe(jshint())
        .pipe(jshint.reporter("default"))
        .pipe(map(function(file) {
            if (file.jshint && !file.jshint.success) {
                console.error("脚本错误！请修改正确后重新构建！");
                process.exit(1);
            }
        }));
};