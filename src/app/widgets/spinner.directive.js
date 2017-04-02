define([
    "./widget.module",
    "angular",
    "utils/random.util",
    "./number.directive"
], function(app, angular, RandomUtil) {
    "use strict";
    var supportedNumberTypes = ["float", "integer"];

    app.directive("uiSpinner", spinnerDirective);

    /* @ngInject */
    function spinnerDirective($document, $parse) {
        var directive = {
            restrict: "A",
            templateUrl: "{themed}/widget/spinner.html",
            replace: true,
            scope: true,
            require: ["uiSpinner", "ngModel"],
            controller: SpinnerController,
            controllerAs: "spinner",
            bindToController: {
                min: "=?",
                max: "=?",
                step: "=?",
                numberType: "@numberType",
                change: "&?ngChange",
                orientation:"@"
            },
            link: spinnerPostLink
        };
        return directive;

        function spinnerPostLink(scope, element, attrs, ctrls) {
            var spinner = ctrls[0];
            var $model = $parse(attrs.ngModel);
            var mouseupEventName = RandomUtil.unique("mouseup.");

            spinner.activate($model);

            $document.on(mouseupEventName, function(){
                spinner.stopIncrement();
            });

            scope.$watch(function(){
                return $model(scope.$parent);
            }, function(value){
                spinner.updateModelValue(value);
            }, true);

            scope.$on("$destroy", function(){
                $document.off(mouseupEventName);
                spinner.destroy();
            });
            element.find("script").remove();
        }
    }
    /* @ngInject */
    function SpinnerController($scope, $timeout, $interval) {
        var $parent = $scope.$parent;
        var self = this;
        self.destroy = destroy;
        self.activate = activate;
        self.handleBlurEvent = handleBlurEvent;
        self.handleKeydownEvent = handleKeydownEvent;
        self.incrementEvent = incrementEvent;
        self.decrementEvent = decrementEvent;
        self.updateModelValue = updateModelValue;
        self.stopIncrement = stopIncrement;
        self.startIncrement = startIncrement;

        var startIncrementTimmer, incrementTimmer;

        function activate($model) {
            self.$model = $model;
            self.orientation = self.orientation || "horizontal";
            self.isVertical = self.orientation === "vertical";
            self.isHorizontal = self.orientation === "horizontal";
            angular.extend(self, resolveOptions());

            var defaultValue = $model($parent);
            if(isNotNumber(defaultValue)){
                defaultValue = self.min;
            }
            if(!isFinite(defaultValue)){
                defaultValue = 0;
            }
            updateModelValue(defaultValue);
        }

        function incrementEvent(){
            handleIncrement(self.step);
        }

        function decrementEvent(){
            handleIncrement(-self.step);
        }

        function startIncrement(handler) {
            stopIncrement();
            handler();
            startIncrementTimmer = $timeout(function() {
                incrementTimmer = $interval(handler, 50);
            }, 600);
        }

        function handleIncrement(step) {
            updateModelValue(increment(self.$model($parent), step));
        }

        function increment(value, step) {
            return incrementImpl(value, step, self.min, self.max, self.numberType);
        }

        function stopIncrement() {
            if (startIncrementTimmer) {
                $timeout.cancel(startIncrementTimmer);
                startIncrementTimmer = undefined;
            }
            if (incrementTimmer) {
                $interval.cancel(incrementTimmer);
                incrementTimmer = undefined;
            }
        }

        function handleBlurEvent() {
            stopIncrement();
            var val = parseNumber(self.viewValue, self.numberType);
            if (isNotNumber(val)) {
                val = self.$model($parent);
            } else if (val > self.max) {
                val = self.max;
            } else if (val < self.min) {
                val = self.min;
            }
            updateModelValue(val);
        }

        function updateModelValue(value){
            var parsedValue = parseNumber(value, self.numberType);
            if(!isNaN(parsedValue)){
                var originValue = self.$model($parent);
                self.viewValue = value;
                self.$model.assign($parent, parsedValue);

                handleChangeEvent(originValue, parsedValue);
            }
        }
        function handleChangeEvent(originValue, newValue){
            if(angular.isFunction(self.change)){
                self.change($parent, {
                    $value: newValue,
                    $originValue: originValue
                });
            }
        }
        function handleKeydownEvent($event) {
            switch ($event.which) {
                case 38:
                    startIncrement(incrementEvent);
                    break;
                case 40:
                    startIncrement(decrementEvent);
                    break;
            }
        }

        function destroy() {
            stopIncrement();
        }

        function resolveOptions() {
            var min = self.min;
            var max = self.max;
            var step = self.step;
            var numberType = self.numberType;

            numberType = normalizeNumberType(numberType);

            min = parseNumber(min, numberType);
            max = parseNumber(max, numberType);
            step = parseNumber(step, numberType);

            min = isNotNumber(min) ? 0 : min;
            max = isNotNumber(max) ? Infinity : max;
            step = isNotNumber(step) ? 1 : step;

            return {
                min: min,
                max: max,
                step: step,
                numberType: numberType
            };
        }
    }

    function incrementImpl(value, step, min, max, numberType) {
        if ((step < 0 && value > min) || (step > 0 && (isNotNumber(max) || value < max))) {
            var newValue = value + parseNumber(step, numberType);
            newValue = parseNumber(newValue, numberType);

            if (isNumber(min)) {
                newValue = Math.max(min, newValue);
            }
            if (isNumber(max)) {
                newValue = Math.min(max, newValue);
            }
            return newValue;
        }
        return value;
    }

    function isNumber(value) {
        return typeof value === "number" && !isNaN(value);
    }

    function isNotNumber(value) {
        return !isNumber(value);
    }

    function parseNumber(num, numberType) {
        if (numberType === "float") {
            var p = 10000;
            return Math.round(parseFloat(num) * p) / p;
        } else {
            return parseInt(num);
        }
    }

    function normalizeNumberType(numberType) {
        if (typeof numberType === "string") {
            numberType = numberType.toLowerCase();
        }
        if (supportedNumberTypes.indexOf(numberType) === -1) {
            numberType = "integer";
        }
        return numberType;
    }
});