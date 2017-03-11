define(function(){
    "use strict";
    return {
        type: "row",
        name: "stripe",
        init: function(value){
            if(typeof value === "object"){
                value.oddClass = value.oddClass || "odd";
                value.evenClass = value.evenClass || "even";
            }else{
                return {
                    oddClass: "odd",
                    evenClass: "even"
                };
            }
        },
        render: function(options){
            var rowIndex = options.rowIndex;
            var element = options.element;
            var value = options.value;
            var oddClass = value.oddClass;
            var evenClass = value.evenClass;

            element.removeClass(oddClass, evenClass);

            if((rowIndex & 1) === 0){
                element.addClass(evenClass);
            }else{
                element.addClass(oddClass);
            }
        }
    };
});