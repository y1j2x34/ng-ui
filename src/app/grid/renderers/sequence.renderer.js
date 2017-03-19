define(function(){
    "use strict";
    var sequenceColumnWidth = "auto";
    return {
        type: "ext",
        name: "sequence",
        init: function(def){
            if(def + "" !== "[object Object]"){
                return {
                    enabled: true,
                    width: sequenceColumnWidth
                };
            }else{
                def.width = sequenceColumnWidth;
            }
            return def;
        },
        header: function(options){
            options.element.text("#");
        },
        row: function(options){
            options.element.text(options.rowIndex + 1);
        }
    };
});