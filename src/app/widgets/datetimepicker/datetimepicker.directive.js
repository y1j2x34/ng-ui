define([
    "../widget.module",
    "moment",
    "./datetimepicker.controller",
    "../spinner.directive",
    "../scrollbar.directive"
], function(app, moment) {
    "use strict";

    app.directive("uiDatetimepicker", datetimepickerDirective);

    /* @ngInject */
    function datetimepickerDirective($timeout) {
        // 关闭moment插件警告
        moment.suppressDeprecationWarnings = true;
        var directive = {
            restrict: "A",
            require: ["uiDatetimepicker", "ngModel"],
            templateUrl: "{themed}/widget/datetimepicker.html",
            replace: true,
            scope: true,
            controller: "DatetimepickerController",
            controllerAs: "picker",
            compile: function(){
                return {
                    pre: datetimepickerPreLink,
                    post: function(scope, element, attrs, ctrls){
                        var self = ctrls[0];
                        var ngModel = ctrls[1];
                        self.directivePostLink(ngModel);
                    }
                };
            }
        };
        return directive;

        function datetimepickerPreLink(scope, element, attrs, ctrls) {
            var self = ctrls[0];
            var ngModel = ctrls[1];

            // var _originRender = ngModel.$render;
            var lastViewValue, lastModelValue;

            ngModel.$render = function() {
                var time = moment(ngModel.$modelValue);
                self.viewValue = ngModel.$viewValue = {
                    year: time.get("y"),
                    month: time.get("M")+1,
                    dayOfMonth: time.get("D"),
                    week: time.get("w"),
                    dayOfWeek:time.weekday(),
                    hour: time.hour(),
                    minute: time.minute(),
                    second: time.second(),
                    millisecond: time.millisecond(),
                    moment: time,
                    timeInMillis: time.valueOf(),
                    formated: time.format(self.datetimeFormat)
                };
            };

            ngModel.$parsers.push(function(val) {
                var m = moment(val);
                var isValid = m.isValid();
                if (isValid) {
                    lastModelValue = m.valueOf();
                    lastViewValue = val;
                }else if(self.viewValue){
                    m = self.viewValue.moment;
                }else{
                    m = moment();
                }
                return lastModelValue;
            });
            $timeout(ngModel.$render, 0, true);

            self.directivePreLink(ngModel);
        }
    }
});