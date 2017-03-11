define([
    "jquery",
    "var/noop"
], function($, noop) {
    "use strict";
    return {
        type: "cell",
        name: "value",
        priority: 0,
        header: noop,
        row: function(options) {
            var element = options.element;
            element.addClass("grid_value");
            var $value = $("<span>");
            $value.attr("ng-bind", "$rowdata[$column.def.field]");
            element.append($value);
        }
    };
});