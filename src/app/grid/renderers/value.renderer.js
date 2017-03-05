define([
    "jquery",
    "var/noop"
], function($, noop) {
    "use strict";
    return {
        name: "value",
        priority: 0,
        header: noop,
        row: function(td) {
            td.addClass("grid_value");
            var $value = $("<span>");
            $value.attr("ng-bind", "$rowdata[$column.def.field]");
            td.append($value);
        }
    };
});