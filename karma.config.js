// Karma configuration
// Generated on Wed Nov 02 2016 15:35:24 GMT+0800 (中国标准时间)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'requirejs'],

        // If true, protractor will restart the browser between each test.
        // CAUTION: This will cause your tests to slow down drastically.
        restartBrowserBetweenTests: true,

        // list of files / patterns to load in the browser
        files: [
            {
                pattern: 'src/test/test-main.js',
                included: true,
                served: true
            },
            {
                pattern: "src/app/**/*.js",
                watched: true, // 监听文件修改
                included: false,
                served: true
            },
            {
                pattern: "vendors/**/*.js",
                watched: true, // 监听文件修改
                included: false,
                served: true
            },
            {
                pattern: "dist/partials.js",
                watched: true,
                included: false,
                served: true
            },
            {
                pattern: "src/app/**/*.spec.js",
                watched: true,
                included: false,
                served: false
            }
        ],


        // list of files to exclude
        exclude: [
            "main.js"
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ["kjhtml", 'progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        usePolling: true,

        atomic_save: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};