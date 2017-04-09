define([
    "supports/Class"
], function(Class) {
    "use strict";

    var LEVEL_NO = {
        "error": 80000,
        "warn": 40000,
        "info": 20000,
        "debug": 0,
        "log": NaN
    };

    return Class.singleton({
        name: "LoggerConfigure",
        init: function(self) {
            self.level = LEVEL_NO.debug;
        },
        isLoggable: isLoggable,
        config: config,
        $setLogger: function(self, Logger){
            self.Logger = Logger;
            Logger.$updateLogLevel();
        }
    });

    function config(self, options) {
        if (!options) {
            return;
        }
        var levelName = options.level;
        var levelNo = LEVEL_NO[levelName];
        if (levelNo !== undefined && self.level !== levelNo) {
            self.level = levelNo;
            var Logger = self.Logger;
            if(Logger){
                Logger.$updateLogLevel();
            }
        }
    }

    function isLoggable(self, levelName) {
        var levelNo = LEVEL_NO[levelName];
        return levelNo >= self.level || levelName === "log";
    }
});