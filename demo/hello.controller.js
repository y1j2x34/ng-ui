define([
    "test-app"
], function(app) {
    "use strict";
    app.controller("HelloController", HelloController);

    function HelloController(UIGrid, UIGridStore, NgUIDatasource) {
        var self = this;

        activate();

        function activate() {

            self.listviewOptions = {
                data: [{
                    cfg: {
                        icon: "icon-text-file",
                        name: "文本文档",
                        time: "2016-05-15"
                    }
                }, {
                    cfg: {
                        icon: "icon-image-file",
                        name: "图像文件",
                        time: "2016-05-15"
                    }
                }, {
                    cfg: {
                        icon: "icon-music-file",
                        name: "音乐文件",
                        time: "2016-05-16"
                    }
                }]
            };

            var store = createStore();

            var gridOptions = {
                idField: "userId",
                defaults: {
                    align: "center"
                },
                columns: [{
                    title: "用户ID",
                    field: "userId"
                }, {
                    field: "userName",
                    title: "用户名",
                    align: "left",
                    editable: {
                        enabled: true,
                        tip: "修改用户名",
                        type: "string"
                    }
                },{
                    field: "company",
                    title: "公司名称",
                    align: "center",
                    width: 200,
                    visible: false
                }],
                ext: {
                    accordion: {
                        enabled: true,
                        templateUrl: "/demo/partials/demo-collapsible-tpl.html",
                        oneAtTime: true
                    },
                    sequence: true,
                    check: "checkbox" // or radio
                },
                rows: {
                    stripe: {
                        enabled: true,
                        oddClass: "odd", // 奇数行class
                        evenClass: "even" // 偶数行class
                    },

                },
                store: store,
                height: 300,
                fixHeader: false
            };
            self.grid = new UIGrid(gridOptions);
            self.grid.on("selectAll", function(event){
                console.info("selectAll", event);
            });
            self.grid.on("selectOne", function(selected, rowdata){
                console.info("selectOne: ", selected, rowdata);
                console.info(self.grid.getSelectedRows());
            });
            store.load();
        }

        function createStore() {
            return new UIGridStore({
                datasource: new NgUIDatasource({
                    url: "/demo/api/users.json"
                })
            });
        }
    }
});