define([
    "angular",
    "grid/grid-require",
    "validation/validation-require"
], function(angular, uiGridModuleName, validationModuleName){
    "use strict";
    var deps = [
        "ng",
        uiGridModuleName,
        validationModuleName
    ];
    return angular.module("ng-ui", deps);
});
