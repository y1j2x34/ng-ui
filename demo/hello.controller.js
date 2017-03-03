define([
    "test-app"
], function(app){
    "use strict";
    app.controller("HelloController", HelloController);

    function HelloController(UIGridStore, NgUIDatasource){
        var self = this;

        activate();

        function activate(){
            var store = createStore();

            self.gridOptions = {
                idField: "userId",
                columns: [{
                    title: "用户ID",
                    field: "userId"
                },{
                    filed: "userName",
                    title: "用户名"
                }],
                store: store
            };
            store.load();
        }

        function createStore(){
            return new UIGridStore({
                datasource: new NgUIDatasource({
                    url: "/demo/api/users.json"
                })
            });
        }
    }
});