define([
    "./grid-head-checkbox.directive",
    "./grid-row-checkbox.directive",
    "./grid-row-radio.directive"
],function(){
    "use strict";
    return {
        type: "ext",
        name: "check",
        init: function(value){
            var type;
            if(typeof value === "object"){
                type = value.value;
            }else{
                type = value;
            }
            if(type !== "checkbox" && type !== "radio"){
                throw new Error("invalid check type: " + type);
            }
            return {
                type: type,
                width: 40
            };
        },
        header: function(options){
            var checkType = options.column.type;
            if("checkbox" === checkType){
                options.element.append("<div ui-grid-head-checkbox>");
            }
        },
        row: function(options){
            options.element.append("<div ui-grid-row-"+options.column.def.type+">");
        }
    };
});