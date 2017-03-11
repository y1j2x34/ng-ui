define([
    "angular",
    "widgets/widgets-require",
    "angular-sanitize",
    "underscore",
    "jquery"
], function(angular, widgetModuleName){
    "use strict";
    return angular.module("ngUI.grid", [
        "ng",
        "ngSanitize",
        widgetModuleName
    ]);
});