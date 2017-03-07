define([
    "./grid.module",
    "underscore",
    "utils/random.util",
    "supports/Class",
    "event/subject",
    "var/noop",
    "./store/store.factory"
], function(app, _, RandomUtil, Class, Subject, noop) {
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
            self.gridHeight = options.gridHeight;

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

            resolveExtention(self.headers, self.columns, options.ext);

            resolveColumn(self.headers, self.columns, options.columns, defaults);

            // resolveRowRenderers(options.rows);

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
                        var renderersDef = $grid.getCellRenderer(name, false);
                        if (renderersDef) {
                            if(_.isFunction(renderersDef.init)){
                                renderersDef.init(columnDef);
                            }
                            rowRenderers.push({
                                name: renderersDef.name,
                                priority: renderersDef.priority,
                                render: renderersDef.row || noop
                            });
                            headerRenderers.push({
                                name: renderersDef.name,
                                priority: renderersDef.priority,
                                render: renderersDef.header || noop
                            });
                        }
                    }
                );
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
                if (def === undefined || def === "none" || def === false) {
                    return;
                }

                if (!$grid.hasCellRenderer(attr, true)) {
                    return;
                }

                var rendererDef = $grid.getCellRenderer(attr, true);

                if(_.isFunction(rendererDef.init)){
                    rendererDef.init(def);
                }

                resolvedHeaders.push({
                    renderers: [rendererDef.row || noop],
                    def: def
                });

                resolvedColumns.push({
                    renderers: [rendererDef.header || noop],
                    def: def
                });
            });
        }
        /**
         * 请求指定页码数据
         * @param  {number} page   目标页码
         * @param  {object} params [description]
         * @return {promise}
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
         * @param  {number} step 往后几页
         */
        function nextPage(self, step) {
            self.goPage(self.page + (step || 1));
        }
        /**
         * 请求上n页的数据
         * @param  {number} step 往上几页
         */
        function prevPage(self, step) {
            self.goPage(self.page - (step || 1));
        }
        /**
         * 获取一行数据
         * @param  {any} id  数据ID
         * @return {object}      一行数据
         */
        function getRow(self, id) {
            return self.dataMap[id];
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