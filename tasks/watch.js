watchTask.dependTask = ["compile-scss"];
module.exports = watchTask;

function watchTask(){
    var gulpe = require("gulp");
    gulp.watch("src/style//bootstrap/**/*.scss", ["sass"]);
}