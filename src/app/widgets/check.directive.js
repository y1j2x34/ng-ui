define([
    "./widget.module"
], function(app){
    "use strict";
    app.directive("uiCheck", checkDirective);

    /* @ngInject */
    function checkDirective($templateRequest){
        var directive = {
            restrict: "A",
            require: "ngModel",
            compile: checkCompile
        };
        return directive;

        function checkCompile(){
            var templateUrl = "{themed}/widget/check.html";
            $templateRequest(templateUrl).then(function(){

            });
        }
    }
});