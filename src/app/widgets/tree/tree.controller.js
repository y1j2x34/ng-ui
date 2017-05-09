define([
    "../widget.module",
    "angular"
], function(app, angular){
    "use strict";

    var isArray = angular.isArray;

    app.controller("UITreeController", TreeController);

    /* ngInject */
    function TreeController(){
        var self = this;
        self.updateOptions = updateOptions;

        function updateOptions(options){
            self.rootTreeNodes = normalizeTreeNodeData(options.data, options);
            self.nodeTemplateUrl = options.nodeTemplateUrl || "{themed}/widget/default-tree-node-tpl.html";
        }

        function normalizeTreeNodeData(data){
            normalizeChildren(data);
            return data;

            function normalizeChildren(children){
                for(var i =0;i<children.length; i++){
                    var node = children[i];
                    node.hasChildren = isArray(node.children) && node.children.length > 0;
                    if(node.hasChildren){
                        normalizeChildren(node.children);
                    }
                }
            }
        }
    }
});