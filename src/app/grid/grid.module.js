define([
    "angular",
    "widgets/index",
    "ajax/index",
    "themed/index",
    "angular-sanitize",
    "underscore",
    "jquery"
], function(angular, widgetModuleName, ajaxModuleName, themedModuleName) {
    "use strict";
    return angular.module("ngUI.grid", [
        "ng",
        "ngSanitize",
        widgetModuleName,
        ajaxModuleName,
        themedModuleName
    ]);
});