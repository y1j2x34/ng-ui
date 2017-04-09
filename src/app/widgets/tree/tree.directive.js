define([
    "../widget.module",
    "utils/random.util",
    "./tree.controller",
    "./tree-node.directive"
], function(app, RandomUtil){
    "use strict";
    var DEFAULT_NODE_TEMPLATE_ID = "default_tree_node_template.html";
    app.directive("uiTree", uiTreeDirective);

    /* @ngInject */
    function uiTreeDirective($templateCache){
        var directive = {
            restrict: "AE",
            scope: true,
            templateUrl: "{themed}/widget/tree.html",
            replace: true,
            terminal: true,
            controller: "UITreeController",
            controllerAs: "tree",
            bindToController:{
                options: "=?uiTree"
            },
            compile: compileUITree
        };
        return directive;

        function compileUITree(element){
            // var nodeTemplateHtml = element.html().trim();
            // var treeNodeTemplateId;
            // if(nodeTemplateHtml.length < 1){
            //     treeNodeTemplateId = DEFAULT_NODE_TEMPLATE_ID;
            // }else{
            //     treeNodeTemplateId = RandomUtil.unique("tree-node-template#");
            //     $templateCache.put(treeNodeTemplateId, nodeTemplateHtml);
            //     element.empty();
            // }

            return postLink;

            function postLink(scope, element, attrs, tree){
                scope.$watch("tree.options", function(options){
                    if(options){
                        tree.updateOptions(options);
                    }
                });
            }

        }
    }
});