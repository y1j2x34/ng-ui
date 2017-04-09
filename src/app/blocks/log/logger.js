define([
    "supports/Class",
    "./configure"
],function(Class, configure){
    "use strict";

    var console = window.console;
    var requestIdleCallback = window.requestIdleCallback || function(callback){
        var timmerId = window.setTimeout(function(){
            window.clearTimeout(timmerId);
            callback();
        },0);
    };

    var LOG_LEVELS = ["debug", "info", "warn", "error", "log"];

    var Logger = Class.singleton("Logger", {
        $updateLogLevel: onUpdateLogLevel,
        log: wrapper("log"),
        isDebugEnabled: isDebugEnabled,
        isInfoEnabled: isInfoEnabled,
        isWarnEnabled: isWarnEnabled,
        isErrorEnabled: isErrorEnabled
    });
    configure.$setLogger(Logger);
    return Logger;

    function onUpdateLogLevel(){
        for(var i =LOG_LEVELS.length-2;i >= 0; i--){
            var logLevelName = LOG_LEVELS[i];
            Logger[logLevelName] = wrapper(logLevelName);
        }
    }

    function isDebugEnabled(){
        return configure.isLoggable("debug");
    }
    function isInfoEnabled(){
        return configure.isLoggable("debug");
    }
    function isWarnEnabled(){
        return configure.isLoggable("warn");
    }
    function isErrorEnabled(){
        return true;
    }

    function wrapper(levelName){
        if(configure.isLoggable(levelName)){
            return function(self){
                var stack = new Error().stack;
                var _args = arguments;
                requestIdleCallback(function(){
                   var stacks;
                   if(!stack){
                       stacks = ["<unknown>", "<unknown>", "at <unknown>"];
                   }else{
                       stacks = stack.split("\n");
                   }
                   var args = Array.prototype.slice.apply(_args);
                   log.call(self, levelName, stacks, args);
                });
            };
        }else{
            return noop;
        }
    }
    function log(level, stacks, args) {
        var place = stacks[2];
        var file;
        var method;
        var indexOfBracket = place.indexOf("(");
        if(indexOfBracket !== -1){
            file = place.substring(place.indexOf('(') + 1, place.length - 1);
            method = place.substring(place.indexOf('at') + 3, indexOfBracket - 1);
        }else{
            file = place.substring(place.indexOf('at') + 3);
            method = "<anonymous>";
        }

        var loc = "Location: " + method + " (" + file + ")";

        var _logr = console[level] || noop;
        if (!_logr) {
            console.error("错误的日志级别：" + level);
            return;
        }
        args.push("\n"+loc);
        _logr.apply(console, args);
    }
    function noop(){}
});