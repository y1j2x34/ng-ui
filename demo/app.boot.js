define([
    "angular",
    "./test-app",
    "./test-app.config",
    "hello.controller"
], function(angular, app){
    "use strict";
    angular.bootstrap(document.body, [app.name]);
});