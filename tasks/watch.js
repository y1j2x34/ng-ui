watchTask.dependTask = ["compile-scss"];
module.exports = watchTask;

function watchTask(){
    var gulp = require("gulp");
    gulp.watch("src/style/bootstrap/**/*.scss", ["sass"]);
}