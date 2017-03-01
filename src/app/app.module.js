define([
    "angular",
    "grid/grid-require",
    "validation/validation-require",
    "partials"
], function(angular, uiGridModuleName, validationModuleName){
    "use strict";
    var deps = [
        "ng",
        "ngUI.partials",
        uiGridModuleName,
        validationModuleName
    ];
    return angular.module("ng-ui", deps);
});
