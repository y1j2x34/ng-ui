define([
    "angular"
],function(angular){
    "use strict";
    var moduleName = "ngUI.log";
    try{
        return angular.module(moduleName, []);
    }catch(e){
        return angular.module(moduleName);
    }
});