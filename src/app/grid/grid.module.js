define([
    "angular",
    "widgets/widgets-require",
    "ajax/ajax-require",
    "themed/themed-require",
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