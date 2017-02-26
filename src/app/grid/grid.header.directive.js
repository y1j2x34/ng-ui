define([
    "./grid.module"
], function(app){
    "use strict";

    app.directive("uiGridHeader", gridHeaderDirective);

    function gridHeaderDirective(){
        var directive = {
            restrict: "A",
            require:"^^uiGrid"
        };
        return directive;
    }
});
