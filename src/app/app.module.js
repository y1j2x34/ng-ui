define([
    "grid/grid-require",
    "validation/validation-require",
    "partials"
], function(uiGridModuleName, validationModuleName){
    "use strict";
    var deps = [
        "ng",
        "ngUI.partials",
        uiGridModuleName,
        validationModuleName
    ];
    return angular.module("ngUI", deps);
});
