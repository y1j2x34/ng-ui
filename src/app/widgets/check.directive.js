define([
    "./widget.module"
], function(app){
    "use strict";
    app.directive("uiCheck", checkDirective);

    /* @ngInject */
    function checkDirective(){
        var directive = {
            restrict: "A",
            require: "ngModel",
            templateUrl: "{theme}/widget/check.html",
            replace: true,
            bindToController: {
                type: "@?",
                value: "=ngModel",
                ngChange:"&ngChange",
                trueValue:"=?ngTrueValue",
                falseValue:"=?ngFalseValue"
            },
            controller: CheckController,
            controllerAs: "check"
        };
        return directive;
    }
    /* @ngInject */
    function CheckController(){

    }
});