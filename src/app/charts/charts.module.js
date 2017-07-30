define([
    "angular",
    "blocks/log/index",
], function(angular, logModuleName){
    "use strict";
    return angular.module("ngUI.charts", [logModuleName]);
});