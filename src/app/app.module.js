define([
    "grid/index",
    "validation/index",
    "themed/index",
    "i18n/index",
    "blocks/log/index",
    "ajax/index",
    "modal/index",
    "charts/index",
    "partials"
], function(uiGridModuleName, themedModuleName, validationModuleName, i18nModuleName, logModuleName, ajaxModuleName, modalModuleName, chartsModuleName){
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
        modalModuleName,
        chartsModuleName
    ];
    return angular.module("ngUI", deps);
});
