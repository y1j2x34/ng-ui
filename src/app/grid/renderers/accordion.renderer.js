define([
    "./grid.accordion.directive",
], function(){
    "use strict";

    return {
        type: "ext",
        name: "accordion",
        init: function(def){
            def.width = 30;
            return def;
        },
        header: function(){
        },
        row: function(options){
            options.element.append("<a ui-grid-accordion>");
        }
    };
});