define([
    "../grid.module"
], function(app){
    "use strict";
    app.directive("uiGridCellEditable", gridCellEditableDirective);

    /* @ngInject */
    function gridCellEditableDirective(){
        var directive = {
            restrict: "A",
            link: gridCellEditablePostLink
        };
        return directive;

        function gridCellEditablePostLink(){
            // var header = scope.$header;
            // var def = header.editable;
        }
    }
});