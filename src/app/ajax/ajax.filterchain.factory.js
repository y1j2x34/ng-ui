define([
    "./ajax.module",
    "supports/Class"
], function(app, Class) {
    "use strict";
    app.factory("FilterChain", filterChainFactory);
    /* @ngInject */
    function filterChainFactory($injector){
        var FilterChain = Class.create("FilterChain", {
            init: function(self, filters, urlconfig, index) {
                self.$filters = filters;
                self.urlconfig = urlconfig;
                self.$index = index;
            },
            next: function(self, request) {
                var filters = self.$filters;
                var filter = filters[self.$index];
                var chain = new FilterChain(filters, self.urlconfig, self.$index + 1);
                var result = $injector.invoke(filter, filters, {
                    options: request,
                    request: request,
                    chain: chain
                });
                return result;
            },
            retry: function(self, request) {
                return new FilterChain(self.$filters, self.urlconfig, 0).next(request);
            },
            final: function(self, result) {
                return result;
            }
        });
        return FilterChain;
    }
});