define([
    "angular",
    "blocks/log/index",
    "themed/index",
    "jquery",
], function(angular, logModuleName, themedModuleName) {
    "use strict";
    return angular.module("ngUI.widget", [logModuleName, themedModuleName]);
});