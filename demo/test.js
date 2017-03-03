require.config({
    baseUrl: "/demo",
    paths:{
        "angular": "/vendors/angular/angular",
        "underscore": "/vendors/underscore/underscore",
        "jquery": "/vendors/jquery/dist/jquery",
        "angular-sanitize": "/vendors/angular-sanitize/angular-sanitize",
        "jquery-mousewheel": "/vendors/jquery-mousewheel/jquery-mousewheel",
        "jquery.scrollbar": "/vendors/scrollbar-plugin/jQuery.mCustomScrollbar",
        "ngUI": "../src/app/main"
    },
    shim: {
        "angular": {
            exports: "angular"
        },
        "underscore": {
            exports: "_"
        }
    }
});
require([
    "jquery",
    "app.boot"
]);