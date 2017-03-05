define([
    "jquery",
    "var/noop"
], function($, noop){
    "use strict";
    return {
        name:"title",
        priority: 0,
        header: function(th, column){
            var $cont = $("<span>");
            $cont.addClass("grid_title");
            $cont.text(column.title || "");
            th.prepend($cont);
        },
        row: noop
    };
});