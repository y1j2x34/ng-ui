define([
    "../grid.module",
    "underscore",
    "supports/Class",
    "event/subject",
    "./http.datasource.factory",
    "./ajax.datasource.factory",
    "./json.datasource.factory",
    "./store.provider"
], function(app, _, Class, Subject) {
    "use strict";

    app.factory("UIGridStore", StoreFactory);

    var BEFORE_LOAD_EVENT = "beforeLoad";
    var LOAD_SUCCESS_EVENT = "loaded";
    var LOAD_ERROR_EVENT = "loadError";
    var LOAD_COMPLETE_EVENT = "complete";

    var DEFAULT_OPTIONS = {
        autoLoad: false,
        keepSelect: true // 重新加载后保持原来的选择状态， 对于使用序号做标识的情况无效
    };
    /* @ngInject */
    function StoreFactory($q) {
        return Class.extend(Subject, {
            name: "Store",
            statics: {
                BEFORE_LOAD_EVENT: BEFORE_LOAD_EVENT,
                LOAD_SUCCESS_EVENT: LOAD_SUCCESS_EVENT,
                LOAD_ERROR_EVENT: LOAD_ERROR_EVENT,
                LOAD_COMPLETE_EVENT: LOAD_COMPLETE_EVENT
            },
            init: init,
            setParams: setParams,
            reload: reload,
            load: load,
            setCollation: setCollation,
            unsetCollation: unsetCollation,
            fetchLoaded: fetchLoaded
        });

        /**
         * 构造器
         * @param  {Object} options store配置
         */
        function init(self, options) {
            self.$super();
            options = _.extend({}, DEFAULT_OPTIONS, options);

            self.params = _.extend({}, options.params);
            self.datasource = options.datasource;
            self.collation = {};

            self.dataHandlers = [];

            _.each(options.events, function(handler, eventName) {
                if (_.isFunction(handler)) {
                    self.on(eventName, handler);
                }
            });

            self.$$loadCount = 0;
        }
        /**
         * 设置参数
         * @param {String|Object} name  参数名称或参数对象
         * @param {Object} value 参数值, 仅name做string使用时有效
         */
        function setParams(self, name, value) {
            var newParams;
            if (_.isObject(name)) {
                newParams = name;
            } else {
                newParams = {};
                newParams[name] = value;
            }
            self.params = _.extend({}, self.params, newParams);
        }
        /**
         * 使用旧参数重新加载数据
         */
        function reload(self) {
            if (!_.isUndefined(self.lastParams)) {
                return self.load(self.lastParams);
            }
        }
        function fetchLoaded(self){
            return self.$$lastLoadPromise || $q.reject("unloaded");
        }
        /**
         * 加载数据
         * @param  {Object} params 加载参数
         * @return {promise}
         */
        function load(self, params) {
            var remoteOrder = {};
            var localOrders = [];

            _.each(self.collation, function(field, def) {
                if (def.remote) {
                    remoteOrder[field] = def.remote;
                } else if (def.local) {
                    localOrders.push(def.local);
                }
            });

            params = _.extend({}, self.params, {
                order: remoteOrder
            }, params);

            self.trigger(BEFORE_LOAD_EVENT, params);

            self.lastParams = params;

            var promise = self.datasource
                .load(params, self)
                .then(loadSuccess, loadError);
            self.$$lastLoadPromise = promise;
            return promise;

            function loadSuccess(result) {
                var lastLoadPromise = self.$$lastLoadPromise;
                if(lastLoadPromise !== undefined && lastLoadPromise !== promise){
                    return lastLoadPromise;
                }

                var data = invokeDataHandles(self, result.data);

                self.trigger(LOAD_SUCCESS_EVENT, result, data, params);
                self.trigger(LOAD_COMPLETE_EVENT, result, data, params);
                return {
                    result: result,
                    data: data,
                    params: params
                };
            }
            function loadError(reason) {
                var lastLoadPromise = self.$$lastLoadPromise;
                if(lastLoadPromise !== undefined && lastLoadPromise !== promise){
                    return lastLoadPromise;
                }
                self.trigger(self.clazz.LOAD_ERROR_EVENT, reason);
                self.trigger(self.clazz.LOAD_COMPLETE_EVENT, reason);
                return $q.reject(reason, params);
            }
        }

        function invokeDataHandles(self, data) {
            _.each(self.dataHandlers, function(handle) {
                var result = handle.call(self, data);
                if (_.isArray(result)) {
                    data = result;
                }
            });
            return data;
        }

        function setCollation(self, field, direction, priority, remote) {

            var collation = self.collation[field] || {};

            var config = {
                direction: direction,
                priority: priority
            };
            if (remote) {
                collation.locale = undefined;
                collation.remote = config;
            } else {
                collation.locale = config;
                collation.remote = undefined;
            }

            self.collation[field] = collation;
        }

        function unsetCollation(self, field) {
            self.collation[field] = undefined;
        }
    }

});
