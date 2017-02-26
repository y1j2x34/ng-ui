define([
    "angular",
    "widgets/widgets-require"
], function(angular, widgetModuleName){
    "use strict";
    return angular.module("ngUI.grid", [
        "ng",
        "ngSanitize",
        widgetModuleName
    ]);
});