define([
    "../widget.module",
    "angular"
], function(app, angular){
    "use strict";
    app.controller("TreeNodeController",TreeNodeController);

    /* @ngInject */
    function TreeNodeController(logger){
        var self = this;

        self.initOnDirectiveLink = initOnDirectiveLink;

        function initOnDirectiveLink(treeCtrl, data){
            self.tree = treeCtrl;
            self.data = data;
            self.hasChildren = data.hasChildren;
            self.templateUrl = data.templateUrl || treeCtrl.nodeTemplateUrl;
            if(self.hasChildren){
                self.opened = data.opened === undefined ? treeCtrl.defaultOpened === true : data.opened === true;
                self.toggle = toggle;
                self.onKeydown = onKeydown;
            }else{
                self.opened = false;
                self.toggle = angular.noop;
                self.onKeydown = angular.noop;
            }
        }

        function toggle(){
            self.opened = !self.opened;
        }

        function onKeydown($event){
            logger.info($event);
        }
    }
});