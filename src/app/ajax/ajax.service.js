define([
    "./ajax.module",
    "angular",
    "underscore",
    "./ajax.filterchain",
    "./ajax.provider"
], function(app, angular, _, FilterChain) {
    "use strict";
    app.service("ajax", AjaxService);

    /* @ngInject */
    function AjaxService($ajax, $http, $q) {
        var service = this;
        service.request = request;

        var DEFAULT_PREPARE_FILTERS = [
            function(options, chain) {
                return chain.next(options);
            }
        ];
        var DEFAULT_RESPONSE_FILTERS = [
            function(options, chain) {
                return chain.next(options).then(function(response) {
                    var isErrorResponse = $ajax.getHandler("isErrorResponse");
                    if (isErrorResponse(response)) {
                        return $q.reject(response);
                    } else {
                        return response;
                    }
                });
            }
        ];

        function request(urlname, params, headers) {
            var config = $ajax.getUrlConfig(urlname);

            var url = config.absoluteUrl || mergeUrl($ajax.$baseUrl + config.url);
            var data = _.extend({}, config.params, params);
            var _headers = _.extend({}, config.headers, headers);

            var options = {
                method: config.method,
                url: url,
                headers: _headers
            };

            if (config.payload) {
                options.data = angular.toJson(data);
            } else {
                options.params = data;
            }

            var filters = _.union(DEFAULT_PREPARE_FILTERS, _.map($ajax.$filters, getFilter), DEFAULT_RESPONSE_FILTERS);
            filters.push(doHttp);

            return new FilterChain(filters, 0).next(options);
        }

        function doHttp(options, chain) {
            return chain.final($http(options));
        }
    }

    function getFilter(x) {
        return x.filter;
    }

    function mergeUrl(baseUrl, path) {
        var sepRegex = /\\g/;
        baseUrl = baseUrl.replace(sepRegex, "/");
        path = path.relace(sepRegex, "/");

        var lastSepIndex = baseUrl.lastIndexOf("/");
        if (lastSepIndex !== baseUrl.length - 1) {
            baseUrl = baseUrl + "/";
        }
        var firstSepIndex = path.indexOf("/");
        if (firstSepIndex === 0) {
            path = path.slice(1);
        }
        return (baseUrl + path).replace(/\/+/g, "/");
    }
});