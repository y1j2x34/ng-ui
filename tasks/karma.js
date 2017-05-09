module.exports = karma;
karma.dependTask = [];

function karma(done){
    var KarmaServer = require("karma").Server;
    var currentdir = __dirname;
    currentdir = currentdir.slice(0, currentdir.lastIndexOf("\\"));

    new KarmaServer({
        configFile: currentdir + "/karma.config.js"
    }, done).start();
}