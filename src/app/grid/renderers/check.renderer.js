define(function(){
    "use strict";
    return {
        type: "ext",
        name: "check",
        init: function(value){
            var type;
            if(typeof value === "object"){
                type = value.value;
            }
            if(type !== "checkbox" && type !== "radio"){
                throw new Error("invalid check type: " + type);
            }
            return type;
        },
        header: function(options){
            var checkType = options.value;
            if("checkbox" === checkType){
                options.element.append("<div ui-grid-check>");
            }
        },
        row: function(options){
            options.element.append("<div ui-grid-check>");
        }
    };
});