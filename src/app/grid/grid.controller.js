define([
    "./grid.module",
    "./grid.factory",
], function(app) {
    "use strict";
    app.controller("UIGridController", GridController);

    /* @ngInject */
    function GridController(UIGrid) {
        var self = this;

        self.nextPage = nextPage;
        self.prevPage = prevPage;
        self.goPage = goPage;
        self.changePageSize = changePageSize;
        self.activate = activate;
        self.destroy = destroy;
        self.getRowRenderers = getRowRenderers;

        function activate(options) {
            self.grid = new UIGrid(options);
            self.gridBodyScrollbarOptions = {
                'live':'on',
                'theme':'minimal-dark'
                // 'callbacks':self.scrollbarCallbacks
            };
        }

        function destroy(){
            self.grid.destroy();
        }

        function nextPage() {
            return self.grid.nextPage();
        }

        function prevPage() {
            return self.grid.prevPage();
        }

        function goPage(page, params) {
            return self.grid.goPage(page, params);
        }

        function changePageSize(newPageSize) {
            var pageCount = Math.ceil(self.store.total / newPageSize);
            self.grid.pageSize = newPageSize;
            if (self.grid.page > pageCount) {
                self.go(pageCount);
            } else {
                self.store.load();
            }
        }

        function getRowRenderers(){
            return self.grid.rows;
        }
    }
});
