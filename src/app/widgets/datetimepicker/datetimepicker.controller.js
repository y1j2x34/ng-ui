define([
    "../widget.module",
    "var/noop",
    "moment"
], function(app, noop, moment){
    "use strict";
    var DEFAULT_OPTIONS = {
        lang: "zh-CN",
        format: "YYYY-MM-DD HH:mm:ss.SSS",
        inline: false,
        datepicker: true,
        timepicker: true,
        minDatetime: +new Date(0),
        maxDatetime: Infinity,

    };
    app.controller("DatetimepickerController", DatetimepickerController);

    // @ngInject
    function DatetimepickerController(){
        var self = this;

        self.directivePostLink = noop;
        self.directivePreLink = directivePreLink;

        activate();

        function activate(){
            self.scrollbarOptions = {
                mouseWheelPixels: 70,
                theme: "minimal-dark"
            };
        }

        function directivePreLink(ngModel){
            self.locale = moment.localeData("zh-CN");
            self.calendar = {
                monthData: [[31,  1,  2,  3,  4,  5,  6],
                            [ 7,  8,  9, 10, 11, 12, 13],
                            [14, 15, 16, 17, 18, 19, 20],
                            [21, 22, 23, 24, 25, 26, 27],
                            [28, 29, 30,  1,  2,  3,  4]
                ]
            };
            self.ngModel = ngModel;
            ngModel.$render();

            self.time = {
                hour: self.viewValue.hour,
                minute: self.viewValue.minute,
                second: self.viewValue.second
            };
        }

        function updateView(){
            self.ngModel.$render();
        }
    }

});