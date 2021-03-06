define([
    "angular",
    "./grid.module",
    "underscore",
    "utils/random.util",
    "supports/Class",
    "event/subject",
    "./store/store.factory"
], function(angular, app, _, RandomUtil, Class, Subject) {
    "use strict";

    app.factory("UIGrid", gridFactory);

    /* @ngInject */
    function gridFactory($grid, $q, UIGridStore) {
        var CONSTT_VALUE = "";
        var INDEX_KEY = "$index";
        var BEFORE_LOAD_EVENT = UIGridStore.BEFORE_LOAD_EVENT + "." + RandomUtil.randomString();
        var LOAD_SUCCESS_EVENT = UIGridStore.LOAD_SUCCESS_EVENT + "." + RandomUtil.randomString();
        var LOAD_ERROR_EVENT = UIGridStore.LOAD_ERROR_EVENT + "." + RandomUtil.randomString();
        var LOAD_COMPLETE_EVENT = UIGridStore.LOAD_COMPLETE_EVENT + "." + RandomUtil.randomString();


        var DEFAULT_OPTIONS = {
            key: INDEX_KEY, // $index 表示使用序号做标识符
            page: 1,
            autoLoad: false,
            pageSize: 10,
            keepSelect: true // 重新加载后保持原来的选择状态， 对于使用序号做标识的情况无效
        };

        return Class.extend(Subject, {
            name: "Grid",
            statics: {
                BEFORE_LOAD_EVENT: BEFORE_LOAD_EVENT,
                LOAD_SUCCESS_EVENT: LOAD_SUCCESS_EVENT,
                LOAD_ERROR_EVENT: LOAD_ERROR_EVENT,
                LOAD_COMPLETE_EVENT: LOAD_COMPLETE_EVENT
            },
            init: init,
            goPage: goPage,
            prevPage: prevPage,
            nextPage: nextPage,
            getRow: getRow,
            getSelectedRows: getSelectedRows,
            getSelectedRow: getSelectedRow,
            destroy: destroy
        });

        function init(self, options) {
            self.$super();
            if (!_.isObject(options)) {
                throw new Error("invlaid option");
            }
            options = _.extend({}, DEFAULT_OPTIONS, options);
            if (!options.store) {
                throw new Error("store is required");
            }

            var defaults = options.defaults || {};
            self.bordered = options.bordered !== false;
            self.height = options.height;
            self.fixHeader = options.fixHeader !== false; // 默认值为true

            self.page = options.page;
            self.pageSize = options.pageSize;
            self.key = options.idField || INDEX_KEY;

            self.store = options.store;

            _.each(options.events, function(handler, eventName) {
                if (_.isFunction(handler)) {
                    self.on(eventName, handler);
                }
            });

            if (options.pageStrategy !== "button" && options.pageStrategy !== "scroll") {
                self.pageStrategy = options.pageStrategy || "button";
            }
            self.headers = [];
            self.columns = [];
            self.rows = [];

            resolveExtention(self.headers, self.columns, options.ext);

            resolveColumn(self.headers, self.columns, options.columns, defaults);

            setColumnIndex(self.headers);
            setColumnIndex(self.columns);

            resolveRowRenderers(self.rows, options.rows);

            var store = self.store;
            store.on(BEFORE_LOAD_EVENT, function(event, params) {
                params.page = self.page;
                params.pageSize = self.pageSize;
                self.loadStatus = "loading";
            });
            store.on(LOAD_SUCCESS_EVENT, function(event, response, data, params) {
                self.loadStatus = "success";
                onLoadSuccess(self, response, data, params);
            });
            store.on(LOAD_COMPLETE_EVENT, function() {
                self.loadStatus = "complete";
            });
            store
                .fetchLoaded()
                .then(function(result) {
                    self.loadStatus = "success";
                    onLoadSuccess(self, result.result, result.data, result.params);
                });
        }

        function resolveColumn(resolvedHeaders, resolvedColumns, columns, defaults) {
            _.each(columns, function(columnDef) {
                _.defaults(columnDef, defaults);
                columnDef.value = CONSTT_VALUE;

                var keys = _.keys(columnDef);

                var headerRenderers = [];
                var rowRenderers = [];

                _.each(
                    keys,
                    function(name) {
                        var def = columnDef[name];
                        if (!isEnabledDef(def)) {
                            return;
                        }
                        var renderersDef = $grid.getCellRenderer(name, false);
                        if (renderersDef) {
                            if (_.isFunction(renderersDef.init)) {
                                renderersDef.init(columnDef);
                            }
                            rowRenderers.push({
                                def: def,
                                name: renderersDef.name,
                                priority: renderersDef.priority,
                                render: renderersDef.row || angular.noop
                            });
                            headerRenderers.push({
                                def: def,
                                name: renderersDef.name,
                                priority: renderersDef.priority,
                                render: renderersDef.header || angular.noop
                            });
                        }
                    }
                );
                rowRenderers = _.sortBy(rowRenderers, orderByPriority);
                headerRenderers = _.sortBy(headerRenderers, orderByPriority);

                resolvedHeaders.push({
                    renderers: headerRenderers,
                    def: columnDef
                });
                resolvedColumns.push({
                    renderers: rowRenderers,
                    def: columnDef
                });
            });
        }

        function resolveExtention(resolvedHeaders, resolvedColumns, ext) {
            _.each(ext, function(def, attr) {
                if (!isEnabledDef(def)) {
                    return;
                }

                if (!$grid.hasCellRenderer(attr, true)) {
                    return;
                }

                var rendererDef = $grid.getCellRenderer(attr, true);

                if (_.isFunction(rendererDef.init)) {
                    def = rendererDef.init(def) || def;
                }

                resolvedHeaders.push({
                    priority: rendererDef.priority,
                    renderers: [{
                        name: rendererDef.name,
                        priority: rendererDef.priority,
                        render: rendererDef.header || angular.noop
                    }],
                    def: def
                });

                resolvedColumns.push({
                    priority: rendererDef.priority,
                    renderers: [{
                        name: rendererDef.name,
                        priority: rendererDef.priority,
                        render: rendererDef.row || angular.noop
                    }],
                    def: def
                });
            });
        }

        function resolveRowRenderers(rowRenderersHolder, rows) {
            _.each(rows, function(def, name) {
                if (!isEnabledDef(def)) {
                    return;
                }

                if (!$grid.hasRowRenderer(name)) {
                    return;
                }

                var rendererDef = $grid.getRowRenderer(name);

                if (_.isFunction(rendererDef.init)) {
                    rendererDef.init(def);
                }

                rowRenderersHolder.push({
                    priority: rendererDef.priority,
                    render: rendererDef.render,
                    def: def
                });
            });
            _.sortBy(rowRenderersHolder, orderByPriority);
        }
        function setColumnIndex(columns){
            _.each(columns, function(column, index){
                column.columnIndex = index;
            });
        }
        function isEnabledDef(def) {
            return !(def === undefined ||
                def === "none" ||
                def === false ||
                def === null ||
                def.enabled === false);
        }

        function orderByPriority(renderer) {
            return renderer.priority;
        }
        /**
         * 请求指定页码数据
         * @param  {Number} page   目标页码
         * @param  {Object} params [description]
         * @return {Promise}
         */
        function goPage(self, page, params) {
            if (self.pageCount === undefined || (page > 0 && page <= self.pageCount)) {
                params = _.extend({}, self.lastParams, params);
                self.page = parseInt(page, 10);
                return self.load(params);
            } else {
                return $q.reject("parameter error");
            }
        }
        /**
         * 请求下n页的数据
         * @param  {Number} step 往后几页
         */
        function nextPage(self, step) {
            self.goPage(self.page + (step || 1));
        }
        /**
         * 请求上n页的数据
         * @param  {Number} step 往上几页
         */
        function prevPage(self, step) {
            self.goPage(self.page - (step || 1));
        }
        /**
         * 获取一行数据
         * @param  {Any} id  数据ID
         * @return {Object}      一行数据
         */
        function getRow(self, id) {
            return self.dataMap[id];
        }
        /**
         * 获取所有选中的行
         * @return {Array}
         */
        function getSelectedRows(){
            return [];
        }
        /**
         * 获取选中的一行， 多选时返回第一行
         * @return {Object}
         */
        function getSelectedRow(){
            return undefined;
        }
        /**
         * 销毁
         * @return {[type]}
         */
        function destroy(self) {
            self.store.off(BEFORE_LOAD_EVENT);
            self.store.off(LOAD_SUCCESS_EVENT);
            self.store.off(LOAD_ERROR_EVENT);
            self.store.off(LOAD_COMPLETE_EVENT);
        }

        function onLoadSuccess(self, response, data, params) {
            self.data = data;
            self.dataMap = {};
            if (_.isArray(data)) {
                if (self.key === INDEX_KEY) {
                    _.each(data, function(item, index) {
                        data[self.key] = index;
                    });
                }
                _.each(data, function(item) {
                    self.dataMap[item[self.key]] = item;
                });
            }

            self.total = response.total;

            self.page = response.page || params.page;

            self.pageCount = Math.max(1, Math.ceil(self.total / self.pageSize));

            var min = Math.max(1, Math.min(self.page - 3, self.pageCount - 6));
            var max = Math.min(min + 6, self.pageCount);
            self.pageNumbers = _.range(min, max + 1, 1);
        }
    }
});