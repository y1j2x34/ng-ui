define([
    "angular",
    "./test-app",
    "hello.controller"
], function(angular, app){
    "use strict";
    angular.bootstrap(document.body, [app.name]);
});