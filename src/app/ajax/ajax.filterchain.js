define([
    "supports/Class"
], function(Class) {
    "use strict";
    var FilterChain = Class.create("FilterChain", {
        init: function(self, filters, index) {
            self.$filters = filters;
            self.$index = index;
        },
        next: function(self, request) {
            var filters = self.$filters;
            var filter = filters[self.$index];
            var result = filter(request, new FilterChain(filters, self.$index + 1));
            return result;
        },
        retry: function(self, request) {
            return new FilterChain(self.$filters, 0).next(request);
        },
        final: function(self, result) {
            return result;
        }
    });
    return FilterChain;
});