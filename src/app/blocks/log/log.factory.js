define([
    "./log.module",
    "./log.provider"
], function(app){
    "use strict";
    app.factory("logger", loggerFactory);
    /* @ngInject */
    function loggerFactory($logger){
        return $logger.Logger;
    }
});