define(function() {
    "use strict";
    return {
        type: "cell",
        name: "align",
        priority: 0,
        init: function(columnDef) {
            columnDef.align = normalizeAlignValue(columnDef.align);
        },
        header: function(options) {
            options.element.addClass("text-"+options.value);
        },
        row: function(options) {
            var td = options.element,
            alignment = options.value;
            td.addClass("text-"+alignment);
        }
    };

    function normalizeAlignValue(value) {
        if (typeof value === "string") {
            value = value.toLowerCase();
        }else if(typeof value === "object"){
            value = value.value;
        }
        switch (value) {
            case "left":
            case "right":
            case "center":
                return value;
            default:
                return "left";
        }
    }
});