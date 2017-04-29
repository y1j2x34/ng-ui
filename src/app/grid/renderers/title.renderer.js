define([
    "jquery",
    "angular"
], function($, angular){
    "use strict";
    return {
        type: "cell",
        name:"title",
        priority: 0,
        header: function(options){
            var $cont = $("<span>");
            $cont.addClass("grid_title");
            $cont.text(options.value);
            options.element.prepend($cont);
        },
        row: angular.noop
    };
});