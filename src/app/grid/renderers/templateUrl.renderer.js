define(function(){
    "use strict";
    return {
        type: "cell",
        name: "templateUrl",
        renderRowClass: false,
        renderHeaderClass: false,
        row: function(options){
            options.element.append("<div ng-include src='\""+options.value+"\"'>");
        }
    };
});