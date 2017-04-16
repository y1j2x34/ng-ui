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
        "RandomUtil": "utils/random.util",
        "Subnet": "utils/subnet",
        "angular": "/vendors/angular/angular",
        "angular-sanitize": "/vendors/angular-sanitize/angular-sanitize",
        "underscore": "/vendors/underscore/underscore",
        "jquery-mousewheel": "/vendors/jquery-mousewheel/jquery-mousewheel",
        "jquery": "/vendors/jquery/dist/jquery",
        "jquery.scrollbar": "/vendors/scrollbar-plugin/jQuery.mCustomScrollbar",
        "listview": "/vendors/listview/dist/listview",
        "moment": "/vendors/moment/min/moment-with-locales.min",
        "pnotify": "/vendors/pnotify/dist/pnotify",
        "pnotify.buttons": "/vendors/pnotify/dist/pnotify.buttons"
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
    "./init/app.config",
    "jquery"
], function(app){
    "use strict";
    return app;
});