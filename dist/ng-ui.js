define('widgets/widget.module',[
    "angular",
    "jquery"
],function(angular){
    "use strict";
    return angular.module("ngUI.widget", []);
});
(function(factory){
    "use strict";
    if(typeof module === "object" && module.exports){
        module.exports = factory();
    }else if(typeof define === "function" && define.amd){
        define( 'supports/pythonic',factory);
    }else{
        factory();
    }
})(function(){
    "use strict";
    Function.prototype.pythonic = pythonic;

    function pythonic(){
        // jshint validthis: true
        var fn = this;
        var decorator = function(){
            var self = this;
            var args = [self];
            args.push.apply(args, arguments);
            return fn.apply(self, args);
        };
        return decorator;
    }

});

(function(factory){
    "use strict";
    if(typeof module === "object" && module.exports){
        require("./pythonic");
        module.exports = factory();
    }else if(typeof define === "function" && define.amd){
        define('supports/ext-array',[
            "./pythonic"
        ], factory);
    }else{
        factory();
    }
})(function(){
    "use strict";
    Array.prototype.remove = remove.pythonic();
    Array.prototype.removeFirst = removeFirst.pythonic();
    Array.prototype.removeWhere = removeWhere.pythonic();

    function remove(self, element){
        var removed = [];
        var lastIndex = 0;

        while(self.length > 0){
            var index = self.indexOf(element, lastIndex);
            if(index === -1){
                return removed;
            }else{
                lastIndex = index;
                var curRemoved = self.splice(index, 1);
                removed.push.apply(removed, curRemoved);
            }
        }
        return removed;
    }

    function removeFirst(self, element){
        var index = self.indexOf(element);
        if(index !== -1){
            return self.splice(index, 1);
        }else{
            return [];
        }
    }
    function removeWhere(self, acceptFilter){
        if(!acceptFilter){
            return [];
        }
        var removed = [];
        for(var i =0;i<self.length;i++){
            var toRemove = acceptFilter(self[i]);
            if(toRemove === "break"){
                break;
            }
            if(toRemove){
                removed.push(self[i]);
                self.splice(i, 1);
            }
        }
        return removed;
    }

});

(function(globe, factory) {
    "use strict";
    if (typeof module === "object" && module.exports) {
        require("./pythonic");
        require("./ext-array");
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define('supports/Class',[
            "./pythonic",
            "./ext-array"
        ], factory);
    } else {
        globe.Class = factory();
    }
})(this, function() {
    // jshint strict:false

    var constructorFactoryCache = {};

    function Class() {}

    Class.create = createClass;
    Class.extend = extend;
    Class.singleton = singleton;

    function singleton(){
        var Cls = createClass.apply(null, arguments);
        return new Cls();
    }

    function createClass(name, definition) {
        var args = arguments;
        switch (args.length) {
            case 0:
                throw new Error("Illegal arguments");
            case 1:
                if (isString(args[0])) {
                    definition = {};
                } else {
                    definition = name;
                    name = definition.name || "<anonymous>";
                }
                break;
            case 2:
                if(isDefined(definition)){
                    definition.name = name;
                }
        }
        if(definition){
            var clsName = definition.name;
            if(! /^\w+$/.test(clsName)){
                throw new Error("Invalid class name: " + clsName);
            }
        }
        return extend(Class, definition);
    }

    function extend(Super, definition) {

        if(arguments.length === 1){
            if(isFunction(Super)){
                definition = {};
            }else{
                definition = Super;
                Super = Class;
            }
        }

        function F() {}
        F.prototype = Super.prototype;

        var propertyNames = Object.getOwnPropertyNames(definition);
        var init = definition.init;
        propertyNames.removeFirst("init");
        if (typeof init !== "function") {
            init = noop;
        }
        var className = definition.name || "Class";
        // 启用python风格
        var isPythonicOn = definition.pythonic !== false;

        if(isPythonicOn){
            init = init.pythonic();
        }

        var clazz = createConstructor(className, init);

        clazz.prototype = new F();
        defineConstant(clazz.prototype, "constructor", clazz);
        defineConstant(clazz.prototype, "uber", Super.prototype);
        defineConstant(clazz.prototype, "clazz", clazz);
        defineConstant(clazz.prototype, "superclass", Super);
        defineConstant(clazz, "superclass", Super);
        defineConstant(clazz, "extend", function(definition) {
            return extend.call(clazz, clazz, definition);
        });
        var $super = function(first){
            var self = this;
            if(arguments.length === 1 && isArgument(first)){
                self.superclass.apply(self, first);
            }else{
                self.superclass.apply(self, arguments);
            }
        };

        defineConstant(clazz.prototype, "$super", $super);

        var statics = definition.statics || {};
        propertyNames.removeFirst("statics");

        copyDescriptors(statics, clazz, Object.getOwnPropertyNames(statics));

        if (isPythonicOn) {
            iteratePropNames(definition, propertyNames, function(origin, name) {
                var value = origin[name];
                if (isFunction(value)) {
                    clazz.prototype[name] = value.pythonic();
                } else {
                    copyDescriptor(origin, clazz.prototype, name);
                }
            });
        } else {
            copyDescriptors(definition, clazz.prototype, propertyNames, function(origin, dest, name) {
                return isFunction(origin[name]);
            });
        }

        propertyNames.removeWhere(function(name) {
            return isFunction(definition[name]);
        });
        return clazz;
    }
    function createConstructor(className, init){
        if(!constructorFactoryCache[className]){
            // jshint evil: true
            constructorFactoryCache[className] = new Function("init", "return function " + className + "(){return init.apply(this, arguments);}");
        }
        return constructorFactoryCache[className](init);
    }
    function defineConstant(target, name, value) {
        Object.defineProperty(target, name, {
            value: value,
            enumerable: false,
            configurable: false,
            writable: false
        });
    }

    function iteratePropNames(origin, propNames, callback) {
        if (!isFunction(callback)) {
            callback = noop;
        }
        if (isString(propNames)) {
            callback(origin, propNames);
        }
        for (var i = 0; i < propNames.length; i++) {
            callback(origin, propNames[i]);
        }
    }

    function copyDescriptors(origin, dest, propNames, filter) {
        if (!isFunction(filter)) {
            filter = acceptAll;
        }
        iteratePropNames(origin, propNames, function(origin, name) {
            if (filter(origin, dest, name)) {
                copyDescriptor(origin, dest, name);
            }
        });
    }

    function copyDescriptor(origin, dest, name) {
        var descriptor = Object.getOwnPropertyDescriptor(origin, name);
        if (isDefined(descriptor)) {
            Object.defineProperty(dest, name, descriptor);
        }
    }

    function isString(value) {
        return typeof value === "string";
    }

    function isFunction(value) {
        return typeof value === "function";
    }

    function isDefined(value) {
        return value !== undefined && value !== null;
    }

    function isArgument(value){
        return value + "" === "[object Arguments]";
    }

    return Class;

    function acceptAll() {
        return true;
    }

    function noop() {}
});

define('utils/random.util',[
    "../supports/Class"
],function(Class){
    "use strict";

    var CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var HEX_CHARACTERS = "0123456789abcdefg";
    var counter = new Date().getTime();
    return Class.singleton("RandomUtil", {
        pythonic: false,
        randomString: function(size){
            return randomString(size, CHARACTERS);
        },
        unique: function(prefix){
            return (prefix || "") + (counter++).toString(16);
        },
        randomHex: randomHex
    });

    function randomHex(size){
        return randomString(size, HEX_CHARACTERS);
    }

    function randomString(size, optionsText){
        if(typeof size !== "number" || size < 1){
            size = 8;
        }
        var text = "";

        while(text.length < size){
            text += optionsText[Math.floor(Math.random() * optionsText.length)];
        }

        return text;
    }
});

