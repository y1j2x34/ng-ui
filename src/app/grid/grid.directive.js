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
    function gridDirective($grid) {
        var directive = {
            restrict: "A",
            template: "<div ng-include='grid.$templateUrl' >",
            replace: true,
            controller: "UIGridController",
            controllerAs: "grid",
            bindToController: {
                "options": "=uiGrid",
                "theme": "@?theme"
            },
            link: {
                pre: gridPreLink,
                post: gridPostLink
            }
        };
        return directive;

        function gridPreLink(scope, element, attrs, grid) {
            var theme = attrs.theme || $grid.theme;
            grid.$templateUrl = "src/partials/" + theme + "/ui-grid.html";
        }

        function gridPostLink(scope, element, attrs, grid) {
            grid.activate(grid.options);

            scope.$on("$destroy", function() {
                grid.destroy();
            });
        }
    }
});