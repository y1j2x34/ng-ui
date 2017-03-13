define([
    "grid/grid-require",
    "validation/validation-require",
    "themed/themed-require",
    "i18n/i18n-require",
    "partials"
], function(uiGridModuleName, themedModuleName, validationModuleName, i18nModuleName){
    "use strict";
    var deps = [
        "ng",
        "ngUI.partials",
        uiGridModuleName,
        validationModuleName,
        themedModuleName,
        i18nModuleName
    ];
    return angular.module("ngUI", deps);
});
