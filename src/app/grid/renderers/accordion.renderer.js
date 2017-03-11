define([
    "./grid.accordion.directive",
], function(){
    "use strict";

    return {
        type: "ext",
        name: "accordion",
        header: function(){},
        row: function(options){
            options.element.append("<a ui-grid-accordion>");
        }
    };
});