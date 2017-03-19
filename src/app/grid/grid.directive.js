define([
    "./grid.module",
    "./grid.controller",
    "./grid.head-cell.directive",
    "./grid.header.directive",
    "./grid.row-cell.directive",
    "./grid.row.directive"
], function(app) {
    "use strict";
    app.directive("uiGrid", gridDirective);

    /* @ngInject */
    function gridDirective() {
        var directive = {
            restrict: "A",
            templateUrl: "{themed}/grid/ui-grid.html",
            replace: true,
            scope: false,
            controller: "UIGridController",
            controllerAs: "grid",
            bindToController: {
                "$delegate": "=uiGrid"
            },
            link: gridPostLink
        };
        return directive;

        function gridPostLink(scope, element, attrs, grid) {
            var cancelWatchOption = scope.$watch("grid.$delegate", function(delegate){
                if(delegate){
                    cancelWatchOption();
                    scope.delegate = delegate;
                    grid.activate(delegate);
                }
            });

            scope.$on("$destroy", function() {
                grid.destroy();
            });
        }
    }
});