define([
    "./grid.module",
    "angular",
    "underscore",
    "utils/random.util"
], function(app, angular, _, RandomUtil) {
    "use strict";

    app.directive("uiGridRowCell", uiGridCellDirective);

    /* @ngInject */
    function uiGridCellDirective($compile, $window) {
        var jqWindow = angular.element($window);
        var directive = {
            restrict: "A",
            require: "^^uiGrid",
            link: {
                pre: gridCellPreLink,
                post: gridCellPostLink
            }
        };
        return directive;

        function gridCellPreLink(scope, element) {
            var $column = scope.$column;
            scope.$header = $column.def;
            var $rowdata = scope.$rowdata;
            _(
                _.filter($column.renderers, function(renderer){
                    return _.isFunction(renderer.render);
                })
            ).each(function(renderer){
                element.addClass("ui_grid_row_rendered--" + renderer.name);
                renderer.render(element, $column, $rowdata);
            });
            $compile(element.contents())(scope);
        }

        function gridCellPostLink(scope, element) {
            var $column = scope.$column;
            // var header = $column.def;
            var columnIndex = $column.columnIndex;
            var $rowIndex = scope.$rowIndex;

            if ($rowIndex === 0) {
                autoAdjustWidth(scope, element, columnIndex);
            }
        }

        function autoAdjustWidth(scope, element, columnIndex) {
            var $header = element.closest(".grid_container").find(".grid_header table>thead>tr>th").eq(columnIndex);
            var resizeEventId = RandomUtil.unique("resize.");

            jqWindow.on(resizeEventId, function() {
                adjustCellWidth();
            });

            scope.$on("$destroy", function() {
                jqWindow.off(resizeEventId);
            });

            adjustCellWidth();

            function adjustCellWidth() {
                var columnWidth = $header.outerWidth();
                setElementWidth(element, columnWidth);
            }

            function setElementWidth(element, width) {
                element.css({
                    "max-width": width,
                    "width": width,
                    "min-width": width
                });
            }
        }
    }
});