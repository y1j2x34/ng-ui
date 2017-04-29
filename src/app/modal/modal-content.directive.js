define([
    "angular",
    "./modal.module",
    "./modal.provider"
], function(angular, app){
    "use strict";
    app.directive("uiModalContent", modalContentDirective);

    /* @ngInject */
    function modalContentDirective($controller, $compile, $modal){
        var directive = {
            restrict: "A",
            require: "^^uiModal",
            link: modalContentPostLink
        };
        return directive;

        function modalContentPostLink(scope, element, attrs, modalCtrl){
            var model = modalCtrl.model;
            var controller = model.controller;
            var controllerAs = model.controllerAs;

            var _scope = scope.$new();
            var ctrl = $controller(controller, {
                scope: _scope,
                $modal: modalCtrl,
                $modalModel: model,
                $modalData: model.data
            });
            _scope[controllerAs] = ctrl;
            _scope.contentTemplateUrl = $modal.contentTemplateUrl;

            var contents = angular.element("<ng-include>");
            element.append(contents);

            contents.attr("src", "contentTemplateUrl");
            contents.data("$ngControllerController", ctrl);
            $compile(contents)(_scope);
        }
    }
});