define([
    "angular",
    "../themed/themed-require"
],function(angular, themedModuleName){
    "use strict";
    return angular.module("ngUI.validation", [themedModuleName]);
});