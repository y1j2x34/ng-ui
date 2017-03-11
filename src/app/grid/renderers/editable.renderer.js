define([
    "jquery",
    "var/noop",
    "./grid.cell-editable.directive"
], function($, noop){
    "use strict";
    return {
        type:"cell",
        name: "editable",
        priority: 100,
        header: noop,
        row: function(options){
            options.element.append("<div ui-grid-cell-editable>");
        }
    };
});