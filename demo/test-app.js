define([
    "angular",
    "ng-ui-app"
], function(angular){
    "use strict";
    var module = angular.module("test", ["ngUI"]);
    module.provider({
        $rootElement: function(){
            this.$get = function(){return angular.element(document);};
        }
    });
    return module;
});