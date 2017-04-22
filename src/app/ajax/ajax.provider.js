define([
    "./ajax.module",
    "underscore",
    "supports/Class"
], function(app, _, Class) {
    "use strict";
    app.provider("$ajax", AjaxProvider);

    var ajaxConfigurer = Class.singleton("AjaxConfigurer", {
        init: function(self) {
            self.$filters = [];
            self.$urlmap = {};
            self.$baseUrl = "";
            self.$handlers = {};
        },
        setBaseUrl: setBaseUrl,
        use: use,
        putUrl: putUrl,
        getUrlConfig: getUrlConfig,
        configHandlers: configHandlers,
        getHandler: getHandler
    });

    AjaxProvider.prototype = ajaxConfigurer;

    function AjaxProvider() {
        ajaxConfigurer.$get = function() {
            return ajaxConfigurer;
        };
        return ajaxConfigurer;
    }
    function setBaseUrl(self, baseUrl){
        self.$baseUrl = baseUrl;
    }
    function use(self) {
        self.$filters =
            _.chain(arguments) //
            .slice(1)
            .map(normalizeFilter)
            .union(self.$filters)
            .sortBy(function(x) {
                return x.priority;
            })
            .value();
    }

    function putUrl(self, name, config) {
        if (_.isString(config)) {
            config = {
                url: config
            };
        }
        if (!_.isObject(config) || !config.url) {
            throw new Error("invalid url config: " + config);
        }
        config.cache = !!config.cache;
        config.method = config.method || "GET";
        config.payload = !!config.payload;
        self.$urlmap[name] = config;
    }

    function getUrlConfig(self, name){
        return self.$urlmap[name];
    }

    function configHandlers(self, handlers){
        if(_.isObject(handlers)){
            self.$handlers = _.extend(self.$handlers, handlers);
        }
    }
    function getHandler(self, name){
        return self.$handlers[name];
    }
    function normalizeFilter(filter) {
        if (_.isFunction(filter)) {
            return {
                priority: 0,
                filter: filter
            };
        } else if (angular.isObject(filter)) {
            var copied = _.clone(filter);
            if (!angular.isNumber(copied.priotity)) {
                copied.priotity = 0;
            }
            return copied;
        }
    }


});