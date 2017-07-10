define([
    "test-app"
], function(app) {
    "use strict";
    app.controller("HelloController", HelloController);

    function HelloController(UIGrid, UIGridStore, NgUIDatasource, $timeout, $modals, logger, $q) {
        var self = this;

        activate();

        function activate() {
            var modal = $modals.create({
                keyboard: true,
                show: true,
                template: "成功！",
                title: "模态框标题",
                iconCls: "glyphicon glyphicon-list",
                cls: "inline"
            });
            var index = 0;
            modal.on("show", function(){
                logger.info("modal show", index++);
            });
            modal.on("shown", function(){
                logger.info("modal shown", index++);
            });
            modal.on("hide", function(){
                logger.info("modal hide", index++);
            });
            modal.on("hidden", function(){
                logger.info("modal hidden", index++);
            });
            modal.on("confirm", function(){
                modal.destroy();
            });
            modal.on("destroy", function(){
                logger.info("modal destroyed", index++);
                $modals
                    .confirm("哈哈哈")
                    .then(function(){
                        $modals.alert("用户确定了");
                    }, function(){
                        $modals.alert("用户取消了");
                    })
                    ;
            });
            $modals.prompt({
                label:"请输入您的名字：",
                required: true,
                placeholder: "请输入名字",
                warning: "名字不能为空！"
            }).then(function(content){
                $modals.alert("用户输入了："+content);
            }, function(){
                $modals.alert("用户取消了");
            });
            setTimeout(function(){
                console.info("1. window.setTimeout()");
            });
            $timeout(function(){
                console.info("2. $timeout()");
            });
            $timeout().then(function(){
                console.info("3. $timeout().then");
            });
            $timeout(function(){
                console.info("4. $timeout()");
            });
            $q.when().then(function(){
                console.info("5. $q.when().then()");
            });
            setTimeout(function(){
                console.info("6. window.setTimeout()");
            });
            console.info("7. out");

            // $modals.alert("第一个Alert");
            // $modals.alert("第二个Alert");
            // $modals.alert("第三个Alert");
            self.treeData = [{
                id: "0",
                text: "Animal",
                children: [{
                    id: "01",
                    text: "Dog"
                },{
                    id: "02",
                    text: "Cat"
                },{
                    id: "03",
                    text: "Hippopotamus"
                },{
                    id: "04",
                    text: "Chicken",
                    children:[{
                        id: "041",
                        text: "White Leghorn"
                    },{
                        id: "042",
                        text: "Rhode Island Red"
                    },{
                        id: "043",
                        text: "Jersey Giant"
                    }]
                }]
            },{
                id: "1",
                text: "Vegetable",
                children: [{
                    id: "11",
                    text: "Oranges"
                },{
                    id: "12",
                    text: "Apples"
                }]
            }];
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
                }, {
                    title: "操作",
                    fixed: true,
                    width: 200,
                    templateUrl: "/demo/partials/grid_opr.html"
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
                self.selectedRows = self.grid.getSelectedRows();
            });
            self.grid.on("selectOne", function(selected, rowdata){
                console.info("selectOne: ", selected, rowdata);
                console.info(self.grid.getSelectedRows());
                self.selectedRows = self.grid.getSelectedRows();
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