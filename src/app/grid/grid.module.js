define([
    "angular",
    "widgets/widgets-require",
    "ajax/ajax-require",
    "angular-sanitize",
    "underscore",
    "jquery"
], function(angular, widgetModuleName, ajaxModuleName){
    "use strict";
    return angular.module("ngUI.grid", [
        "ng",
        "ngSanitize",
        widgetModuleName,
        ajaxModuleName
    ]);
});