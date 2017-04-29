define([
    "angular",
    "./grid.module"
], function(angular, app) {
    "use strict";
    app.directive("uiGridRow", gridRowDirective);

    /* @ngInject */
    function gridRowDirective() {
        var directive = {
            restrict: "A",
            require: "^^uiGrid",
            controller: angular.noop,
            controllerAs: "rowCtrl",
            link: postLink
        };
        return directive;

        function postLink($scope, element, attr, grid) {
            // $scope.rowCtrl.__init__($scope.$rowdata, grid);
            element.find(">*").click(function(e) {
                e.stopPropagation();
            });

            var rowRenderers = grid.getRowRenderers();

            angular.forEach(rowRenderers, function(renderer){
                renderer.render({
                    element: element,
                    value: renderer.def,
                    rowIndex: $scope.$index,
                    rowdata: $scope.$rowdata
                });
            });
        }
    }

});