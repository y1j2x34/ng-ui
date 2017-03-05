define([
    "./grid.accordion.directive",
], function(){
    "use strict";

    return {
        ext: true,
        name: "accordion",
        header: function(){},
        row: function(td){
            td.append("<a ui-grid-accordion>");
        }
    };
});