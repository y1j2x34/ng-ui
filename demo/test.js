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
        "ng-ui-app": "../src/app/main",
        "listview": "/vendors/listview/dist/listview"
    },
    bundles: {
        // "ngUI": ["ng-ui-app"],
        // "listview": ["listview.plugin"]
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