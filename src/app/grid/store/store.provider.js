define([
    "../grid.module",
], function(app) {
    "use strict";

    app.provider("$store", StoreProvider);

    function StoreProvider() {
        var self = this;

        var config = {};

        self.$get = function() {
            return config;
        };
    }
});
