define([
    "angular",
    "blocks/log/log-require",
    "themed/themed-require",
    "jquery",
], function(angular, logModuleName, themedModuleName) {
    "use strict";
    return angular.module("ngUI.widget", [logModuleName, themedModuleName]);
});