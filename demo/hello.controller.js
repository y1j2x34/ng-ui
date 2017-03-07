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
                defaults: {
                    align: "center"
                },
                columns: [{
                    title: "用户ID",
                    field: "userId"
                },{
                    field: "userName",
                    title: "用户名",
                    align: "left"
                }],
                ext: {
                    accordion: {
                        enabled: true,
                        templateUrl: "/demo/partials/demo-collapsible-tpl.html",
                        oneAtTime: true
                    }
                },
                rows: {
                    stripe: {
                        enabled: true,
                        oddClass: "odd", // 奇数行class
                        evenClass: "even" // 偶数行class
                    },

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