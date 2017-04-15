define([
    "../widget.module",
    "./tree-node.controller"
], function(app){
    "use strict";
    app.directive("uiTreeNode", treeNodeDirective);

    /* @ngInject */
    function treeNodeDirective(){
        var directive = {
            restrict: "A",
            templateUrl: "{themed}/widget/tree_node.html",
            require: ["uiTreeNode", "^uiTree"],
            replace: true,
            scope: true,
            controller: "TreeNodeController",
            controllerAs: "nodeCtrl",
            bindToController: {
                data: "=nodeData"
            },
            link: {
                pre: treeNodePreLink
            }
        };
        return directive;

        function treeNodePreLink(scope, element, attrs, ctrls){
            var treeNodeCtrl = ctrls[0];
            var treeCtrl = ctrls[1];
            treeNodeCtrl.initOnDirectiveLink(treeCtrl, treeNodeCtrl.data);
        }
    }

});