module.exports = function(){
    var stream = gulp.src("./").pipe(webserver({
        "port": 8787,
        "livereload": true,
        "directoryListening": true,
        "open": false
    }));
    stream.emit("kill");
};