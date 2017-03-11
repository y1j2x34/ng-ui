define([
    "./widget.module",
    "utils/random.util"
], function(app, RandomUtil) {
    "use strict";
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