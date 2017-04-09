define([
    "./log.module",
    "./configure"
], function(app, LoggerConfigure){
    "use strict";

    LoggerProvider.prototype = LoggerConfigure;

    app.provider("$logger", LoggerProvider);

    function LoggerProvider(){
        var self = this;
        self.$get = function(){
            return LoggerConfigure;
        };
    }
});