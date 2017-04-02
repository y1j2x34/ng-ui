define([
    "./grid.module",
    "angular",
    "underscore",
    "utils/random.util"
], function(app, angular, _, RandomUtil) {
    "use strict";

    app.directive("uiGridRowCell", uiGridCellDirective);

    /* @ngInject */
    function uiGridCellDirective($compile, $window, $timeout) {
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

        function gridCellPreLink(scope, element, attrs, grid) {
            var $column = scope.$column;
            scope.$header = $column.def;
            var $rowdata = scope.$rowdata;
            _(
                _.filter($column.renderers, function(renderer){
                    return _.isFunction(renderer.render);
                })
            ).each(function(renderer){
                element.addClass("ui_grid_cell_rendered--" + renderer.name);
                renderer.render({
                    element: element,
                    value: renderer.def,
                    rowdata: $rowdata,
                    column: $column,
                    grid: grid,
                    rowIndex: scope.$rowIndex
                });
            });
            $compile(element.contents())(scope);
        }

        function gridCellPostLink(scope, element, attrs, grid) {
            if(!grid.delegate.fixHeader){
                return;
            }
            var $column = scope.$column;
            // var header = $column.def;
            var columnIndex = $column.columnIndex;
            var $rowIndex = scope.$rowIndex;

            if ($rowIndex === 0) {
                autoAdjustWidth(scope, element, $column, columnIndex);
            }
        }

        function autoAdjustWidth(scope, element, $column, columnIndex) {
            var $header = element.closest(".grid_container") //
                        .find(".grid_header table>thead>tr>th") //
                        .eq(columnIndex);
            var resizeEventId = RandomUtil.unique("resize.");

            jqWindow.on(resizeEventId, function() {
                adjustCellWidth();
            });

            scope.$on("$destroy", function() {
                jqWindow.off(resizeEventId);
            });

            adjustCellWidth();
            var timmerPromise = $timeout(function(){
                adjustCellWidth();
                $timeout.cancel(timmerPromise);
            });

            function adjustCellWidth() {
                var columnWidth = $header.outerWidth();
                setElementWidth(element, Math.floor(columnWidth));
            }
            var lastWidth;
            function setElementWidth(element, width) {
                if(lastWidth === width){
                    return;
                }
                lastWidth = width;
                element.css({
                    "max-width": width,
                    "width": width,
                    "min-width": width
                });
            }
        }
    }
});