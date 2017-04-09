define([
    "./ajax.module",
    "underscore",
    "Class"
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
        use: use,
        putUrl: putUrl,
        getUrlConfig: getUrlConfig,
        configHandlers: configHandlers,
        getHandler: getHandler
    });

    AjaxProvider.prototype = ajaxConfigurer;

    function AjaxProvider() {
        var self = this;

        self.$get = function() {
            return ajaxConfigurer;
        };
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
        config.method = config.method ? "GET" : config.method;
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