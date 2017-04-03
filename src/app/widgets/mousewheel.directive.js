define([
    "./widget.module",
    "angular",
    "utils/random.util",
    "jquery-mousewheel"
], function(app, angular, RandomUtil){
    "use strict";
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