define(function(){
    "use strict";
    return {
        name: "align",
        priority: 0,
        init: function(columnDef){
            columnDef.align = normalizeAlignValue(columnDef.align);
        },
        header: function(th, columnDef){
            th.css("text-align", columnDef.align);
        },
        row: function(td, column){
            td.css("text-align", column.def.align);
        }
    };

    function normalizeAlignValue(value){
        if(typeof value === "string"){
            value = value.toLowerCase();
        }
        switch(value){
        case "left":
        case "right":
        case "center":
            return value;
        default:
            return "left";
        }
    }
});