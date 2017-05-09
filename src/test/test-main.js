var allTestFiles = [];
var TEST_REGEXP = /spec\.js$/i;

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
        // Normalize paths to RequireJS module names.
        // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
        // then do not normalize the paths
        var normalizedTestModule = file.replace(/^\/base\/src\/app\/|\.js$/g, '');
        console.info(normalizedTestModule);
        allTestFiles.push(normalizedTestModule);
    }
});

var base = "/";

require.config({
    baseUrl: "/base/src/app",
    paths: {
        "angular": "../../vendors/angular/angular",
        "underscore": "../../vendors/underscore/underscore",
        "jquery": "../../vendors/jquery/dist/jquery",
        "angular-sanitize": "../../vendors/angular-sanitize/angular-sanitize",
        "jquery-mousewheel": "../../vendors/jquery-mousewheel/jquery-mousewheel",
        "jquery.scrollbar": "../../vendors/scrollbar-plugin/jquery.mCustomScrollbar",
        "listview": "../../vendors/listview/dist/listview",
        "moment": "../../vendors/moment/min/moment.min",
        "pnotify": "../../vendors/pnotify/dist/pnotify",
        "pnotify.buttons": "../../vendors/pnotify/dist/pnotify.buttons",
        "partials": "empty-partials"
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
    },
    map: {},
    // dynamically load all test files
    deps: allTestFiles,

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
});

require([
    "ng-ui-app"
], function() {

});