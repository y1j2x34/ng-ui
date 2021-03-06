define([
    "./widget.module",
    "angular",
    "underscore",
    "utils/random.util",
    "jquery.scrollbar"
], function(app, angular, _, RandomUtil) {
    "use strict";

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
            var lazyUpdateOption = _.debounce(updateOnOptionsChange,1000/25);
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
                    lazyUpdateOption(options);
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