define([
    "../widget.module",
    "moment",
    "./datetimepicker-selector.directive"
], function(app, moment){
    "use strict";

    var DEFAULT_OPTIONS = {
        lang: "en",
        format: "YYYY-MM-DD HH:mm:ss",
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm:ss",
        timepicker: true,
        datepicker: true,
        inline: true
    };

    app.directive("uiDatetimepicker", datetimepickerDirective);

    /* @ngInject */
    function datetimepickerDirective($parse){
        var directive = {
            restrict: "A",
            require: ["uiDatetimepicker", "ngModel"],
            templateUrl: "{themed}/widget/datetimepicker.html",
            replace: true,
            scope: true,
            bindToController: {
                "options": "=?uiDatetimepicker"
            },
            controller: DatetimepickerController,
            controllerAs: "vm",
            link: datetimepickerPostLink
        };
        return directive;

        function datetimepickerPostLink(scope, element, attrs, ctrls){
            var picker = ctrls[0];
            var ngModel = ctrls[1];
            var _v;
            Object.defineProperty(picker, "viewValue", {
                set: function(val){
                    console.info("set view value : ", val, new Error());
                    _v = val;
                },
                get: function(){
                    return _v;
                }
            });
            // var _mv;
            // Object.defineProperty(ngModel, "$modelValue", {
            //     set: function(val){
            //         console.info("set ng model value: ", val, new Error());
            //         _mv = val;
            //     },
            //     get: function(){
            //         return _mv;
            //     }
            // });
            // var _vv;
            // Object.defineProperty(ngModel, "$viewValue", {
            //     set: function(val){
            //         console.info("set ng view value: ", val, new Error());
            //         _vv = val;
            //     },
            //     get: function(){
            //         return _vv;
            //     }
            // });
            ngModel.$render = function(){
                if(!ngModel.$modelValue){
                    return;
                }
                var viewValue = picker.parseModelValue(ngModel.$modelValue);
                if(!isNaN(viewValue)){
                    picker.viewValue = viewValue;
                }
            };
            ngModel.$parsers.push(function(){
                return picker.formatViewValue(picker.viewValue);
            });
            picker.directivePostLink(ngModel, $parse(attrs.ngModel));

            scope.$watch("vm.viewValue", function(newValue, oldValue){
                picker.handleDatetimeChange(newValue, oldValue);
            });
        }
    }
    /* @gnInject */
    function DatetimepickerController($scope){
        var self = this;
        self.directivePostLink = directivePostLink;
        self.handleDatetimeChange = handleDatetimeChange;
        self.parseModelValue = parseModelValue;
        self.formatViewValue = formatViewValue;

        function directivePostLink(ngModel, parsedModel){
            self.ngModel = ngModel;
            self.parsedModel = parsedModel;
            angular.extend(self, DEFAULT_OPTIONS, self.options);

            if(!ngModel.$modelValue){
                ngModel.$modelValue = formatViewValue(moment().valueOf());
            }
            ngModel.$render();
        }

        function handleDatetimeChange(time){
            self.parsedModel.assign($scope.$parent, formatViewValue(time));
        }
        function parseModelValue(modelValue){
            var viewValue;
            if(!self.datepicker && self.timepicker){
                viewValue = moment("1970-01-01 " + modelValue).valueOf();
            }else if(self.datepicker && !self.timepicker){
                viewValue = moment(modelValue + " 00:00:00").valueOf();
            }else if(self.datepicker && self.timepicker){
                viewValue = moment(modelValue).valueOf();
            }else{
                return self.ngModel.$viewValue;
            }
            if(isNaN(viewValue)){
                self.ngModel.$setValidity("pattern", false);
                return self.ngModel.$viewValue;
            }
            return viewValue;
        }
        function formatViewValue(time){
            var modelValue;
            var m = moment(time);
            if(!m.isValid()){
                return self.ngModel.$modelValue;
            }
            if(!self.datepicker && self.timepicker){
                modelValue = m.format(self.timeFormat);
            }else if(self.datepicker && !self.timepicker){
                modelValue = m.format(self.dateFormat);
            }else if(self.datepicker && self.timepicker){
                modelValue = m.format(self.format);
            }else{
                return self.ngModel.$modelValue;
            }
            return modelValue;
        }
    }
});