define('widgets/scrollbar.directive',[
    "./widget.module",
    "angular",
    "utils/random.util",
    "jquery.scrollbar"
], function(app, angular, RandomUtil) {
    "use strict";

    scrollbarDirective.$inject = ["$timeout", "$window"];
    app.directive("uiScrollbar", scrollbarDirective);

    /* @ngInject */
    function scrollbarDirective($timeout, $window) {

        var DEFAULT_OPTIONS = {
            scrollInertia: 0,
            live: true,
            mouseWheelPixels: 140, // 滚动单位
            mouseWheel: true,
            updateOnContentResize: true
        };

        var directive = {
            strict: "AE",
            priority: 500,
            scope: {
                bottomHeight: "@?",
                boxHeight: "@?",
                theme: "@?",
                options: "=?uiScrollbar",
                model: "=?scrollbarModel"
            },
            controller: angular.noop,
            controllerAs: "scrollbar",
            link: {
                pre: preLink
            }
        };

        return directive;

        function preLink($scope, element, attrs) {
            $scope._element = element[0];
            var jqWindow = angular.element($window);
            var optionUpdated = false;

            $scope.model = {
                scrollTo: scrollTo
            };

            attrs.$observe("bottomHeight", fitBotomHeight);
            attrs.$observe("boxHeight", fitBoxHeight);

            var windowResizeEventId = "resize." + RandomUtil.randomString(6);

            $scope.$watch("options", function(options){
                if(options || !optionUpdated){
                    updateOnOptionsChange(options);
                    optionUpdated = true;
                }
            }, true);

            $scope.$watch("_element.offsetHeight", fitHeight);

            jqWindow.on(windowResizeEventId, fitHeight);

            $scope.$on("$destroy", onScopeDestroy);

            function scrollTo(position) {
                element.mCustomScrollbar("scrollTo", position);
            }

            function updateOnOptionsChange(options) {
                if (typeof options === "object") {
                    element.mCustomScrollbar(angular.extend({}, DEFAULT_OPTIONS, options));
                }
            }

            function onScopeDestroy() {
                jqWindow.off(windowResizeEventId);
                element.mCustomScrollbar("destroy");
            }
            return $timeout(function() {
                jqWindow.trigger("resize");
            });

            function fitHeight() {
                if (attrs.bottomHeight) {
                    fitBotomHeight(attrs.bottomHeight);
                }
                if (attrs.boxHeight) {
                    fitBoxHeight(attrs.boxHeight);
                }
            }

            function fitBotomHeight(value) {
                var top = element.offset().top;
                var screenHeight = jqWindow.height();
                var height = Math.max(0, screenHeight - top);

                if (isPercent(value)) {
                    height = height * parseFloat(value) / 100;
                } else if (isNumeric(value)) {
                    height = Math.max(0, height - Number(value));
                } else {
                    try {
                        var $elm = angular.element(value);
                        if ($elm.length > 0) {
                            height = Math.max(0, height - $elm.outerHeight());
                        }
                    } catch (e) {
                        return;
                    }
                }
                if (isNaN(height) || typeof height !== "number") {
                    return;
                }
                element.css({
                    "max-height": height,
                    "height": height,
                    "min-height": height
                });
            }

            function fitBoxHeight(value) {
                var height;
                if (isNumeric(value)) {
                    height = parseInt(value, 10);
                } else if (isPercent(value)) {
                    var top = element.offset().top;
                    var screenHeight = jqWindow.height();
                    height = Math.max(10, screenHeight - top) * parseFloat(value) / 100;
                } else if (value === "parent") {
                    height = element.parent().height();
                } else {
                    try {
                        height = angular.element(height).outerHeight();
                    } catch (e) {}
                }
                if (isNaN(height) || typeof height !== "number") {
                    return;
                }
                element.css({
                    "max-height": height,
                    "height": height
                });
            }
        }

        function isPercent(text) {
            return ('string' === typeof text) && text.match(/\d+(\.\d+)?\%/g);
        }

        function isNumeric(text) {
            return ("string" === typeof text) && text.match(/\d+(\.\d+)?.*/);
        }
    }
});
define('widgets/number.directive',[
    "./widget.module",
    "utils/random.util"
], function(app, RandomUtil) {
    "use strict";
    numberDirective.$inject = ["$timeout"];
    var DEFAULT_MIN = -Infinity;
    var DEFAULT_MAX = +Infinity;
    var DEFAULT_STEP = 1;

    app.directive("uiNumber", numberDirective);

    /* @ngInject */
    function numberDirective($timeout) {
        var supportedNumberTypes = ["float", "integer"];

       var directive = {
           restrict: "A",
           require: "?ngModel",
           link: postLink
       };
       return directive;

       function postLink(scope, element, attrs, ngModel) {
           var min, max, step, p;

           var eventId = RandomUtil.unique();
           var keydown_event = "keydown." + eventId;
           var blur_event = "blur." + eventId;
           var numberType = normalizeNumberType(attrs.numberType || attrs.type);

           if(ngModel){
               ngModel.$parsers.push(function(value){
                   if(numberType === "float"){
                       value = parseFloat(value);
                   }else{
                       value = parseInt(value, 10);
                   }
                   return normalizeValue(value, min, max, step);
               });
           }

           element.on(keydown_event, handleKeydownEvent);
           element.on(blur_event, handleBlurEvent);
           scope.$on("$destroy", handleOnDestroy);

           $timeout(handleBlurEvent);

           function updateRange(){
               min = parseNumberValue("min", DEFAULT_MIN);
               max = parseNumberValue("max", DEFAULT_MAX);
               step = parseNumberValue("step", DEFAULT_STEP);
               p = Math.pow(10, numberOfDecimalPlaces(step));
           }

           function parseNumberValue(name, defaultIfNaN) {
               var attrval = attrs[name];
               if(typeof attrval === "number"){
                   return attrval;
               }else{
                   var v = scope.$eval(attrs[name]);
                   return parseNumber(v, defaultIfNaN);
               }
           }

           function handleOnDestroy() {
               element.off(keydown_event);
               element.off(blur_event);
           }

           function handleBlurEvent() {
               updateRange();
               var val = parseNumber(element.val(), min);

               val = normalizeValue(val, min, max, step);
               element.val(val);
               if(ngModel){
                   ngModel.$setViewValue(val);
                   ngModel.$commitViewValue(val);
               }
           }

           function handleKeydownEvent(event) {
               var code = event.keyCode;
               var min = parseNumber(min, 0);
               var permit = false;
               var permitted = [
                   8, 46, //删除键
                   [48, 57], //数字键
                   [96, 105], //小键盘数字键
                   [37, 40] //方向键
               ];

               if (min < 0) {
                   permitted.unshift(45); // 允许负号
               }

               if ((code === 110 || code === 190) && numberType === "float") {
                   var value = element.val();
                   permit = value.indexOf('.') === -1; // 不允许输入两个小数点
               } else {
                   for (var i = 0; i < permitted.length; i++) {
                       if (typeof permitted[i] === "number") {
                           permit = permit || code === permitted[i];
                       } else {
                           permit = permit || code >= permitted[i][0] && code <= permitted[i][1];
                       }
                       if (permit) {
                           break;
                       }
                   }
               }
               if (!permit) {
                   event.preventDefault();
                   event.stopPropagation();
               }
           }

           function parseNumber(num, defaultIfNaN) {
               var result;
               if (numberType === "float") {
                   result = parseFloat(num);
               } else {
                   result = parseInt(num);
               }
               if (isNaN(result)) {
                   result = defaultIfNaN === undefined ? result : defaultIfNaN;
               }
               return result;
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

           function normalizeValue(value, min, max, step) {
               if (value < min || isNaN(value)) {
                   return min;
               } else if (value > max || !isFinite(value)) {
                   return max;
               }
               if ((value - min) % step !== 0) {
                   value = min + Math.round((value - min) / step) * step;
               }
               return Math.round(value * p) / p;
           }
           function numberOfDecimalPlaces(num){
               var sn = num + "";
               var i = sn.indexOf(".");
               if(i === -1) return 0;
               return sn.length - i - 1;
           }
       }
    }
});
define('widgets/listview.directive',[
    "./widget.module",
    "listview.plugin"
], function(app){
    "use strict";
    app.directive("uiListview", listviewDirective);

    /* @ngInject */
    function listviewDirective(){
        var directive = {
            restrict: "A",
            scope: {
                options: "=?uiListview"
            },
            link: {
                pre: listviewPreLink
            }
        };
        return directive;

        function listviewPreLink(scope, element){
            var listview = element.listview(scope.options || {}).data("listview");
            scope.$watch(scope.options, function(options){
                if(!options){
                    return;
                }
                listview.update(options);
            });
            scope.$on("$destroy", function(){
                listview.destroy();
            });
        }
    }
});
define('widgets/check.directive',[
    "./widget.module"
], function(app){
    "use strict";
    checkDirective.$inject = ["$templateRequest"];
    app.directive("uiCheck", checkDirective);

    /* @ngInject */
    function checkDirective($templateRequest){
        var directive = {
            restrict: "A",
            require: "ngModel",
            compile: checkCompile
        };
        return directive;

        function checkCompile(){
            var templateUrl = "{themed}/widget/check.html";
            $templateRequest(templateUrl).then(function(){

            });
        }
    }
});
define('widgets/spinner.directive',[
    "./widget.module",
    "angular",
    "utils/random.util",
    "./number.directive"
], function(app, angular, RandomUtil) {
    "use strict";
    spinnerDirective.$inject = ["$document", "$parse"];
    SpinnerController.$inject = ["$scope", "$timeout", "$interval"];
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
                self.change({
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
define('var/noop',[],function(){
    "use strict";
    return function noop(){};
});
define('widgets/datetimepicker/datetimepicker-selector.controller',[
    "../widget.module",
    "var/noop",
    "moment",
    "angular"
], function(app, noop, moment, angular){
    "use strict";
    DatetimepickerController.$inject = ["$scope"];
    var isNumber = angular.isNumber;

    app.controller("DatetimepickerSelectorController", DatetimepickerController);

    // @ngInject
    function DatetimepickerController($scope){
        var self = this;
        self.locale = locale;
        self.directivePostLink = noop;
        self.directivePreLink = directivePreLink;
        self.changeSeconds = changeSeconds;
        self.changeMinute = changeMinute;
        self.changeHour = changeHour;
        self.updateViewTime = updateViewTime;
        self.updateCalendar = updateCalendar;
        self.selectDate = selectDate;
        self.switchDateOnMouseWheel = switchDateOnMouseWheel;
        self.nextMonth = nextMonth;
        self.previewMonth = previewMonth;
        self.selectMonth = selectMonth;
        self.selectYear = selectYear;
        self.yearSelectorFocus = yearSelectorFocus;
        self.monthSelectorFocus = monthSelectorFocus;

        activate();

        function activate(){
            self.scrollbarOptions = {
                mouseWheelPixels: 70,
                theme: "minimal-dark"
            };
            self.selectionYears = [];
            var min = 1950;
            var max = moment().year() + 50;
            for(var i = min; i <= max; i++ ){
                self.selectionYears.push(i);
            }
        }

        function directivePreLink(ngModel, parsedModel){
            self.showMonthSelector = false;
            self.showYearSelector = false;
            self.locale = moment.localeData(self.lang);
            self.calendar = { };
            self.ngModel = ngModel;
            self.parsedModel = parsedModel;
            ngModel.$render();
        }
        /**
         * 切换语言
         * @param  {String} lang language
         * @return {Object}      localeData
         */
        function locale(lang){
            self.locale = moment.localeData(lang);
            return self.locale;
        }
        /**
         * 展开年份列表事件
         * @param  {object} scrollbarModel 年份列表滚动条
         * @return {void}
         */
        function yearSelectorFocus(scrollbarModel){
            self.showYearSelector = true;
            scrollbarModel.scrollTo(self.selectionYears.indexOf(self.viewValue.year) * 21.6);
        }
        /**
         * 展开月份列表事件
         * @param  {object} scrollbarModel 月份列表滚动条
         * @return {void}
         */
        function monthSelectorFocus(scrollbarModel){
            self.showMonthSelector = true;
            scrollbarModel.scrollTo(self.viewValue.month * 21.8 );
        }
        function selectMonth(month){
            var currentMonth = self.viewValue.month;
            addToTimeField("M", month - currentMonth);
        }
        function selectYear(year){
            var currentYear = self.viewValue.year;
            addToTimeField("Y", year - currentYear);
        }
        /**
         * 鼠标在日期列表上滚动事件
         * @param  {Object} $event jquery-mousewheel 事件对象
         * @return {void}
         */
        function switchDateOnMouseWheel($event){
            var deltaY = $event.deltaY;
            var field;
            if($event.ctrlKey){
                if($event.shiftKey){
                    field = "Y";
                }else{
                    field = "M";
                }
            }else{
                field = "d";
            }
            $scope.$apply(function(){
                addToTimeField(field, -deltaY);
            });

            $event.stopPropagation();
            $event.preventDefault();
        }
        /**
         * 切换到下个月按钮
         * @return {[type]} [description]
         */
        function nextMonth(){
            addToTimeField("M", 1);
        }
        /**
         * 切换到上个月按钮
         * @return {[type]} [description]
         */
        function previewMonth(){
            addToTimeField("M", -1);
        }

        /**
         * 用户点击日期事件
         * @param  {Object} weekday {time: moment}
         * @return {void}
         */
        function selectDate(weekday){
            self.parsedModel.assign($scope.$parent, +weekday.time);
        }
        /**
         * 使用该事件更新时间表
         * @param  {moment} time 时间
         * @return {void}
         */
        function updateCalendar(time){
            var days = [];
            var i, t;

            var m = moment(+time);
            m.set("D", 1);

            var firstWeekday = m.weekday();

            m.subtract("d", firstWeekday + 1);

            for(i = 1; days.length<42;i++){
                t = moment(+m);
                t.add("d", i);
                days.push(dayInfo(t));
            }

            var result = [];

            for(i = 0; i<7; i++){
                result.push(days.splice(0, 7));
            }

            self.calendar.dateInfo = result;

            function dayInfo(t){
                var month = t.month();
                var dayOfMonth = t.date();
                var isCurrentMonth = month === self.viewValue.month;
                var isCurrentDate = dayOfMonth === self.viewValue.dayOfMonth && isCurrentMonth;
                return {
                    time: t,
                    isCurrentDate: isCurrentDate,
                    isCurrentMonth: isCurrentMonth,
                    year: t.year(),
                    month: month,
                    dayOfWeek: t.weekday(),
                    week: t.week(),
                    dayOfMonth: dayOfMonth
                };
            }
        }
        function changeHour(value, oldValue){
            addToTimeField("H", value - oldValue);
        }
        function changeMinute(value, oldValue){
            addToTimeField("m", value - oldValue);
        }
        function changeSeconds(value, oldValue){
            addToTimeField("s", value - oldValue);
        }
        function addToTimeField(field, offset){
            if(isNaN(offset) || offset === 0 || !isFinite(offset) || !isNumber(offset)){
                return;
            }
            var m = moment(self.ngModel.$modelValue);
            m.add(field, offset);
            self.parsedModel.assign($scope.$parent, 0+m);
        }
        function updateViewTime(m){
            self.time = {
                hour: m.hour(),
                minute: m.minute(),
                second: m.second()
            };
        }
    }

});
define('widgets/mousewheel.directive',[
    "./widget.module",
    "angular",
    "utils/random.util",
    "jquery-mousewheel"
], function(app, angular, RandomUtil){
    "use strict";
    mousewheelDirective.$inject = ["$parse"];
    app.directive("uiMousewheel", mousewheelDirective);

    /* @ngInject */
    function mousewheelDirective($parse){
        var directive = {
            restrict: "A",
            link: mousewheelPostLink
        };
        return directive;

        function mousewheelPostLink(scope, element, attrs){
            var eventHandler = $parse(attrs.uiMousewheel);
            if(! angular.isFunction(eventHandler)){
                return;
            }
            var eventName = RandomUtil.unique("mousewheel.");

            element.on(eventName, function(event){
                return eventHandler(scope, {
                    $event: event
                });
            });

            scope.$on("$destroy", function(){
                element.off(eventName);
            });
        }
    }
});
define('widgets/datetimepicker/datetimepicker-selector.directive',[
    "../widget.module",
    "moment",
    "./datetimepicker-selector.controller",
    "../spinner.directive",
    "../scrollbar.directive",
    "../mousewheel.directive"
], function(app, moment) {
    "use strict";

    datetimepickerDirective.$inject = ["$timeout", "$parse"];
    app.directive("uiDatetimepickerSelector", datetimepickerDirective);

    /* @ngInject */
    function datetimepickerDirective($timeout, $parse) {
        // 关闭moment插件警告
        moment.suppressDeprecationWarnings = true;
        var directive = {
            restrict: "A",
            require: ["uiDatetimepickerSelector", "ngModel"],
            templateUrl: "{themed}/widget/datetimepicker-selector.html",
            replace: true,
            scope: true,
            controller: "DatetimepickerSelectorController",
            controllerAs: "picker",
            bindToController: {
                lang: "@?lang"
            },
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
                    month: time.get("M"),
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
                self.updateViewTime(time);
                self.updateCalendar(time);
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

            self.directivePreLink(ngModel,$parse(attrs.ngModel));
        }
    }
});
define('widgets/datetimepicker/datetimepicker.directive',[
    "../widget.module",
    "moment",
    "utils/random.util",
    "./datetimepicker-selector.directive"
], function(app, moment, RandomUtil){
    "use strict";

    datetimepickerDirective.$inject = ["$parse", "$document"];
    var DEFAULT_OPTIONS = {
        lang: "en",
        format: "YYYY-MM-DD HH:mm:ss",
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm:ss",
        timepicker: true,
        datepicker: true,
        inline: false
    };

    app.directive("uiDatetimepicker", datetimepickerDirective);

    /* @ngInject */
    function datetimepickerDirective($parse, $document){
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
            var globalMousedownEventName = RandomUtil.unique("mousedown.");

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
            $document.on(globalMousedownEventName, function(event){
                var isOutofElement = !angular.element(event.target).closest(element).is(element);
                if(isOutofElement){
                    picker.hideContainer();
                    scope.$apply();
                }
            });
            scope.$on("$destroy", function(){
                $document.off(globalMousedownEventName);
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
        self.showContainer = showContainer;
        self.toggleContainer = toggleContainer;
        self.hideContainer = hideContainer;

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
        function showContainer(){
            self.containerVisible = true;
        }
        function hideContainer(){
            self.containerVisible = false;
        }
        function toggleContainer(){
            if(self.containerVisible){
                self.hideContainer();
            }else{
                self.showContainer();
            }
        }
    }
});
define('widgets/tree/tree.controller',[
    "../widget.module",
    "angular"
], function(app, angular){
    "use strict";

    var isArray = angular.isArray;

    app.controller("UITreeController", TreeController);

    /* ngInject */
    function TreeController(){
        var self = this;
        self.updateOptions = updateOptions;

        function updateOptions(options){
            self.rootTreeNodes = normalizeTreeNodeData(options.data, options);
            self.nodeTemplateUrl = options.nodeTemplateUrl || "{themed}/widget/default-tree-node-tpl.html";
        }

        function normalizeTreeNodeData(data){
            normalizeChildren(data);
            function normalizeChildren(children){
                for(var i =0;i<children.length; i++){
                    var node = children[i];
                    node.hasChildren = isArray(node.children) && node.children.length > 0;
                    if(node.hasChildren){
                        normalizeChildren(node.children);
                    }
                }
            }

            return data;
        }
    }
});
define('widgets/tree/tree-node.controller',[
    "../widget.module",
    "angular"
], function(app, angular){
    "use strict";
    TreeNodeController.$inject = ["logger"];
    app.controller("TreeNodeController",TreeNodeController);

    /* @ngInject */
    function TreeNodeController(logger){
        var self = this;

        self.initOnDirectiveLink = initOnDirectiveLink;

        function initOnDirectiveLink(treeCtrl, data){
            self.tree = treeCtrl;
            self.data = data;
            self.hasChildren = data.hasChildren;
            self.templateUrl = data.templateUrl || treeCtrl.nodeTemplateUrl;
            if(self.hasChildren){
                self.opened = data.opened === undefined ? treeCtrl.defaultOpened === true : data.opened === true;
                self.toggle = toggle;
                self.onKeydown = onKeydown;
            }else{
                self.opened = false;
                self.toggle = angular.noop;
                self.onKeydown = angular.noop;
            }
        }

        function toggle(){
            self.opened = !self.opened;
        }

        function onKeydown($event){
            logger.info($event);
        }
    }
});
define('widgets/tree/tree-node.directive',[
    "../widget.module",
    "./tree-node.controller"
], function(app){
    "use strict";
    app.directive("uiTreeNode", treeNodeDirective);

    /* @ngInject */
    function treeNodeDirective(){
        var directive = {
            restrict: "A",
            templateUrl: "{themed}/widget/tree_node.html",
            require: ["uiTreeNode", "^uiTree"],
            replace: true,
            scope: true,
            controller: "TreeNodeController",
            controllerAs: "nodeCtrl",
            bindToController: {
                data: "=nodeData"
            },
            link: {
                pre: treeNodePreLink
            }
        };
        return directive;

        function treeNodePreLink(scope, element, attrs, ctrls){
            var treeNodeCtrl = ctrls[0];
            var treeCtrl = ctrls[1];
            treeNodeCtrl.initOnDirectiveLink(treeCtrl, treeNodeCtrl.data);
        }
    }

});
define('widgets/tree/tree.directive',[
    "../widget.module",
    "utils/random.util",
    "./tree.controller",
    "./tree-node.directive"
], function(app){
    "use strict";
    // var DEFAULT_NODE_TEMPLATE_ID = "default_tree_node_template.html";
    app.directive("uiTree", uiTreeDirective);

    /* @ngInject */
    function uiTreeDirective(){
        var directive = {
            restrict: "AE",
            scope: true,
            templateUrl: "{themed}/widget/tree.html",
            replace: true,
            terminal: true,
            controller: "UITreeController",
            controllerAs: "tree",
            bindToController:{
                options: "=?uiTree"
            },
            compile: compileUITree
        };
        return directive;

        function compileUITree(){
            // var nodeTemplateHtml = element.html().trim();
            // var treeNodeTemplateId;
            // if(nodeTemplateHtml.length < 1){
            //     treeNodeTemplateId = DEFAULT_NODE_TEMPLATE_ID;
            // }else{
            //     treeNodeTemplateId = RandomUtil.unique("tree-node-template#");
            //     $templateCache.put(treeNodeTemplateId, nodeTemplateHtml);
            //     element.empty();
            // }

            return postLink;

            function postLink(scope, element, attrs, tree){
                scope.$watch("tree.options", function(options){
                    if(options){
                        tree.updateOptions(options);
                    }
                });
            }

        }
    }
});
define('widgets/widgets-require',[
    "./widget.module",
    "./scrollbar.directive",
    "./number.directive",
    "./listview.directive",
    "./check.directive",
    "./spinner.directive",
    "./datetimepicker/datetimepicker.directive",
    "./mousewheel.directive",
    "./tree/tree.directive"
], function(app){
    "use strict";
    return app.name;
});
define('grid/grid.module',[
    "angular",
    "widgets/widgets-require",
    "angular-sanitize",
    "underscore",
    "jquery"
], function(angular, widgetModuleName){
    "use strict";
    return angular.module("ngUI.grid", [
        "ng",
        "ngSanitize",
        widgetModuleName
    ]);
});
define('grid/renderers/value.renderer',[
    "jquery",
    "var/noop"
], function($, noop) {
    "use strict";
    return {
        type: "cell",
        name: "value",
        priority: 0,
        header: noop,
        row: function(options) {
            var element = options.element;
            element.addClass("grid_value");
            var $value = $("<span>");
            $value.attr("ng-bind", "$rowdata[$column.def.field]");
            element.append($value);
        }
    };
});
define('grid/renderers/title.renderer',[
    "jquery",
    "var/noop"
], function($, noop){
    "use strict";
    return {
        type: "cell",
        name:"title",
        priority: 0,
        header: function(options){
            var $cont = $("<span>");
            $cont.addClass("grid_title");
            $cont.text(options.value);
            options.element.prepend($cont);
        },
        row: noop
    };
});
define('grid/renderers/grid.accordion.directive',[
    "../grid.module",
    "utils/random.util",
    "underscore"
], function(app, RandomUtil, _){
    "use strict";
    AccordionController.$inject = ["$scope", "$compile"];
    app.directive("uiGridAccordion", accordionDirective);

    /* @ngInject */
    function accordionDirective(){
        var directive = {
            restrict: "A",
            require: ["^^uiGrid", "uiGridAccordion"],
            templateUrl: "{themed}/grid/ui-grid-accordion.html",
            replace: true,
            controller: AccordionController,
            controllerAs: "accordion",
            link: accordionPostLink
        };
        return directive;

        function accordionPostLink(scope, element, attrs, ctrls){
            var vm = ctrls[1];
            var grid = ctrls[0];
            var $row = element.closest("tr.grid_row");

            var $contentRow = angular.element("<tr>");
            var $contentCell = angular.element("<td>");

            var colspan = $row.find(">td").length;
            $contentCell.attr("colspan", colspan);

            $contentRow.append($contentCell);
            var columnDef = scope.$column.def;
            if(!columnDef.templateUrl){
                throw new Error("'templateUrl' 不能为空!");
            }
            vm.__init__(grid, $row, $contentRow, $contentCell, columnDef);
            scope.$on("$destroy", vm.__destroy__);
        }
    }
    /* @ngInject */
    function AccordionController($scope, $compile){
        var self = this;
        var first = true;
        var compId = RandomUtil.unique("grid-accordion-");

        self.toggleContent = toggleContent;
        self.__destroy__ = __destroy__;
        self.__init__ = __init__;

        function __init__(grid, $row, $contentRow, $contentCell, def){
            self.grid = grid;
            self.$myRow = $row;
            self.$contentRow = $contentRow;
            self.$contentCell = $contentCell;
            self.columnDef = def;

            self.isVisible = false;
            self.templateUrl = def.templateUrl;
            self.oneAtTime = def.oneAtTime !== false;
            if(self.oneAtTime){
                if(!grid.accordions){
                    grid.accordions = {};
                }
                grid.accordions[compId] = self;
            }
        }

        function toggleContent(){
            if(first){
                initialContent();
            }
            first = false;
            self.isVisible = !self.isVisible;
            if(self.oneAtTime){
                _.each(self.grid.accordions, function(accordion){
                    if(accordion !== self){
                        accordion.isVisible = false;
                    }
                });
            }
        }

        function initialContent(){
            var contentScope = $scope.$new();
            self.$contentRow.attr("ng-show", "accordion.isVisible");
            self.$contentCell.attr("ng-include", "accordion.templateUrl");

            self.$myRow.after(self.$contentRow);
            $compile(self.$contentRow)(contentScope);
        }

        function __destroy__(){
            self.$contentRow.remove();
            if(self.oneAtTime){
                delete self.grid.accordions[compId];
            }
        }
    }
});
define('grid/renderers/accordion.renderer',[
    "./grid.accordion.directive",
], function(){
    "use strict";

    return {
        type: "ext",
        name: "accordion",
        init: function(def){
            def.width = 30;
            return def;
        },
        header: function(){
        },
        row: function(options){
            options.element.append("<a ui-grid-accordion>");
        }
    };
});
define('grid/renderers/align.renderer',[],function() {
    "use strict";
    return {
        type: "cell",
        name: "align",
        priority: 0,
        init: function(columnDef) {
            columnDef.align = normalizeAlignValue(columnDef.align);
        },
        header: function(options) {
            options.element.addClass("text-"+options.value);
        },
        row: function(options) {
            var td = options.element,
            alignment = options.value;
            td.addClass("text-"+alignment);
        }
    };

    function normalizeAlignValue(value) {
        if (typeof value === "string") {
            value = value.toLowerCase();
        }else if(typeof value === "object"){
            value = value.value;
        }
        switch (value) {
            case "left":
            case "right":
            case "center":
                return value;
            default:
                return "left";
        }
    }
});
define('grid/renderers/stripe.renderer',[],function(){
    "use strict";
    return {
        type: "row",
        name: "stripe",
        init: function(value){
            if(typeof value === "object"){
                value.oddClass = value.oddClass || "odd";
                value.evenClass = value.evenClass || "even";
            }else{
                return {
                    oddClass: "odd",
                    evenClass: "even"
                };
            }
        },
        render: function(options){
            var rowIndex = options.rowIndex;
            var element = options.element;
            var value = options.value;
            var oddClass = value.oddClass;
            var evenClass = value.evenClass;

            element.removeClass(oddClass, evenClass);

            if((rowIndex & 1) === 0){
                element.addClass(evenClass);
            }else{
                element.addClass(oddClass);
            }
        }
    };
});
define('grid/renderers/grid.cell-editable.directive',[
    "../grid.module",
    "var/noop"
], function(app){
    "use strict";
    app.directive("uiGridCellEditable", gridCellEditableDirective);

    /* @ngInject */
    function gridCellEditableDirective(){
        var directive = {
            restrict: "A",
            link: gridCellEditablePostLink
        };
        return directive;

        function gridCellEditablePostLink(){
            // var header = scope.$header;
            // var def = header.editable;
        }
    }
});
define('grid/renderers/editable.renderer',[
    "jquery",
    "var/noop",
    "./grid.cell-editable.directive"
], function($, noop){
    "use strict";
    return {
        type:"cell",
        name: "editable",
        priority: 100,
        header: noop,
        row: function(options){
            options.element.append("<div ui-grid-cell-editable>");
        }
    };
});
define('grid/renderers/sequence.renderer',[],function(){
    "use strict";
    var sequenceColumnWidth = "auto";
    return {
        type: "ext",
        name: "sequence",
        init: function(def){
            if(def + "" !== "[object Object]"){
                return {
                    enabled: true,
                    width: sequenceColumnWidth
                };
            }else{
                def.width = sequenceColumnWidth;
            }
            return def;
        },
        header: function(options){
            options.element.text("#");
        },
        row: function(options){
            options.element.text(options.rowIndex + 1);
        }
    };
});
define('grid/renderers/grid-head-checkbox.directive',[
    "../grid.module",
    "underscore",
    "utils/random.util"
], function(app, _, RandomUtil){
    "use strict";
    app.directive("uiGridHeadCheckbox", gridHeadCheckboxDirective);

    /* @ngInject */
    function gridHeadCheckboxDirective(){
        var directive = {
            restrict: "A",
            require: ["uiGridHeadCheckbox", "^uiGrid"],
            scope: true,
            controller: HeadCheckboxController,
            controllerAs: "vm",
            templateUrl: "{themed}/grid/ui-grid-head-checkbox.html",
            replace: true,
            link: headCheckboxPostLink
        };
        return directive;

        function headCheckboxPostLink(scope, element, attrs, ctrls){
            var vm = ctrls[0];
            var grid = ctrls[1];
            vm.__init__(grid);
            scope.$on("$destroy", vm.__destroy__);
        }
    }
    /* @ngInject */
    function HeadCheckboxController(){
        var self = this;
        var selectOneEventName = RandomUtil.unique("selectOne.");
        self.__init__ = __init__;
        self.__destroy__ = __destroy__;
        self.selectStateChange = selectStateChange;

        var selectedRows = [];

        function __init__(grid){
            self.grid = grid;
            grid.delegate.on(selectOneEventName, onSelectOne);
            grid.delegate.getSelectedRows = getSelectedRows;
            grid.delegate.getSelectedRow = getSelectedRow;
        }
        function __destroy__(){
            self.grid.delegate.off(selectOneEventName);
        }
        function onSelectOne(event, selected, rowdata){
            if(!selected){
                self.selected = false;
                var index = selectedRows.indexOf(rowdata);
                if(index > -1){
                    selectedRows.splice(index, 1);
                }
            }else{
                selectedRows.push(rowdata);
                self.selected = selectedRows.length === self.grid.delegate.data.length;
            }
        }
        function selectStateChange(selected){
            if(selected){
                selectedRows = _.clone(self.grid.delegate.data);
            }else{
                selectedRows = [];
            }
            self.grid.delegate.trigger("selectAll", selected);
        }

        function getSelectedRow(){
            return selectedRows[0];
        }
        function getSelectedRows(){
            return selectedRows;
        }
    }
});
define('grid/renderers/grid-row-checkbox.directive',[
    "../grid.module",
    "utils/random.util"
], function(app, RandomUtil){
    "use strict";
    app.directive("uiGridRowCheckbox", gridRowCheckboxDirective);

    /* @ngInject */
    function gridRowCheckboxDirective(){
        var directive = {
            restrict: "A",
            require: ["uiGridRowCheckbox", "^uiGrid"],
            templateUrl: "{themed}/grid/ui-grid-row-checkbox.html",
            replace: true,
            controller: GridRowCheckboxController,
            controllerAs: "vm",
            scope: true,
            link: gridRowCheckboxPostLink
        };
        return directive;
        function gridRowCheckboxPostLink(scope, element, attrs, ctrls){
            var vm = ctrls[0];
            var grid = ctrls[1];
            vm.__init__(grid, scope.$rowdata);
            scope.$on("$destroy", vm.__destroy__);
        }
    }

    /* @ngInject */
    function GridRowCheckboxController(){
        var selectAllEventName = RandomUtil.unique("selectAll.");

        var self = this;
        self.__init__ = __init__;
        self.__destroy__ = __destroy__;
        self.selectStateChange = selectStateChange;

        function __init__(grid, rowdata){
            self.grid = grid;
            self.rowdata = rowdata;
            grid.delegate.on(selectAllEventName, onSelectAllStateChange);
        }

        function onSelectAllStateChange(event, selected){
            self.selected = selected;
        }

        function __destroy__(){
            self.grid.delegate.off(selectAllEventName);
        }
        function selectStateChange(selected){
            self.grid.delegate.trigger("selectOne", selected, self.rowdata);
        }
    }
});
define('grid/renderers/grid-row-radio.directive',[
    "../grid.module"
], function(app){
    "use strict";
    app.directive("uiGridRowRadio", gridRowRadioDirective);

    /* @ngInject */
    function gridRowRadioDirective(){
        var directive = {
            restrict: "A",
            require: ["uiGridRowRadio", "^uiGrid"],
            templateUrl: "{themed}/grid/ui-grid-row-radio.html",
            replace: true,
            scope: true,
            controller: GridRowRadioController,
            controllerAs: "vm",
            link: gridRowRadioPostLink
        };
        return directive;

        function gridRowRadioPostLink(scope, element, attrs, ctrls){
            var vm = ctrls[0];
            var grid = ctrls[1];

            vm.__init__(grid, scope.$rowdata);
        }
    }

    /* @ngInject */
    function GridRowRadioController(){
        var self = this;

        self.__init__ = __init__;
        self.selectStateChange = selectStateChange;

        function __init__(grid, rowdata){
            self.grid = grid;
            self.rowdata = rowdata;
        }

        function selectStateChange(selected){
            if(selected){
                self.grid.delegate.getSelectedRow = getSelectedRow;
                self.grid.delegate.getSelectedRows = getSelectedRows;
            }
            self.grid.delegate.trigger("selectOne", !!selected, self.rowdata);
        }

        function getSelectedRow(){
            return self.rowdata;
        }
        function getSelectedRows(){
            return [self.rowdata];
        }
    }
});
define('grid/renderers/check.renderer',[
    "./grid-head-checkbox.directive",
    "./grid-row-checkbox.directive",
    "./grid-row-radio.directive"
],function(){
    "use strict";
    return {
        type: "ext",
        name: "check",
        init: function(value){
            var type;
            if(typeof value === "object"){
                type = value.value;
            }else{
                type = value;
            }
            if(type !== "checkbox" && type !== "radio"){
                throw new Error("invalid check type: " + type);
            }
            return {
                type: type,
                width: 40
            };
        },
        header: function(options){
            var checkType = options.column.type;
            if("checkbox" === checkType){
                options.element.append("<div ui-grid-head-checkbox>");
            }
        },
        row: function(options){
            options.element.append("<div ui-grid-row-"+options.column.def.type+">");
        }
    };
});
define('grid/renderers/all',[
    "./value.renderer",
    "./title.renderer",
    "./accordion.renderer",
    "./align.renderer",
    "./stripe.renderer",
    "./editable.renderer",
    "./sequence.renderer",
    "./check.renderer"
], function(){
    "use strict";
    return Array.prototype.slice.call(arguments);
});
define('utils/registable',[
    "../supports/Class"
], function(Class) {
    "use strict";

    return Class.create({
        init: function(self){
            self.components = {};
        },
        reader: reader,
        writer: writer
    });

    function writer(self) {
        return {
            regist: function(name, component) {
                return regist(self, name, component);
            }
        };
    }

    function reader(self) {
        return {
            get: function(name) {
                return get(self, name);
            },
            has: function(name) {
                return has(self, name);
            }
        };
    }

    function regist(self, name, component) {
        self.components[name] = component;
    }

    function has(self, name) {
        var comps = self.components;
        return comps[name] !== undefined;
    }

    function get(self, names) {
        var comps = self.components;
        var results = [];
        if (angular.isString(names)) {
            return comps[names];
        }else{
            var args = arguments;
            if(args.length > 2){
                names = _(args).slice(1);
            }
        }
        if(_.isArray(names)){
            results = _.pick(comps, names);
        }

        if (results.length > 1) {
            return _.sortBy(results, function(a){
                return priorityOf(a);
            });
        }
        return results;

        function priorityOf(comp) {
            if (!angular.isObject(comp)) {
                return 0;
            }
            if (angular.isNumber(comp.priority)) {
                return comp.priority;
            }
            return 0;
        }
    }
});

define('grid/grid.provider',[
    "./grid.module",
    "underscore",
    "utils/registable",
    "supports/Class"
], function(app, _, Registable, Class) {
    "use strict";

    app.provider("$grid", GridProvider);

    /*  @ngInject */
    function GridProvider() {
        var renderers = new Registable();

        var renderersWriter = renderers.writer();

        var $grid = Class.singleton({
            init: function(self) {
                self.renderersReader = renderers.reader();
            },
            getRowRenderer: function(self, name) {
                var rendererName = rowName(name);
                return self.renderersReader.get(rendererName);
            },
            hasRowRenderer: function(self, name) {
                var rendererName = rowName(name);
                return self.renderersReader.has(rendererName);
            },
            getCellRenderer: function(self, name, isExtention){
                var registName = registNameOf(isExtention ? "ext": "cell", name);
                return self.renderersReader.get(registName);

            },
            hasCellRenderer: function(self, name, isExtention) {
                var registName = registNameOf(isExtention ? "ext": "cell", name);
                return self.renderersReader.has(registName);
            }
        });

        this.registRenderer = registRenderer;

        function registRenderer(name, renderer, type) {
            var registName = registNameOf(type, name);
            renderersWriter.regist(registName, renderer);
        }

        this.$get = function() {
            return $grid;
        };

        function registNameOf(type, name){
            switch(type){
                case "cell":
                return cellName(name);
                case "row":
                return rowName(name);
                case "ext":
                return extName(name);
                default:
                throw new Error("invalid regist type: " + type);
            }
        }

        function cellName(name) {
            return "cell." + name;
        }

        function extName(name) {
            return "ext." + name;
        }

        function rowName(name) {
            return "row." + name;
        }
    }
});
define('grid/grid.config',[
    "./grid.module",
    "./renderers/all",
    "./grid.provider",
], function(app, allRenderers){
    "use strict";

    configure.$inject = ["$gridProvider"];
    app.config(configure);

    /* @ngInject */
    function configure($gridProvider){
        _.each(allRenderers, function(renderer){
            $gridProvider.registRenderer(renderer.name, renderer, renderer.type || "cell");
        });
    }
});
define('event/subject',[
    "supports/Class"
],function(Class) {
    "use strict";

    return Class.create("Subject", {
        init: function(self){
            self.observers = {};
        },
        //注册事件
        on: on,
        //只执行一次
        one: one,
        //事件触发
        trigger: trigger,
        // 取消事件
        off: off
    });

    function Observer(source, name, data, callback, times) {
        this.source = source;
        this.name = name;
        this.data = data;
        this.callback = callback;
        this.times = times || Infinity;
    }

    function attach(self, names, callback, data, times) {
        if (names === undefined) {
            names = undefined + "";
        }

        var nameParts = names.split(",");
        for(var i=0;i<nameParts.length;i++){
            attachOne(nameParts[i].trim());
        }

        function attachOne(name){
            var parts = name.split(".");
            name = parts[0];
            var cls = parts[1];
            var obs = self.observers[name];
            if (!obs) {
                obs = {};
                self.observers[name] = obs;
            }
            var ob = obs[cls];
            if (!ob) {
                ob = [];
                obs[cls] = ob;
            }
            ob.push(new Observer(self, name, data, callback, times));
        }
    }


    function on(self, name, dataOrCallback, callback) {
        var data;
        if (typeof dataOrCallback === "function") {
            data = callback;
            callback = dataOrCallback;
        } else if (typeof callback === "function") {
            data = dataOrCallback;
        }
        attach(self, name, callback, data);
    }

    function one(self, name, dataOrCallback, callback) {
        var data;
        if (typeof dataOrCallback === "function") {
            data = callback;
            callback = dataOrCallback;
        } else if (typeof callback === "function") {
            data = dataOrCallback;
        }
        attach(self, name, callback, data, 1);
    }

    function trigger(self, names) {
        if (names === undefined) {
            names = undefined + "";
        }
        var nameParts = names.split(",");

        var args = Array.prototype.slice.call(arguments, 2);

        for(var i = 0; i < nameParts.length; i++){
            triggerOneName(nameParts[i].trim());
        }

        function triggerOneName(name){
            var parts = name.split(".");
            name = parts[0];
            var cls = parts[1];
            var observersOfName = self.observers[name];

            if (!observersOfName) {
                return false;
            }

            if (cls) {
                triggerByCls(self, observersOfName[cls], args);
            } else {
                triggerAll(self, observersOfName, args);
            }
        }
    }

    function triggerAll(self, observersOfName, args) {
        var has = false;
        for (var k in observersOfName) {
            has = true;
            var observers = observersOfName[k];
            if (observers && observers.length > 0) {
                for (var i = 0; i < observers.length; i++) {
                    var observer = observers[i];
                    callObserver(self, observer, args);
                }
            }
        }
        return has;
    }

    function triggerByCls(self, observers, args) {
        if (observers && observers.length > 0) {
            for (var i = 0; i < observers.length; i++) {
                var observer = observers[i];
                callObserver(self, observer, args);
            }
            return true;
        }
    }

    function off(self, names, func) {
        if (names === "*") {
            self.observers = {};
            return;
        }

        if (names === undefined) {
            names = undefined + "";
        }

        var nameParts = names.split(",");

        for(var i = 0; i < nameParts.length; i++){
            dettachOne(self, nameParts[i].trim(), func);
        }

        function dettachOne(self, name, func){
            var parts = name.split(".");
            name = parts[0];
            var cls = parts[1];
            var observersOfName = self.observers[name];
            if (!observersOfName) {
                return false;
            }
            if (cls) {
                observersOfName[cls] = undefined;
                delete observersOfName[cls];
            } else if ('function' === typeof func) {
                for (var k in observersOfName) {
                    var observerItems = observersOfName[k];
                    for (var i = 0; i > -1 && i < observerItems.length; i++) {
                        var observerItem = observerItems[i];
                        if (observerItem && observerItem.callback === func) {
                            observerItems.splice(i, 1);
                            i--;
                        }
                    }
                }
            } else {
                self.observers[name] = {};
            }
        }
    }

    function callObserver(self, observer, args) {
        if (observer !== undefined) {
            try {
                var callArgs = [observer];
                callArgs.push.apply(callArgs, args);
                observer.callback.apply(observer.source, callArgs);
            } catch (e) {
                throw e;
            } finally {
                observer.times -= 1;
            }
        }
    }
});

define('grid/store/datasource',[
    "../grid.module",
    "supports/Class"
],function(app, Class){
    "use strict";

    DatasourceFactory.$inject = ["$http"];
    app.factory("NgUIDatasource", DatasourceFactory);

    /* @ngInject */
    function DatasourceFactory($http){
        return Class.create({
            name: "Datasource",
            init: function init(self, options){
                self.url = options.url;
                self.headers = options.headers;
                self.requestMethod = options.requestMethod || "GET";
                self.options = options;
            },
            load: function load(self, params){
                return $http({
                    url: self.url,
                    params: params,
                    headers: self.headers,
                    method: self.requestMethod
                }).then(function(response){
                    return response.data;
                });
            }
        });
    }

});

define('grid/store/jsonDatasource',[
    "../grid.module",
    "supports/Class",
    "./datasource",
], function(app, Class){
    "use strict";

    JSONDatasourceFactory.$inject = ["$q", "NgUIDatasource"];
    app.factory("NgUIJSONDatasource", JSONDatasourceFactory);

    /* @ngInject */
    function JSONDatasourceFactory($q, NgUIDatasource){
        return Class.extend(NgUIDatasource, {
            name: "JSONDatasource",
            init: function(self, data){
                self.data = data;
            },
            load: function(self){
                var data = self.data || [];
                return $q.when({
                    page: 1,
                    data: data,
                    total: data.length
                });
            }
        });
    }

});

define('grid/store/store.provider',[
    "../grid.module",
], function(app) {
    "use strict";

    app.provider("$store", StoreProvider);

    function StoreProvider() {
        var self = this;

        var config = {};

        self.$get = function() {
            return config;
        };
    }
});

define('grid/store/store.factory',[
    "../grid.module",
    "underscore",
    "supports/Class",
    "event/subject",
    "./datasource",
    "./jsonDatasource",
    "./store.provider"
], function(app, _, Class, Subject) {
    "use strict";

    StoreFactory.$inject = ["$q"];
    app.factory("UIGridStore", StoreFactory);

    var BEFORE_LOAD_EVENT = "beforeLoad";
    var LOAD_SUCCESS_EVENT = "loaded";
    var LOAD_ERROR_EVENT = "loadError";
    var LOAD_COMPLETE_EVENT = "complete";

    var DEFAULT_OPTIONS = {
        autoLoad: false,
        keepSelect: true // 重新加载后保持原来的选择状态， 对于使用序号做标识的情况无效
    };
    /* @ngInject */
    function StoreFactory($q) {
        return Class.extend(Subject, {
            name: "Store",
            statics: {
                BEFORE_LOAD_EVENT: BEFORE_LOAD_EVENT,
                LOAD_SUCCESS_EVENT: LOAD_SUCCESS_EVENT,
                LOAD_ERROR_EVENT: LOAD_ERROR_EVENT,
                LOAD_COMPLETE_EVENT: LOAD_COMPLETE_EVENT
            },
            init: init,
            setParams: setParams,
            reload: reload,
            load: load,
            setCollation: setCollation,
            unsetCollation: unsetCollation,
            fetchLoaded: fetchLoaded
        });

        /**
         * 构造器
         * @param  {Object} options store配置
         */
        function init(self, options) {
            self.$super();
            options = _.extend({}, DEFAULT_OPTIONS, options);

            self.params = _.extend({}, options.params);
            self.datasource = options.datasource;
            self.collation = {};

            self.dataHandlers = [];

            _.each(options.events, function(handler, eventName) {
                if (_.isFunction(handler)) {
                    self.on(eventName, handler);
                }
            });

            self.$$loadCount = 0;
        }
        /**
         * 设置参数
         * @param {String|Object} name  参数名称或参数对象
         * @param {Object} value 参数值, 仅name做string使用时有效
         */
        function setParams(self, name, value) {
            var newParams;
            if (_.isObject(name)) {
                newParams = name;
            } else {
                newParams = {};
                newParams[name] = value;
            }
            self.params = _.extend({}, self.params, newParams);
        }
        /**
         * 使用旧参数重新加载数据
         */
        function reload(self) {
            if (!_.isUndefined(self.lastParams)) {
                return self.load(self.lastParams);
            }
        }
        function fetchLoaded(self){
            return self.$$lastLoadPromise || $q.reject("unloaded");
        }
        /**
         * 加载数据
         * @param  {Object} params 加载参数
         * @return {promise}
         */
        function load(self, params) {
            var remoteOrder = {};
            var localOrders = [];

            _.each(self.collation, function(field, def) {
                if (def.remote) {
                    remoteOrder[field] = def.remote;
                } else if (def.local) {
                    localOrders.push(def.local);
                }
            });

            params = _.extend({}, self.params, {
                order: remoteOrder
            }, params);

            self.trigger(BEFORE_LOAD_EVENT, params);

            self.lastParams = params;

            var promise = self.datasource
                .load(params, self)
                .then(loadSuccess, loadError);
            self.$$lastLoadPromise = promise;
            return promise;

            function loadSuccess(result) {
                var lastLoadPromise = self.$$lastLoadPromise;
                if(lastLoadPromise !== undefined && lastLoadPromise !== promise){
                    return lastLoadPromise;
                }

                var data = invokeDataHandles(self, result.data);

                self.trigger(LOAD_SUCCESS_EVENT, result, data, params);
                self.trigger(LOAD_COMPLETE_EVENT, result, data, params);
                return {
                    result: result,
                    data: data,
                    params: params
                };
            }
            function loadError(reason) {
                var lastLoadPromise = self.$$lastLoadPromise;
                if(lastLoadPromise !== undefined && lastLoadPromise !== promise){
                    return lastLoadPromise;
                }
                self.trigger(self.clazz.LOAD_ERROR_EVENT, reason);
                self.trigger(self.clazz.LOAD_COMPLETE_EVENT, reason);
                return $q.reject(reason, params);
            }
        }

        function invokeDataHandles(self, data) {
            _.each(self.dataHandlers, function(handle) {
                var result = handle.call(self, data);
                if (_.isArray(result)) {
                    data = result;
                }
            });
            return data;
        }

        function setCollation(self, field, direction, priority, remote) {

            var collation = self.collation[field] || {};

            var config = {
                direction: direction,
                priority: priority
            };
            if (remote) {
                collation.locale = undefined;
                collation.remote = config;
            } else {
                collation.locale = config;
                collation.remote = undefined;
            }

            self.collation[field] = collation;
        }

        function unsetCollation(self, field) {
            self.collation[field] = undefined;
        }
    }

});

define('grid/grid.factory',[
    "./grid.module",
    "underscore",
    "utils/random.util",
    "supports/Class",
    "event/subject",
    "var/noop",
    "./store/store.factory"
], function(app, _, RandomUtil, Class, Subject, noop) {
    "use strict";

    gridFactory.$inject = ["$grid", "$q", "UIGridStore"];
    app.factory("UIGrid", gridFactory);

    /* @ngInject */
    function gridFactory($grid, $q, UIGridStore) {
        var CONSTT_VALUE = "";
        var INDEX_KEY = "$index";
        var BEFORE_LOAD_EVENT = UIGridStore.BEFORE_LOAD_EVENT + "." + RandomUtil.randomString();
        var LOAD_SUCCESS_EVENT = UIGridStore.LOAD_SUCCESS_EVENT + "." + RandomUtil.randomString();
        var LOAD_ERROR_EVENT = UIGridStore.LOAD_ERROR_EVENT + "." + RandomUtil.randomString();
        var LOAD_COMPLETE_EVENT = UIGridStore.LOAD_COMPLETE_EVENT + "." + RandomUtil.randomString();


        var DEFAULT_OPTIONS = {
            key: INDEX_KEY, // $index 表示使用序号做标识符
            page: 1,
            autoLoad: false,
            pageSize: 10,
            keepSelect: true // 重新加载后保持原来的选择状态， 对于使用序号做标识的情况无效
        };

        return Class.extend(Subject, {
            name: "Grid",
            statics: {
                BEFORE_LOAD_EVENT: BEFORE_LOAD_EVENT,
                LOAD_SUCCESS_EVENT: LOAD_SUCCESS_EVENT,
                LOAD_ERROR_EVENT: LOAD_ERROR_EVENT,
                LOAD_COMPLETE_EVENT: LOAD_COMPLETE_EVENT
            },
            init: init,
            goPage: goPage,
            prevPage: prevPage,
            nextPage: nextPage,
            getRow: getRow,
            getSelectedRows: getSelectedRows,
            getSelectedRow: getSelectedRow,
            destroy: destroy
        });

        function init(self, options) {
            self.$super();
            if (!_.isObject(options)) {
                throw new Error("invlaid option");
            }
            options = _.extend({}, DEFAULT_OPTIONS, options);
            if (!options.store) {
                throw new Error("store is required");
            }

            var defaults = options.defaults || {};
            self.bordered = options.bordered !== false;
            self.height = options.height;
            self.fixHeader = options.fixHeader !== false; // 默认值为true

            self.page = options.page;
            self.pageSize = options.pageSize;
            self.key = options.idField || INDEX_KEY;

            self.store = options.store;

            _.each(options.events, function(handler, eventName) {
                if (_.isFunction(handler)) {
                    self.on(eventName, handler);
                }
            });

            if (options.pageStrategy !== "button" && options.pageStrategy !== "scroll") {
                self.pageStrategy = options.pageStrategy || "button";
            }
            self.headers = [];
            self.columns = [];
            self.rows = [];

            resolveExtention(self.headers, self.columns, options.ext);

            resolveColumn(self.headers, self.columns, options.columns, defaults);

            setColumnIndex(self.headers);
            setColumnIndex(self.columns);

            resolveRowRenderers(self.rows, options.rows);

            var store = self.store;
            store.on(BEFORE_LOAD_EVENT, function(event, params) {
                params.page = self.page;
                params.pageSize = self.pageSize;
                self.loadStatus = "loading";
            });
            store.on(LOAD_SUCCESS_EVENT, function(event, response, data, params) {
                self.loadStatus = "success";
                onLoadSuccess(self, response, data, params);
            });
            store.on(LOAD_COMPLETE_EVENT, function() {
                self.loadStatus = "complete";
            });
            store
                .fetchLoaded()
                .then(function(result) {
                    self.loadStatus = "success";
                    onLoadSuccess(self, result.result, result.data, result.params);
                });
        }

        function resolveColumn(resolvedHeaders, resolvedColumns, columns, defaults) {
            _.each(columns, function(columnDef) {
                _.defaults(columnDef, defaults);
                columnDef.value = CONSTT_VALUE;

                var keys = _.keys(columnDef);

                var headerRenderers = [];
                var rowRenderers = [];

                _.each(
                    keys,
                    function(name) {
                        var def = columnDef[name];
                        if (!isEnabledDef(def)) {
                            return;
                        }
                        var renderersDef = $grid.getCellRenderer(name, false);
                        if (renderersDef) {
                            if (_.isFunction(renderersDef.init)) {
                                renderersDef.init(columnDef);
                            }
                            rowRenderers.push({
                                def: def,
                                name: renderersDef.name,
                                priority: renderersDef.priority,
                                render: renderersDef.row || noop
                            });
                            headerRenderers.push({
                                def: def,
                                name: renderersDef.name,
                                priority: renderersDef.priority,
                                render: renderersDef.header || noop
                            });
                        }
                    }
                );
                rowRenderers = _.sortBy(rowRenderers, orderByPriority);
                headerRenderers = _.sortBy(headerRenderers, orderByPriority);

                resolvedHeaders.push({
                    renderers: headerRenderers,
                    def: columnDef
                });
                resolvedColumns.push({
                    renderers: rowRenderers,
                    def: columnDef
                });
            });
        }

        function resolveExtention(resolvedHeaders, resolvedColumns, ext) {
            _.each(ext, function(def, attr) {
                if (!isEnabledDef(def)) {
                    return;
                }

                if (!$grid.hasCellRenderer(attr, true)) {
                    return;
                }

                var rendererDef = $grid.getCellRenderer(attr, true);

                if (_.isFunction(rendererDef.init)) {
                    def = rendererDef.init(def) || def;
                }

                resolvedHeaders.push({
                    priority: rendererDef.priority,
                    renderers: [{
                        name: rendererDef.name,
                        priority: rendererDef.priority,
                        render: rendererDef.header || noop
                    }],
                    def: def
                });

                resolvedColumns.push({
                    priority: rendererDef.priority,
                    renderers: [{
                        name: rendererDef.name,
                        priority: rendererDef.priority,
                        render: rendererDef.row || noop
                    }],
                    def: def
                });
            });
        }

        function resolveRowRenderers(rowRenderersHolder, rows) {
            _.each(rows, function(def, name) {
                if (!isEnabledDef(def)) {
                    return;
                }

                if (!$grid.hasRowRenderer(name)) {
                    return;
                }

                var rendererDef = $grid.getRowRenderer(name);

                if (_.isFunction(rendererDef.init)) {
                    rendererDef.init(def);
                }

                rowRenderersHolder.push({
                    priority: rendererDef.priority,
                    render: rendererDef.render,
                    def: def
                });
            });
            _.sortBy(rowRenderersHolder, orderByPriority);
        }
        function setColumnIndex(columns){
            _.each(columns, function(column, index){
                column.columnIndex = index;
            });
        }
        function isEnabledDef(def) {
            return !(def === undefined ||
                def === "none" ||
                def === false ||
                def === null ||
                def.enabled === false);
        }

        function orderByPriority(renderer) {
            return renderer.priority;
        }
        /**
         * 请求指定页码数据
         * @param  {number} page   目标页码
         * @param  {object} params [description]
         * @return {promise}
         */
        function goPage(self, page, params) {
            if (self.pageCount === undefined || (page > 0 && page <= self.pageCount)) {
                params = _.extend({}, self.lastParams, params);
                self.page = parseInt(page, 10);
                return self.load(params);
            } else {
                return $q.reject("parameter error");
            }
        }
        /**
         * 请求下n页的数据
         * @param  {number} step 往后几页
         */
        function nextPage(self, step) {
            self.goPage(self.page + (step || 1));
        }
        /**
         * 请求上n页的数据
         * @param  {number} step 往上几页
         */
        function prevPage(self, step) {
            self.goPage(self.page - (step || 1));
        }
        /**
         * 获取一行数据
         * @param  {any} id  数据ID
         * @return {object}      一行数据
         */
        function getRow(self, id) {
            return self.dataMap[id];
        }
        /**
         * 获取所有选中的行
         * @return {Array}
         */
        function getSelectedRows(){
            return [];
        }
        /**
         * 获取选中的一行， 多选时返回第一行
         * @return {Object}
         */
        function getSelectedRow(){
            return undefined;
        }
        /**
         * 销毁
         * @return {[type]}
         */
        function destroy(self) {
            self.store.off(BEFORE_LOAD_EVENT);
            self.store.off(LOAD_SUCCESS_EVENT);
            self.store.off(LOAD_ERROR_EVENT);
            self.store.off(LOAD_COMPLETE_EVENT);
        }

        function onLoadSuccess(self, response, data, params) {
            self.data = data;
            self.dataMap = {};
            if (_.isArray(data)) {
                if (self.key === INDEX_KEY) {
                    _.each(data, function(item, index) {
                        data[self.key] = index;
                    });
                }
                _.each(data, function(item) {
                    self.dataMap[item[self.key]] = item;
                });
            }

            self.total = response.total;

            self.page = response.page || params.page;

            self.pageCount = Math.max(1, Math.ceil(self.total / self.pageSize));

            var min = Math.max(1, Math.min(self.page - 3, self.pageCount - 6));
            var max = Math.min(min + 6, self.pageCount);
            self.pageNumbers = _.range(min, max + 1, 1);
        }
    }
});
define('grid/grid.controller',[
    "underscore",
    "./grid.module",
    "./grid.factory",
], function(_, app) {
    "use strict";
    app.controller("UIGridController", GridController);

    /* @ngInject */
    function GridController() {
        var self = this;

        self.changePageSize = changePageSize;
        self.activate = activate;
        self.destroy = destroy;
        self.getRowRenderers = getRowRenderers;

        function activate(delegate) {
            self.delegate = delegate;
            self.gridBodyScrollbarOptions = {
                'live':'on',
                'theme':'minimal-dark'
                // 'callbacks':self.scrollbarCallbacks
            };
        }

        function changePageSize(newPageSize) {
            var pageCount = Math.ceil(self.store.total / newPageSize);
            self.delegate.pageSize = newPageSize;
            if (self.delegate.page > pageCount) {
                self.go(pageCount);
            } else {
                self.store.load();
            }
        }

        function getRowRenderers(){
            return self.delegate.rows;
        }
        function destroy(){
            if(self.delegate){
                self.delegate.destroy();
            }
        }
    }
});

define('grid/grid.head-cell.directive',[
    "./grid.module",
    "underscore"
], function(app, _) {
    "use strict";

    gridHeadCellDirective.$inject = ["$compile", "$timeout"];
    app.directive("uiGridHeadCell", gridHeadCellDirective);

    /* @ngInject */
    function gridHeadCellDirective($compile, $timeout) {
        var directive = {
            restrict: "A",
            require: "^^uiGrid",
            link: {
                pre: preLink
            }
        };
        return directive;

        function preLink(scope, element, attrs, grid) {
            var header = scope.header;
            _(
                _.filter(header.renderers, function(render) {
                    return _.isFunction(render.render);
                })
            ).each(function(renderer) {
                element.addClass("ui_grid_head_rendered--" + renderer.name);
                // renderer.render(element, renderer.def, header.def, grid);
                renderer.render({
                    element: element,
                    value: renderer.def,
                    column: header.def,
                    grid: grid
                });
            });

            $compile(element.contents())(scope);

            return $timeout(function() {
                var width;
                if(header.def.width === "auto"){
                    header.realWidth = element.outerWidth();
                    return;
                }
                if (header.def.width) {
                    width = Math.floor(header.def.width);
                } else {
                    width = element.outerWidth();
                }

                element.attr("width", width);
                element.css({
                    "width": width,
                    "min-width": width,
                    "max-width": width
                });

                header.realWidth = element.outerWidth();

            });
        }
    }
});
define('grid/grid.header.directive',[
    "./grid.module"
], function(app){
    "use strict";

    app.directive("uiGridHeader", gridHeaderDirective);

    function gridHeaderDirective(){
        var directive = {
            restrict: "A",
            require:"^^uiGrid"
        };
        return directive;
    }
});

define('grid/grid.row-cell.directive',[
    "./grid.module",
    "angular",
    "underscore",
    "utils/random.util"
], function(app, angular, _, RandomUtil) {
    "use strict";

    uiGridCellDirective.$inject = ["$compile", "$window", "$timeout"];
    app.directive("uiGridRowCell", uiGridCellDirective);

    /* @ngInject */
    function uiGridCellDirective($compile, $window, $timeout) {
        var jqWindow = angular.element($window);
        var directive = {
            restrict: "A",
            require: "^^uiGrid",
            link: {
                pre: gridCellPreLink,
                post: gridCellPostLink
            }
        };
        return directive;

        function gridCellPreLink(scope, element, attrs, grid) {
            var $column = scope.$column;
            scope.$header = $column.def;
            var $rowdata = scope.$rowdata;
            _(
                _.filter($column.renderers, function(renderer){
                    return _.isFunction(renderer.render);
                })
            ).each(function(renderer){
                element.addClass("ui_grid_cell_rendered--" + renderer.name);
                renderer.render({
                    element: element,
                    value: renderer.def,
                    rowdata: $rowdata,
                    column: $column,
                    grid: grid,
                    rowIndex: scope.$rowIndex
                });
            });
            $compile(element.contents())(scope);
        }

        function gridCellPostLink(scope, element, attrs, grid) {
            if(!grid.delegate.fixHeader){
                return;
            }
            var $column = scope.$column;
            // var header = $column.def;
            var columnIndex = $column.columnIndex;
            var $rowIndex = scope.$rowIndex;

            if ($rowIndex === 0) {
                autoAdjustWidth(scope, element, $column, columnIndex);
            }
        }

        function autoAdjustWidth(scope, element, $column, columnIndex) {
            var $header = element.closest(".grid_container") //
                        .find(".grid_header table>thead>tr>th") //
                        .eq(columnIndex);
            var resizeEventId = RandomUtil.unique("resize.");

            jqWindow.on(resizeEventId, function() {
                adjustCellWidth();
            });

            scope.$on("$destroy", function() {
                jqWindow.off(resizeEventId);
            });

            adjustCellWidth();
            var timmerPromise = $timeout(function(){
                adjustCellWidth();
                $timeout.cancel(timmerPromise);
            });

            function adjustCellWidth() {
                var columnWidth = $header.outerWidth();
                setElementWidth(element, Math.floor(columnWidth));
            }
            var lastWidth;
            function setElementWidth(element, width) {
                if(lastWidth === width){
                    return;
                }
                lastWidth = width;
                element.css({
                    "max-width": width,
                    "width": width,
                    "min-width": width
                });
            }
        }
    }
});
define('grid/grid.row.directive',[
    "./grid.module",
    "var/noop",
    "underscore"
], function(app, noop, _) {
    "use strict";
    app.directive("uiGridRow", gridRowDirective);

    /* @ngInject */
    function gridRowDirective() {
        var directive = {
            restrict: "A",
            require: "^^uiGrid",
            controller: noop,
            controllerAs: "rowCtrl",
            link: postLink
        };
        return directive;

        function postLink($scope, element, attr, grid) {
            // $scope.rowCtrl.__init__($scope.$rowdata, grid);
            element.find(">*").click(function(e) {
                e.stopPropagation();
            });

            var rowRenderers = grid.getRowRenderers();

            _.each(rowRenderers, function(renderer){
                renderer.render({
                    element: element,
                    value: renderer.def,
                    rowIndex: $scope.$index,
                    rowdata: $scope.$rowdata
                });
            });
        }
    }

});
define('grid/grid.directive',[
    "./grid.module",
    "./grid.controller",
    "./grid.head-cell.directive",
    "./grid.header.directive",
    "./grid.row-cell.directive",
    "./grid.row.directive"
], function(app) {
    "use strict";
    app.directive("uiGrid", gridDirective);

    /* @ngInject */
    function gridDirective() {
        var directive = {
            restrict: "A",
            templateUrl: "{themed}/grid/ui-grid.html",
            replace: true,
            scope: false,
            controller: "UIGridController",
            controllerAs: "grid",
            bindToController: {
                "$delegate": "=uiGrid"
            },
            link: gridPostLink
        };
        return directive;

        function gridPostLink(scope, element, attrs, grid) {
            var cancelWatchOption = scope.$watch("grid.$delegate", function(delegate){
                if(delegate){
                    cancelWatchOption();
                    scope.delegate = delegate;
                    grid.activate(delegate);
                }
            });

            scope.$on("$destroy", function() {
                grid.destroy();
            });
        }
    }
});
define('grid/grid-require',[
    "./grid.module",
    "./grid.config",
    "./grid.directive"
], function(app){
    "use strict";
    return app.name;
});
define('themed/themed.module',[
    "angular"
], function(angular){
    "use strict";
    return angular.module("ngUI.theme", []);
});
define('themed/themed.provider',[
    "./themed.module"
], function(app){
    "use strict";

    app.provider("$themed", ThemeProvider);

    /* @ngInject */
    function ThemeProvider(){
        var self = this;

        self.config = config;
        activate();

        function activate(){
            self.config({
                name: "bootstrap",
                validation: {

                }
            });
        }

        self.$get = function(){
            return self;
        };

        function config(options){
            if(!options){
                return;
            }
            self.name = options.name || self.name;
            self.baseUrl = options.baseUrl || "src/partials/" + self.name;
        }
    }
});
define('themed/themed-require',[
    "./themed.module",
    "./themed.provider"
],function(app){
    "use strict";
    return app.name;
});
define('validation/validation.module',[
    "angular",
    "../themed/themed-require"
],function(angular, themedModuleName){
    "use strict";
    return angular.module("ngUI.validation", [themedModuleName]);
});
define('validation/validation.provider',[
    "./validation.module",
    "utils/registable"
], function(app, Registable) {
    "use strict";

    app.provider("$validation", ValidationProvider);

    /* @ngInject */
    function ValidationProvider() {
        var self = this;
        var handlers = new Registable();
        var reader = handlers.reader();
        var writer = handlers.writer();

        var provider = {
            getMessageActionHandler: getMessageActionHandler,
            setErrorClass: function(className){
                self.errorClass = className;
            }
        };
        self.errorClass = "has-error";
        self.handles = writer;
        self.$get = validationMessageProviderGetter;

        function getMessageActionHandler(name){
            return reader.get(name);
        }
        /* @ngInject */
        function validationMessageProviderGetter() {
            return provider;
        }
    }

});
define('validation/validation.config',[
    "./validation.module",
    "./validation.provider"
], function(app) {
    "use strict";

    configValidationMessage.$inject = ["$validationProvider"];
    formDirectiveDecorate.$inject = ["$provide"];
    app.config(formDirectiveDecorate);

    app.config(configValidationMessage);

    /* @ngInject */
    function configValidationMessage($validationProvider) {
        $validationProvider.handles.regist("visibility", function(modelCtrl, formCtrl, messageElement, isInvalid) {
            if (isInvalid) {
                messageElement.addClass("ng-show");
            } else {
                messageElement.removeClass("ng-show");
            }
        });
    }

    /* @ngInject */
    function formDirectiveDecorate($provide) {
        ngModelDecorator.$inject = ["$delegate"];
        submitDecorator.$inject = ["$delegate", "logger", "$parse"];
        $provide.decorator("formDirective", formDecoratorFactory(false));
        $provide.decorator("ngFormDirective", formDecoratorFactory(true));
        $provide.decorator("ngSubmitDirective", submitDecorator);
        $provide.decorator("ngModelDirective", ngModelDecorator);

        /* @ngInject */
        function ngModelDecorator($delegate) {
            var directive = $delegate[0];
            directive.require.push("^?vldFormGroup");
            var ctrlIndex = directive.require.length - 1;
            var lastCompile = directive.compile;

            directive.compile = function customNgModelCompile(element) {
                var link = lastCompile(element);
                var preLink = link.pre;

                link.pre = function(scope, element, attr, ctrls) {
                    var modelCtrl = ctrls[0];
                    var vldFormGroupCtrl = ctrls[ctrlIndex];

                    var result = preLink.apply(this, arguments);

                    if (vldFormGroupCtrl) {
                        vldFormGroupCtrl.$setNgModel(modelCtrl);
                    }
                    return result;
                };
                return link;
            };
            return $delegate;
        }

        function formDecoratorFactory(isNgForm) {
            /* @ngInject */
            formDecorator.$inject = ["$delegate"];
            function formDecorator($delegate) {
                var directive = $delegate[0];

                var FormController = directive.controller;
                FormController.prototype.$setAllDirty = $setAllDirty;

                function $setAllDirty() {
                    var models = getErrorModels(this);
                    models.forEach(function(ngModel) {
                        ngModel.$setDirty();
                    });
                }
                var ngFormCompile = directive.compile;

                directive.compile = function() {
                    var link = ngFormCompile.apply(this, arguments);

                    var ngFormPreLink = link.pre;

                    link.pre = function(scope, element, attr, ctrls) {
                        var formCtrl = ctrls[0];
                        formCtrl.formgroups = {};

                        if (!isNgForm) {
                            formCtrl.$submit = function() {
                                return element.submit();
                            };
                        } else {
                            formCtrl.$submit = function() {
                                return new Error("不支持提交ngForm");
                            };
                        }
                        return ngFormPreLink.apply(this, arguments);
                    };

                    return link;
                };

                return $delegate;
            }
            return formDecorator;
        }
        /* @ngInject */
        function submitDecorator($delegate, logger, $parse) {
            var directive = $delegate[0];

            directive.compile = compile;

            return $delegate;

            function compile($element, attr) {
                return function ngEventHandler(scope, element) {
                    var fn = $parse(attr.ngSubmit);
                    var $formCtrl = element.data("$formController");
                    element.on("submit", function(event) {
                        if (!scope.$$phase) {
                            scope.$apply(callback);
                        } else {
                            scope.$evalAsync(callback);
                        }
                        return false;

                        function callback() {
                            if ($formCtrl.$valid) {
                                fn(scope, {
                                    $event: event
                                });
                            } else {
                                $formCtrl.$setAllDirty();
                                var errorModels = getErrorModels($formCtrl);

                                var modelSelectors = [];
                                errorModels.forEach(function(model) {
                                    modelSelectors.push("[name=" + model.$name + "]");
                                });
                                // 验证不通过的第一个控件获取焦点
                                element.find(modelSelectors.join(", ")).eq(0).focus();
                            }
                        }
                    });
                };
            }
        }

        function getErrorModels($formCtrl) {
            var errors = $formCtrl.$error;
            var errorModels = [];
            for (var k in errors) {
                var models = errors[k];
                for (var i in models) {
                    errorModels.push(models[i]);
                }
            }
            return errorModels;
        }

    }
});
define('validation/vld-form-group.directive',[
    "./validation.module",
    "angular"
], function(app) {
    "use strict";

    app.directive("vldFormGroup", validFormGroupDirective);

    /* @ngInject */
    function validFormGroupDirective() {
        var directive = {
            restrict: "A",
            require: ["vldFormGroup","^^form"],
            template: "<div ng-class=\"{true:vldGroup.errorCls}[(vldGroup.dirty?vldGroup.model.$dirty: true) && vldGroup.model.$invalid]\" ng-transclude>",
            replace: true,
            transclude: true,
            scope: true,
            bindToController: {
                config: "=?vldFormGroup"
            },
            controller: ValidFormGroupController,
            controllerAs: "vldGroup",
            link: {
                pre: preLink
            }
        };
        return directive;

        function preLink(scope, element, attr, ctrls) {
            var vm = ctrls[0];
            var formCtrl = ctrls[1];
            vm.__init__(formCtrl);
        }
    }
    /* @ngInject */
    function ValidFormGroupController() {
        var self = this;
        self.$setNgModel = $setNgModel;
        self.__init__ = __init__;

        function __init__(form) {
            var config = self.config;
            self.form = form;
            self.dirty = config.dirty === undefined ? true : !!config.dirty;
            self.errorCls = config.errorCls || "has-error";
        }
        /**
         * ngModel decorator 会将ngModelController设置进来
         * @param {object} ngModel NgModelController
         */
        function $setNgModel(ngModel) {
            var config = self.config;
            if (config.field && ngModel.$name === self.field) {
                self.model = ngModel;
            } else if (self.model === undefined) {
                self.model = ngModel;
            }
            self.field = ngModel.$name;
            self.form.formgroups[self.field] = self;
        }
    }
});
define('validation/vld-message.directive',[
    "./validation.module",
    "angular",
    "./validation.provider"
], function(app, angular) {
    "use strict";

    validMessageDirective.$inject = ["$validation", "$timeout"];
    app.directive("vldMessage", validMessageDirective);

    /* @ngInject */
    function validMessageDirective($validation, $timeout) {
        var directive = {
            restrict: "A",
            require: ["^^?vldFormGroup", "^^form"],
            scope: {
                conf: "=vldMessage"
            },
            link: postLink
        };
        return directive;

        function postLink(scope, element, attr, ctrls) {
            var formgroup = ctrls[0];
            var form = ctrls[1];

            attr.$addClass("vld_message");

            if(formgroup){
                activate(formgroup);
            }else{
                var times = 10;
                var timmer ;
                timmer = $timeout(function lazyLoad(){
                    var conf = scope.conf;
                    var field = conf.field;
                    if(!field && conf.expr){
                        activate(null);
                        return;
                    }
                    var formgroup = form.formgroups[field];
                    if(!formgroup){
                        var isTimeout = --times < 1;
                        if(isTimeout && conf.expr){
                            return;
                        }else if(isTimeout){
                            throw new Error("验证消息配置错误！找不到formgroup: " + field);
                        }
                        $timeout.cancel(timmer);
                        timmer = $timeout(lazyLoad, 100 / times).then(function(){
                            $timeout.cancel(timmer);
                        });
                    }else{
                        activate(formgroup);
                    }
                });
            }


            function activate(formgroup){
                var conf = scope.conf;
                /**
                 * @type {String} actionName
                 */
                var action,
                /**
                 * @type {Function}
                 */
                actionHandle,
                /**
                 * @type {Array} errorNamesArray
                 */
                errorNames,
                /**
                 * @type {String} expresson
                 */
                expr;

                if(angular.isString(conf) || angular.isArray(conf)){
                    errorNames = normalizeErrorNames(conf);
                }else if(angular.isObject(conf)){
                    action = conf.action || "visibility";
                    if(conf["for"]){
                        errorNames = normalizeErrorNames(conf["for"]);
                    }else{
                        expr = conf.expr;
                    }
                    actionHandle = $validation.getMessageActionHandler(action);
                    if (( !errorNames && !expr ) || !actionHandle) {
                        throw new Error("验证消息配置错误！");
                    }
                }

                if(errorNames){
                    scope.$watch(function() {
                        var model = formgroup.model;

                        if (!model) {
                            return true;
                        }
                        return (formgroup.dirty ? model.$dirty : true) && hasError(model, errorNames);
                    }, function(invalid) {
                        actionHandle.call(null, formgroup.model, form, element, invalid);
                    });
                }else if(expr){
                    var nscope = scope.$new();
                    var formgroups = [];
                    for(var name in form){
                        if(name.indexOf('$') === -1){
                            formgroups.push(form[name]);
                        }
                    }
                    angular.forEach(formgroups, function(formgroup){
                        Object.defineProperty(nscope, formgroup.$name, {
                            get: function(){
                                return formgroup.$modelValue;
                            }
                        });
                    });

                    var formgroupModel = formgroup? formgroup.model:null;
                    nscope.$watch(expr, function(invalid){
                        actionHandle.call(null, formgroupModel, form, element, invalid);
                    });
                }
            }

            function hasError(model, names) {
                for (var i in names) {
                    if (model.$error[names[i]]) {
                        return true;
                    }
                }
                return false;
            }

            function normalizeErrorNames(errors) {
                if (angular.isString(errors)) {
                    return [errors];
                } else if (angular.isArray(errors)) {
                    return errors;
                }
            }
        }
    }

});
define('validation/validation-require',[
    "./validation.module",
    "./validation.config",
    "./vld-form-group.directive",
    "./vld-message.directive"
], function(module){
    "use strict";
    return module.name;
});
define('i18n/i18n.module',[
    "angular"
], function(angular){
    "use strict";
    return angular.module("ngUI.i18n", []);
});
define('i18n/i18n.provider',[
    "angular",
    "./i18n.module",
    "underscore",
    "var/noop"
], function(angular, app, _, noop){
    "use strict";
    app.provider("$i18n", I18nProvider);

    /* @ngInject */
    function I18nProvider(){
        var self = this;
        self.config = config;

        activate();

        function activate(){
            self.messages = {};
            var compilers = {};
            self.obj = {
                getMessage: function(lang, key){
                    var messageMap = self.messages[lang];
                    if(messageMap){
                        return messageMap[key];
                    }
                    return null;
                },
                compiler: function(lang, key){
                    var message = self.obj.getMessage(lang, key);
                    if(!message){
                        return noop;
                    }
                    var templateMap = compilers[lang];
                    if(!templateMap){
                        compilers[lang] = templateMap = {};
                    }
                    var template = templateMap[key];
                    if(!templateMap[key]){
                        templateMap[key] = template = _.template(message);
                    }
                    return function(params){
                        return template(params);
                    };
                }
            };
        }

        self.$get = function(){
            return self.obj;
        };

        function config(options){
            angular.extend(self.messages, options.messages);
            if(angular.isFunction(options.compiler)){
                self.obj.compiler = options.compiler;
            }
        }
    }
});
define('i18n/translate.service',[
    "./i18n.module",
    "./i18n.provider"
], function(app) {
    "use strict";

    TranslateService.$inject = ["$i18n", "$window"];
    app.service("$translate", TranslateService);

    /* @ngInject */
    function TranslateService($i18n, $window) {
        var service = this;

        service.getFirstBrowserLanguage = getFirstBrowserLanguage;
        service.translateTo = translateTo;

        activate();

        function activate() {
            service.lang = $i18n.lang || getFirstBrowserLanguage();
        }

        function getFirstBrowserLanguage() {
            var i,
                language,
                nav = $window.navigator,
                browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'];
            if(angular.isArray(nav.languages)){
                for(i = 0;i<nav.languages.lenth; i++){
                    language = nav.languages[i];
                    if(language && language.length){
                        return language;
                    }
                }
            }
            for(i = 0;i<browserLanguagePropertyKeys.length; i++){
                language = nav[browserLanguagePropertyKeys[i]];
                if(language && language.length){
                    return language;
                }
            }
            return null;
        }

        function translateTo(lang, name, params) {
            return $i18n.compiler(lang, name)(params);
        }
    }
});
define('i18n/translate.filter',[
    "./i18n.module",
    "./translate.service"
], function(app) {
    "use strict";

    translateFilter.$inject = ["$translate"];
    app.filter("translate", translateFilter);

    /* ngInject */
    function translateFilter($translate) {
        return function(key, lang, params) {
            var targetLang, templateParams;
            if (angular.isObject(lang)) {
                templateParams = lang;
                targetLang = $translate.lang;
            } else {
                if (angular.isString(lang)) {
                    targetLang = lang;
                } else {
                    targetLang = $translate.lang;
                }
                templateParams = params;
            }
            return $translate.translateTo(targetLang, key, templateParams);
        };
    }
});
define('i18n/i18n-require',[
    "./i18n.module",
    "./translate.filter"
], function(app){
    "use strict";
    return app.name;
});
define('blocks/log/log.module',[
    "angular"
],function(angular){
    "use strict";
    var moduleName = "ngUI.log";
    try{
        return angular.module(moduleName, []);
    }catch(e){
        return angular.module(moduleName);
    }
});
define('blocks/log/configure',[
    "supports/Class"
], function(Class) {
    "use strict";

    var LEVEL_NO = {
        "error": 80000,
        "warn": 40000,
        "info": 20000,
        "debug": 0,
        "log": NaN
    };

    return Class.singleton({
        name: "LoggerConfigure",
        init: function(self) {
            self.level = LEVEL_NO.debug;
        },
        isLoggable: isLoggable,
        config: config,
        $setLogger: function(self, Logger){
            self.Logger = Logger;
            Logger.$updateLogLevel();
        }
    });

    function config(self, options) {
        if (!options) {
            return;
        }
        var levelName = options.level;
        var levelNo = LEVEL_NO[levelName];
        if (levelNo !== undefined && self.level !== levelNo) {
            self.level = levelNo;
            var Logger = self.Logger;
            if(Logger){
                Logger.$updateLogLevel();
            }
        }
    }

    function isLoggable(self, levelName) {
        var levelNo = LEVEL_NO[levelName];
        return levelNo >= self.level || levelName === "log";
    }
});
define('blocks/log/logger',[
    "supports/Class",
    "./configure"
],function(Class, configure){
    "use strict";

    var console = window.console;
    var requestIdleCallback = window.requestIdleCallback || function(callback){
        var timmerId = window.setTimeout(function(){
            window.clearTimeout(timmerId);
            callback();
        },0);
    };

    var LOG_LEVELS = ["debug", "info", "warn", "error", "log"];

    var Logger = Class.singleton("Logger", {
        $updateLogLevel: onUpdateLogLevel,
        log: wrapper("log"),
        isDebugEnabled: isDebugEnabled,
        isInfoEnabled: isInfoEnabled,
        isWarnEnabled: isWarnEnabled,
        isErrorEnabled: isErrorEnabled
    });
    configure.$setLogger(Logger);
    return Logger;

    function onUpdateLogLevel(){
        for(var i =LOG_LEVELS.length-2;i >= 0; i--){
            var logLevelName = LOG_LEVELS[i];
            Logger[logLevelName] = wrapper(logLevelName);
        }
    }

    function isDebugEnabled(){
        return configure.isLoggable("debug");
    }
    function isInfoEnabled(){
        return configure.isLoggable("debug");
    }
    function isWarnEnabled(){
        return configure.isLoggable("warn");
    }
    function isErrorEnabled(){
        return true;
    }

    function wrapper(levelName){
        if(configure.isLoggable(levelName)){
            return function(self){
                var stack = new Error().stack;
                var _args = arguments;
                requestIdleCallback(function(){
                   var stacks;
                   if(!stack){
                       stacks = ["<unknown>", "<unknown>", "at <unknown>"];
                   }else{
                       stacks = stack.split("\n");
                   }
                   var args = Array.prototype.slice.apply(_args);
                   log.call(self, levelName, stacks, args);
                });
            };
        }else{
            return noop;
        }
    }
    function log(level, stacks, args) {
        var place = stacks[2];
        var file;
        var method;
        var indexOfBracket = place.indexOf("(");
        if(indexOfBracket !== -1){
            file = place.substring(place.indexOf('(') + 1, place.length - 1);
            method = place.substring(place.indexOf('at') + 3, indexOfBracket - 1);
        }else{
            file = place.substring(place.indexOf('at') + 3);
            method = "<anonymous>";
        }

        var loc = "Location: " + method + " (" + file + ")";

        var _logr = console[level] || noop;
        if (!_logr) {
            console.error("错误的日志级别：" + level);
            return;
        }
        args.push("\n"+loc);
        _logr.apply(console, args);
    }
    function noop(){}
});
define('blocks/log/log.provider',[
    "./log.module",
    "./configure"
], function(app, LoggerConfigure){
    "use strict";

    LoggerProvider.prototype = LoggerConfigure;

    app.provider("$logger", LoggerProvider);

    function LoggerProvider(){
        var self = this;
        self.$get = function(){
            return LoggerConfigure;
        };
    }
});
define('blocks/log/log.factory',[
    "./log.module",
    "./log.provider"
], function(app){
    "use strict";
    loggerFactory.$inject = ["$logger"];
    app.factory("logger", loggerFactory);
    /* @ngInject */
    function loggerFactory($logger){
        return $logger.Logger;
    }
});
define('blocks/log/log-require',[
    "./log.module",
    "./logger",
    "./log.provider",
    "./log.factory"
], function(app){
    "use strict";
    return app.name;
});
define('ajax/ajax.module',[
    "angular"
], function(angular){
    "use strict";
    return angular.module("ngUI.ajax", []);
});
define('ajax/ajax.provider',[
    "./ajax.module",
    "underscore",
    "supports/Class"
], function(app, _, Class) {
    "use strict";
    app.provider("$ajax", AjaxProvider);

    var ajaxConfigurer = Class.singleton("AjaxConfigurer", {
        init: function(self) {
            self.$filters = [];
            self.$urlmap = {};
            self.$baseUrl = "";
            self.$handlers = {};
        },
        setBaseUrl: setBaseUrl,
        use: use,
        putUrl: putUrl,
        getUrlConfig: getUrlConfig,
        configHandlers: configHandlers,
        getHandler: getHandler
    });

    AjaxProvider.prototype = ajaxConfigurer;

    function AjaxProvider() {
        ajaxConfigurer.$get = function() {
            return ajaxConfigurer;
        };
        return ajaxConfigurer;
    }
    function setBaseUrl(self, baseUrl){
        self.$baseUrl = baseUrl;
    }
    function use(self) {
        self.$filters =
            _.chain(arguments) //
            .slice(1)
            .map(normalizeFilter)
            .union(self.$filters)
            .sortBy(function(x) {
                return x.priority;
            })
            .value();
    }

    function putUrl(self, name, config) {
        if (_.isString(config)) {
            config = {
                url: config
            };
        }
        if (!_.isObject(config) || !config.url) {
            throw new Error("invalid url config: " + config);
        }
        config.cache = !!config.cache;
        config.method = config.method ? "GET" : config.method;
        config.payload = !!config.payload;
        self.$urlmap[name] = config;
    }

    function getUrlConfig(self, name){
        return self.$urlmap[name];
    }

    function configHandlers(self, handlers){
        if(_.isObject(handlers)){
            self.$handlers = _.extend(self.$handlers, handlers);
        }
    }
    function getHandler(self, name){
        return self.$handlers[name];
    }
    function normalizeFilter(filter) {
        if (_.isFunction(filter)) {
            return {
                priority: 0,
                filter: filter
            };
        } else if (angular.isObject(filter)) {
            var copied = _.clone(filter);
            if (!angular.isNumber(copied.priotity)) {
                copied.priotity = 0;
            }
            return copied;
        }
    }


});
define('ajax/ajax.config',[
    "./ajax.module",
    "./ajax.provider"
], function(app){
    "use strict";
    ajaxConfigurer.$inject = ["$ajaxProvider"];
    app.config(ajaxConfigurer);

    /* @ngInject */
    function ajaxConfigurer($ajaxProvider){
        $ajaxProvider.configHandlers({
            isErrorResponse: isErrorResponse,
            isRedirectResponse: isRedirectResponse,
            getResponseMessage: getResponseMessage
        });

        function getResponseMessage(response){
            var data = response.data;
            return data.msg || data.message;
        }

        function isErrorResponse(response){
            var status = response.status;
            return status >= 400;
        }
        function isRedirectResponse(response){
            return response.status >= 300 && response.status < 400;
        }
    }
});
define('ajax/ajax.filterchain.factory',[
    "./ajax.module",
    "supports/Class"
], function(app, Class) {
    "use strict";
    filterChainFactory.$inject = ["$injector"];
    app.factory("FilterChain", filterChainFactory);
    /* @ngInject */
    function filterChainFactory($injector){
        var FilterChain = Class.create("FilterChain", {
            init: function(self, filters, index) {
                self.$filters = filters;
                self.$index = index;
            },
            next: function(self, request) {
                var filters = self.$filters;
                var filter = filters[self.$index];
                var chain = new FilterChain(filters, self.$index + 1);
                var result = $injector.invoke(filter, filters, {
                    options: request,
                    request: request,
                    chain: chain
                });
                return result;
            },
            retry: function(self, request) {
                return new FilterChain(self.$filters, 0).next(request);
            },
            final: function(self, result) {
                return result;
            }
        });
        return FilterChain;
    }
});
define('ajax/ajax.service',[
    "./ajax.module",
    "angular",
    "underscore",
    "./ajax.filterchain.factory",
    "./ajax.provider"
], function(app, angular, _) {
    "use strict";
    AjaxService.$inject = ["$ajax", "$http", "$q", "FilterChain"];
    app.service("ajax", AjaxService);

    /* @ngInject */
    function AjaxService($ajax, $http, $q, FilterChain) {
        var service = this;
        service.request = request;

        var DEFAULT_PREPARE_FILTERS = [
            function(options, chain) {
                return chain.next(options);
            }
        ];
        var DEFAULT_RESPONSE_FILTERS = [
            function(options, chain) {
                return chain.next(options).then(function(response) {
                    var isErrorResponse = $ajax.getHandler("isErrorResponse");
                    if (isErrorResponse(response)) {
                        return $q.reject(response);
                    } else {
                        return response;
                    }
                });
            }
        ];

        function request(urlname, params, headers) {
            var config = $ajax.getUrlConfig(urlname);

            var url = config.absoluteUrl || mergeUrl($ajax.$baseUrl , config.url);
            var data = _.extend({}, config.params, params);
            var _headers = _.extend({}, config.headers, headers);

            var options = {
                method: config.method || "get",
                url: url,
                headers: _headers
            };

            if (config.payload) {
                options.data = angular.toJson(data);
            } else {
                options.params = data;
            }

            var filters = _.union(DEFAULT_PREPARE_FILTERS, _.map($ajax.$filters, getFilter), DEFAULT_RESPONSE_FILTERS);
            filters.push(doHttp);

            return new FilterChain(filters, 0).next(options);
        }

        function doHttp(options, chain) {
            return chain.final($http(options));
        }
    }

    function getFilter(x) {
        return x.filter;
    }

    function mergeUrl(baseUrl, path) {
        var sepRegex = /\\g/;
        baseUrl = baseUrl.replace(sepRegex, "/");
        path = path.replace(sepRegex, "/");

        var lastSepIndex = baseUrl.lastIndexOf("/");
        if (lastSepIndex !== baseUrl.length - 1) {
            baseUrl = baseUrl + "/";
        }
        var firstSepIndex = path.indexOf("/");
        if (firstSepIndex === 0) {
            path = path.slice(1);
        }
        return (baseUrl + path).replace(/\/+/g, "/");
    }
});
define('ajax/ajax-require',[
    "./ajax.module",
    "./ajax.config",
    "./ajax.service"
], function(app){
    "use strict";
    return app.name;
});
(function(global, factory){
    "use strict";
    if (typeof define === "function" && define.amd){
        define('partials',["angular"], function(angular){
            return factory(global, angular);
        });
    } else if (typeof module === "object" && module.exports){
		var angular = global.angular || require("angular");
		module.exports = factory(global, angular);
	}else{
		factory(global, global.angular);
	}
})(this, function(window, angular){
    "use strict";
    (function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid-accordion.html',
    '<a class="btn btn-xs btn-link btn-block" href="javascript:;" ng-click="accordion.toggleContent()"><i class="glyphicon" ng-class="{true: \'glyphicon-minus\',false: \'glyphicon-plus\'}[accordion.isVisible]"></i></a>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid-footer.html',
    '<div><span class="pull-right"><ul class="pagination pagination-sm grid_pagination"><li title="{{grid.page === 1? \'已经是第一页了\':\'第1页\'}}" ng-class="{\'disabled\': grid.page === 1}" ng-disabled="grid.page === 1" ng-click="grid.page > 1 &amp;&amp; grid.go(1)"><a href="javascript:;"><i class="fa fa-angle-double-left"></i></a></li><li title="{{grid.page === 1? \'已经是第一页了\':\'上一页\'}}" ng-class="{\'disabled\': grid.page === 1}" ng-disabled="grid.page === 1" ng-click="grid.page > 1 &amp;&amp; grid.prevPage(1)"><a href="javascript:;"><i class="fa fa-angle-left"></i></a></li><li title="第{{page}}页" ng-class="{\'active\': page === grid.page}" ng-repeat="page in grid.pageNumbers | limitTo: 7" ng-click="grid.go(page)"><a href="javascript:;" ng-bind="page"></a></li><li title="{{grid.page == grid.pageCount ? \'已经是最后一页\':\'下一页\'}}" ng-class="{\'disabled\':grid.page === grid.pageCount}" ng-disabled="grid.page === grid.pageCount" ng-click="grid.page < grid.pageCount &amp;&amp; grid.nextPage(1)"><a href="javascript:;"><i class="fa fa-angle-right"></i></a></li><li title="{{grid.page == grid.pageCount ? \'已经是最后一页\':\'最后一页\'}}" ng-class="{\'disabled\':grid.page === grid.pageCount}" ng-disabled="grid.page === grid.pageCount" ng-click="grid.page &lt; grid.pageCount &amp;&amp; grid.go(grid.pageCount)"><a href="javascript:;"><i class="fa fa-angle-double-right"></i></a></li></ul><span class="grid_pager_status text-primary">查询出<span ng-bind="grid.total"></span>条记录，每页<select class="form-control grid_change_page_size" ng-model="grid.pageSize" ng-change="grid.changePageSize(grid.pageSize)" ng-options="ps as ps for ps in grid.pageSizes"></select>条，共<span ng-bind="grid.pageCount"></span>页</span></span><div class="clearfix"></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid-head-checkbox.html',
    '<label class="grid_checkbox_label"><input type="checkbox" name="gridSelectAll" ng-model="vm.selected" ng-change="vm.selectStateChange(vm.selected)"></label>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid-row-checkbox.html',
    '<label class="grid_checkbox_label"><input type="checkbox" name="gridSelectOne" ng-model="vm.selected" ng-change="vm.selectStateChange(vm.selected)"></label>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid-row-radio.html',
    '<label class="grid_radio_label"><input type="radio" name="gridSelectOne" ng-model="self.grid.$selectedRow" ng-value="vm.rowdata.$$hashKey" ng-change="vm.selectStateChange(self.grid.$selectedRow)"></label>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid.html',
    '<div><div class="grid_container" ng-class="{\'fix-header\': delegate.fixHeader}"><div class="grid_header" ng-if="delegate.fixHeader"><table class="table table-bordered grid_header_table" ui-grid-header=""><thead class="grid_head"><tr><th ng-repeat="header in delegate.headers" class="grid_head" ui-grid-head-cell=""></th></tr></thead></table></div><div class="grid_body" ui-scrollbar="grid.gridBodyScrollbarOptions" box-height="{{delegate.height}}"><table class="table table-hover table-bordered grid_body_table"><thead ng-if="!delegate.fixHeader" class="grid_head"><tr><th ng-repeat="header in delegate.headers" class="grid_head" ui-grid-head-cell=""></th></tr></thead><tbody><tr ui-grid-row="" ng-repeat="$rowdata in grid.delegate.data" ng-init="$rowIndex = $index" class="grid_row" data-index="{{$index}}"><td ng-repeat="$column in delegate.columns" ui-grid-row-cell=""></td></tr></tbody></table><div class="text-center" ng-if="!delegate.data || delegate.data.length < 1"><h2>没有数据</h2></div></div><div class="grid_toolbar_container"><div ng-include="delegate.footerTemplateUrl"></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/check.html',
    '<div class="ui_check"><replacement></replacement><span class="ins"></span></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/datetimepicker-selector.html',
    '<div class="ui_datetimepicker_selector"><div class="dtp_header"><a class="dtp_toggler dtp_preview" ng-click="picker.previewMonth()"><i class="glyphicon glyphicon-arrow-left"></i></a><div class="dtp_selectors"><div class="dtp_dropdown dtp_month" ng-class="{\'open\': picker.showMonthSelector}"><a class="dtp_dropdown_text" ng-focus="picker.monthSelectorFocus(picker.monthSelectorScrollbar)" ng-blur="picker.showMonthSelector = false" tabindex="-1"><span ng-bind="picker.locale._months[picker.viewValue.month]"></span> <i class="caret"></i></a><div class="dtp_dropdown_content" ui-scrollbar="picker.scrollbarOptions" scrollbar-model="picker.monthSelectorScrollbar" box-height="160px"><ul><li ng-repeat="month in picker.locale._months" ng-mousedown="picker.selectMonth($index)" ng-class="{\'active\': picker.viewValue.month === $index}"><a href="javascript:;" ng-bind="month"></a></li></ul></div></div><div class="dtp_dropdown dtp_year" ng-class="{\'open\': picker.showYearSelector}"><a class="dtp_dropdown_text" ng-focus="picker.yearSelectorFocus(picker.yearSelectorScrollbar)" ng-blur="picker.showYearSelector = false" tabindex="-1"><span ng-bind="picker.viewValue.year"></span><i class="caret"></i></a><div class="dtp_dropdown_content" ui-scrollbar="picker.scrollbarOptions" scrollbar-model="picker.yearSelectorScrollbar" box-height="160px"><ul><li ng-repeat="year in picker.selectionYears" ng-mousedown="picker.selectYear(year)" ng-class="{\'active\':picker.viewValue.year === year}"><a href="javascript:;" ng-bind="year"></a></li></ul></div></div></div><a class="dtp_toggler dtp_next" ng-click="picker.nextMonth()"><i class="glyphicon glyphicon-arrow-right"></i></a></div><div class="dtp_body"><div class="dtp_calendar"><table class="dtp_calendar_table"><thead><tr><th ng-repeat="weekdayMin in picker.locale._weekdaysMin" ng-bind="weekdayMin"></th></tr></thead><tbody ui-mousewheel="picker.switchDateOnMouseWheel($event)"><tr ng-repeat="weekdays in picker.calendar.dateInfo"><td ng-repeat="weekday in weekdays" ng-bind="weekday.dayOfMonth" title="{{weekday.t}}" ng-click="picker.selectDate(weekday)" ng-class="{\'other-month\': !weekday.isCurrentMonth, \'active\': weekday.isCurrentDate}"></td></tr></tbody></table></div><div class="dtp_timepicker"><table><tr><td class="dtp_spinner dtp_hover"><input type="text" class="ui_spinner_md" name="hour" ui-spinner="" ng-model="picker.time.hour" ng-change="picker.changeHour($value, $originValue)" min="-1" max="24" step="1" orientation="vertical"></td><td class="dtp_colon">:</td><td class="dtp_spinner dtp_minute"><input type="text" class="ui_spinner_md" name="minute" ng-model="picker.time.minute" ng-change="picker.changeMinute($value, $originValue)" ui-spinner="" min="-1" max="60" step="1" orientation="vertical"></td><td class="dtp_colon">:</td><td class="dtp_spinner dtp_second"><input type="text" class="ui_spinner_md" name="second" ng-model="picker.time.second" ng-change="picker.changeSeconds($value, $originValue)" ui-spinner="" min="-1" max="60" step="1" orientation="vertical"></td></tr></table></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/datetimepicker.html',
    '<span class="ui_datetimepicker" ng-class="{\'dtp_inline\':vm.inline, \'dtp_hide_datepicker\': !vm.datepicker, \'dtp_hide_timepicker\': !vm.timepicker, \'open\':vm.containerVisible}"><a class="btn btn-sm btn-primary dtp_viewer" ng-click="vm.toggleContainer()"><i class="glyphicon glyphicon-calendar" ng-if="!vm.timepicker"></i> <i class="glyphicon glyphicon-time" ng-if="vm.timepicker"></i> <span ng-bind="vm.ngModel.$modelValue"></span></a><div class="dtp_container"><input type="hidden" ui-datetimepicker-selector="" lang="{{vm.lang}}" ng-model="vm.viewValue"></div></span>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/default-tree-node-tpl.html',
    '<span class="ui_tree_node_icon"><i class="glyphicon" ng-if="nodeCtrl.hasChildren" ng-class="{false: \'glyphicon-plus\', true: \'glyphicon-minus\'}[nodeCtrl.opened]"></i></span><div class="ui_tree_node_content_text" ng-bind="nodeCtrl.data.text"></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/spinner.html',
    '<div class="ui_spinner input-group" ng-class="\'ui_spinner_\' + spinner.orientation"><script type="text/ng-template" id="widget_spinner_partials_decrement_btn"><a class="ui_spinner_btn decrement btn btn-default" ng-disabled="spinner.viewValue == spinner.min" ng-mousedown="spinner.startIncrement(spinner.decrementEvent)"> <i class="glyphicon glyphicon-minus"></i> </a></script><script type="text/ng-template" id="widget_spinner_partials_increment_btn"><a class="ui_spinner_btn increment btn btn-default" ng-disabled="spinner.viewValue == spinner.max" ng-mousedown="spinner.startIncrement(spinner.incrementEvent)"> <i class="glyphicon glyphicon-plus"></i> </a></script><span class="input-group-btn" ng-if="spinner.isHorizontal" ng-include="\'widget_spinner_partials_decrement_btn\'"></span> <span class="input-group-btn" ng-if="spinner.isVertical" ng-include="\'widget_spinner_partials_increment_btn\'"></span> <input type="text" ui-number="" class="ui_spinner_input form-control" ng-model="spinner.viewValue" ng-min="spinner.min" ng-max="spinner.max" step="{{spinner.step}}" number-type="{{spinner.numberType}}" ng-model-options="{updateOn:\'blur\'}" ng-blur="spinner.handleBlurEvent()" ng-keydown="spinner.handleKeydownEvent($event)" ng-keyup="spinner.stopIncrement()"> <span class="input-group-btn" ng-if="spinner.isHorizontal" ng-include="\'widget_spinner_partials_increment_btn\'"></span> <span class="input-group-btn" ng-if="spinner.isVertical" ng-include="\'widget_spinner_partials_decrement_btn\'"></span></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/sub_tree.html',
    '<ul class="ui_tree_node_list"><li ng-repeat="node in nodeCtrl.data.children track by node.id" class="ui_tree_node" ui-tree-node="" node-data="node"></li></ul>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/tree.html',
    '<div class="ui_tree"><ul class="ui_tree_node_list"><li ng-repeat="node in tree.rootTreeNodes track by node.id" ui-tree-node="" node-data="node"></li></ul></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/tree_node.html',
    '<li class="ui_tree_node" ng-class="{\'open\':nodeCtrl.opened}"><a href="javascript:;" class="ui_tree_node_content" ng-include="nodeCtrl.templateUrl" ng-click="nodeCtrl.toggle()" ng-keydown="nodeCtrl.onKeydown($event)"></a><div ng-if="nodeCtrl.hasChildren" class="ui_sub_tree" ng-include="\'{themed}/widget/sub_tree.html\'"></div></li>');
}]);
})();

});
define('app.module',[
    "grid/grid-require",
    "validation/validation-require",
    "themed/themed-require",
    "i18n/i18n-require",
    "blocks/log/log-require",
    "ajax/ajax-require",
    "partials"
], function(uiGridModuleName, themedModuleName, validationModuleName, i18nModuleName, logModuleName, ajaxModuleName){
    "use strict";
    var deps = [
        "ng",
        "ngUI.partials",
        uiGridModuleName,
        validationModuleName,
        themedModuleName,
        i18nModuleName,
        logModuleName,
        ajaxModuleName
    ];
    return angular.module("ngUI", deps);
});

define('init/themed.config',[
    "../app.module",
    "angular",
    "../themed/themed-require",
], function(app, angular){
    "use strict";

    decorateConfigure.$inject = ["$provide", "$themedProvider"];
    app.config(decorateConfigure);

    /* @ngInject */
    function decorateConfigure($provide, $themedProvider){
        decorateTemplateRequest.$inject = ["$delegate"];
        decorateTemplateCahce.$inject = ["$delegate"];
        $provide.decorator("$templateRequest", decorateTemplateRequest);
        $provide.decorator("$templateCache", decorateTemplateCahce);

        /* @ngInject */
        function decorateTemplateRequest($delegate){
            return angular.extend(function(tpl, ignoreRequestError){
                tpl = replace(tpl);
                return $delegate.call(this, tpl, ignoreRequestError);
            }, $delegate);
        }
        /* @ngInject */
        function decorateTemplateCahce($delegate){
            var _get = $delegate.get;
           var _has = $delegate.has;
           var _remove = $delegate.remove;
           var _put = $delegate.put;

           $delegate.get = function(key){
               return _get.call($delegate, replace(key));
           };
           $delegate.has = function(key){
               return _has.call($delegate, replace(key));
           };
           $delegate.put = function(key, value){
               return _put.call($delegate, key, value);
           };
           $delegate.remove = function(key){
               return _remove.call($delegate, replace(key));
           };
           return $delegate;
        }

        function replace(templateUrl){
            if(templateUrl){
                return templateUrl.replace("{themed}", $themedProvider.baseUrl);
            }
            return templateUrl;
        }
    }
});
define('init/logger.config',[
    "app.module"
], function(app){
    "use strict";
    configLogger.$inject = ["$loggerProvider"];
    app.config(configLogger);

    /* @ngInject */
    function configLogger($loggerProvider){
        $loggerProvider.config({
            level: "debug"
        });
    }
});
define('init/app.config',[
    "app.module",
    "./themed.config",
    "./logger.config"
], function(){
    "use strict";
});
define('ng-ui-app',[
    "./app.module",
    "./init/app.config"
], function(app){
    "use strict";
    return app;
});

