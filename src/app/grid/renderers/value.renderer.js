define([
    "angular",
    "underscore"
], function(angular, _) {
    "use strict";
    return {
        name: "value",
        priority: 0,
        header: _.noop,
        row: function(td) {
            td.addClass("grid_value");
            var $value = angular.element("<span>");
            $value.attr("ng-bind", "$rowdata[$column.def.field]");
            td.append($value);
        }
    };
});