require.config({
    baseUrl: "/demo",
    paths:{
        "angular": "/vendors/angular/angular",
        "underscore": "/vendors/underscore/underscore",
        "jquery": "/vendors/jquery/dist/jquery",
        "angular-sanitize": "/vendors/angular-sanitize/angular-sanitize",
        "jquery-mousewheel": "/vendors/jquery-mousewheel/jquery-mousewheel",
        "jquery.scrollbar": "/vendors/scrollbar-plugin/jQuery.mCustomScrollbar",
        // "ngUI": "../dist/ng-ui",
        "ng-ui-app": "../src/app/main"
    },
    bundles: {
        // "ngUI": ["ng-ui-app"]
    },
    shim: {
        "angular": {
            exports: "angular",
            deps:["jquery"]
        },
        "underscore": {
            exports: "_"
        },
        "angular-sanitize": ["angular"]
    }
});
require([
    "app.boot"
]);