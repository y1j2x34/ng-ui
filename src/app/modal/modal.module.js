define([
    "angular",
    "blocks/log/log-require",
    "../validation/validation-require"
], function(angular, logModuleName, validationModuleName){
    "use strict";
    return angular.module("ngUI.modal",[logModuleName, validationModuleName]);
});