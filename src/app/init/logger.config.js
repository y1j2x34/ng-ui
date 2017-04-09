define([
    "app.module"
], function(app){
    "use strict";
    app.config(configLogger);

    /* @ngInject */
    function configLogger($loggerProvider){
        $loggerProvider.config({
            level: "debug"
        });
    }
});