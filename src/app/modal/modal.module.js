define([
    "angular",
    "blocks/log/index",
    "validation/index",
    "themed/index",
    "angular-sanitize",
], function(angular, logModuleName, validationModuleName, themedModuleName) {
    "use strict";
    return angular.module("ngUI.modal", [
        "ngSanitize",
        logModuleName,
        validationModuleName,
        themedModuleName
    ]);
});