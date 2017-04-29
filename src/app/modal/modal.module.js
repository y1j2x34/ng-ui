define([
    "angular",
    "blocks/log/log-require",
    "validation/validation-require",
    "themed/themed-require",
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