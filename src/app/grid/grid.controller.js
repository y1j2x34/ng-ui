define([
    "underscore",
    "./grid.module",
    "./grid.factory",
], function(_, app) {
    "use strict";
    app.controller("UIGridController", GridController);

    /* @ngInject */
    function GridController() {
        var self = this;

        self.changePageSize = changePageSize;
        self.activate = activate;
        self.destroy = destroy;
        self.getRowRenderers = getRowRenderers;

        function activate(delegate) {
            self.delegate = delegate;
            self.gridBodyScrollbarOptions = {
                'live':'on',
                'theme':'minimal-dark'
                // 'callbacks':self.scrollbarCallbacks
            };
        }

        function changePageSize(newPageSize) {
            var pageCount = Math.ceil(self.store.total / newPageSize);
            self.delegate.pageSize = newPageSize;
            if (self.delegate.page > pageCount) {
                self.go(pageCount);
            } else {
                self.store.load();
            }
        }

        function getRowRenderers(){
            return self.delegate.rows;
        }
        function destroy(){
            if(self.delegate){
                self.delegate.destroy();
            }
        }
    }
});
