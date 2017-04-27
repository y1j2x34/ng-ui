var gulp = require("gulp");
var requireDir = require("require-dir");

var tasks = requireDir("./tasks");
for(var name in tasks){
    var taskFn = tasks[name];
    if(taskFn instanceof Function){
        gulp.task(name, taskFn.dependTask || [], taskFn);
    }
}