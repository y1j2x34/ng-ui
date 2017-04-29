define([
    "jquery",
    "angular",
    "./grid.cell-editable.directive"
], function($, angular){
    "use strict";
    return {
        type:"cell",
        name: "editable",
        priority: 100,
        header: angular.noop,
        row: function(options){
            options.element.append("<div ui-grid-cell-editable>");
        }
    };
});