define([
    "grid/index",
    "validation/index",
    "themed/index",
    "i18n/index",
    "blocks/log/index",
    "ajax/index",
    "modal/index",
    "partials"
], function(uiGridModuleName, themedModuleName, validationModuleName, i18nModuleName, logModuleName, ajaxModuleName, modalModuleName){
    "use strict";
    var deps = [
        "ng",
        "ngUI.partials",
        uiGridModuleName,
        validationModuleName,
        themedModuleName,
        i18nModuleName,
        logModuleName,
        ajaxModuleName,
        modalModuleName
    ];
    return angular.module("ngUI", deps);
});
