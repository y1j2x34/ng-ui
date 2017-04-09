define([
    "../widget.module"
], function(app){
    "use strict";
    app.directive("uiTreeNode", treeNodeDirective);

    /* @ngInject */
    function treeNodeDirective(){
        var directive = {
            restrict: "A"
        };
        return directive;
    }
});