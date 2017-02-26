require.config({
    baseUrl: "/src/app/",
    paths: {
        // "jquery": "../../vendors/jquery/dist/jquery",
        "angularAMD": "/vendors/",
        "angular": "../../vendors/angular/angular",
        "angular-sanitize": "../../vendors/angular-sanitize/angular-sanitize",
        "underscore": "../../vendors/underscore/underscore",
        "jquery-mousewheel": "../../vendors/jquery-mousewheel/jquery-mousewheel",
        "jquery": "../../vendors/jquery/dist/jquery",
        "jquery.scrollbar": "../../vendors/scrollbar-plugin/jQuery.mCustomScrollbar"
    },
    shim: {
        "angular": {
            exports: "angular"
        },
        "underscore": {
            exports: "_"
        },
        "angular-sanitize": {
            deps: ["angular"]
        }
    }
});
require([
    "app.module"
]);
