define([
    "./grid.module",
    "underscore"
], function(app, _) {
    "use strict";

    app.directive("uiHeadGridCell", gridHeadCellDirective);

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
            _(header.renderers)
                .filter(_.isFunction)
                .each(function(render) {
                    render(element, header.def, grid);
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
