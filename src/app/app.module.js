define([
    "grid/grid-require",
    "validation/validation-require",
    "themed/themed-require",
    "i18n/i18n-require",
    "blocks/log/log-require",
    "ajax/ajax-require",
    "modal/modal-require",
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
