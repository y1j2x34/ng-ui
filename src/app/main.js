require.config({
    baseUrl: "/src/app",
    paths: {
        "partials": (function(env) {
            "use strict";
            if (env === "opitimized") {
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
        "angularAMD": "/"
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
define(["app", "jquery"], function(app, jQuery){
    "use strict";
    jQuery.noConflict();
    return app;
});