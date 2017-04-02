require.config({
    baseUrl: "/src/app",
    paths: {
        "partials": (function(env) {
            "use strict";
            if (env === "optimized") {
                return "/dist/partials";
            } else {
                return "empty-partials";
            }
        })("${env}"),
        "angular": "/vendors/angular/angular",
        "angular-sanitize": "/vendors/angular-sanitize/angular-sanitize",
        "underscore": "/vendors/underscore/underscore",
        "jquery-mousewheel": "/vendors/jquery-mousewheel/jquery-mousewheel",
        "jquery": "/vendors/jquery/dist/jquery",
        "jquery.scrollbar": "/vendors/scrollbar-plugin/jQuery.mCustomScrollbar",
        "listview": "/vendors/listview/dist/listview",
        "moment": "/vendors/moment/min/moment-with-locales.min"
    },
    bundles: {
        "listview": ["listview.plugin"]
    },
    shim: {
        "angular": {
            exports: "angular"
        },
        "underscore": {
            exports: "_"
        },
        "angular-sanitize": ["angular"]
    }
});
// require(["./ng-ui-app"]);
define([
    "./app.module",
    "./init/themed.config",
    "jquery"
], function(app){
    "use strict";
    return app;
});