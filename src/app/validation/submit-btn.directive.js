define([
    "./validation.module",
    "./validation.config"
], function(app){
    "use strict";
    app.directive("uiSubmitBtn", submitBtnDirective);

    /* @ngInject */
    function submitBtnDirective(){
        var directive = {
            restrict: "A",
            require: "^^?form",
            link: submitBtnLink
        };
        return directive;

        function submitBtnLink(scope, element, attrs, formCtrl){
            if(!formCtrl){
                formCtrl = scope.$eval(attrs.uiSubmitBtn);
            }
            if(!formCtrl){
                throw new Error("uiSubmitBtn缺少表单元素");
            }
            element.on("click",function(){
                var ngDisabled = attrs.ngDisabled;
                if(ngDisabled){
                    var disabled = scope.$eval(attrs.ngDisabled);
                    if(disabled) return;
                }
                formCtrl.$submit();
            });
        }
    }
});