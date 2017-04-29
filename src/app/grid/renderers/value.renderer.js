define([
    "jquery",
    "angular"
], function($, angular) {
    "use strict";
    return {
        type: "cell",
        name: "value",
        priority: 0,
        header: angular,
        row: function(options) {
            var element = options.element;
            element.addClass("grid_value");
            var $value = $("<span>");
            $value.attr("ng-bind", "$rowdata[$column.def.field]");
            element.append($value);
        }
    };
});