define([
    "./grid.module",
    "underscore"
], function(app, _) {
    "use strict";

    app.directive("uiGridHeadCell", gridHeadCellDirective);

    /* @ngInject */
    function gridHeadCellDirective($compile, $timeout) {
        var directive = {
            restrict: "A",
            require: "^^uiGrid",
            link: {
                pre: preLink
            }
        };
        return directive;

        function preLink(scope, element, attrs, grid) {
            var header = scope.header;
            _(
                _.filter(header.renderers, function(render) {
                    return _.isFunction(render.render);
                })
            ).each(function(renderer) {
                renderer.render(element, header.def, grid);
                element.addClass("ui_grid_head_rendered--" + renderer.name);
            });

            $compile(element.contents())(scope);

            return $timeout(function() {
                var width;
                if (header.def.width) {
                    width = Math.max(50, Math.floor(header.def.width));
                } else {
                    width = element.outerWidth();
                }

                element.attr("width", width);
                element.css({
                    "width": width,
                    "min-width": width,
                    "max-width": width
                });

                header.realWidth = element.outerWidth();

            });
        }
    }
});