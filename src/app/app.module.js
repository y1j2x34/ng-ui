define([
    "grid/grid-require",
    "validation/validation-require",
    "themed/themed-require",
    "partials"
], function(uiGridModuleName, themedModuleName, validationModuleName){
    "use strict";
    var deps = [
        "ng",
        "ngUI.partials",
        uiGridModuleName,
        validationModuleName,
        themedModuleName
    ];
    return angular.module("ngUI", deps);
});
