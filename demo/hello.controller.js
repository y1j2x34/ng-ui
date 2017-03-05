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
                    field: "userName",
                    title: "用户名"
                }],
                ext: {
                    accordion: {
                        enabled: true,
                        templateUrl: "/demo/partials/demo-collapsible-tpl.html",
                        oneAtTime: true
                    }
                },
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