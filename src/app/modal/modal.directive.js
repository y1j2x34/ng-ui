define([
    "angular",
    "./modal.module",
    "utils/random.util",
    "./modal-content.directive"
], function(angular, app, RandomUtils) {
    "use strict";
    app.directive("uiModal", modalDirective);

    /* @ngInject */
    function modalDirective() {
        var directive = {
            restrict: "A",
            templateUrl: "{themed}/widget/modal/modal.html",
            replace: true,
            controller: ModalController,
            controllerAs: "$modal",
            bindToController: {
                model: "=uiModal"
            }
        };
        return directive;
    }

    /* @ngInject */
    function ModalController($scope, $document, logger, $timeout) {
        var self = this;
        var destroyTasks = [];
        self.$onInit = init;
        self.$onDestroy = onDestroy;
        self.show = show;
        self.hide = hide;
        self.destroy = destroy;
        self.confirm = confirm;

        function init() {
            var model = self.model;
            self.hidden = !model.visible;

            if (model.keyboard) {
                listenKeyupEvent();
            }
            $scope.$watch(function(){
                return model.visible;
            }, function(visible) {
                if (visible) {
                    self.hidden = false;
                    $timeout(function(){
                        model.trigger("shown", model);
                    });
                } else {
                    $timeout(function() {
                        self.hidden = true;
                    }, 500);
                }
            });
            $scope.$watch(function(){
                return self.hidden;
            }, function(hidden){
                if(hidden){
                    model.trigger("hidden", model);
                }
                if(hidden && model.destroyOnHidden){
                    model.destroy();
                }
            });
            $scope.$watch(function(){
                return model.destroyed;
            }, function(destroyed) {
                if (destroyed) {
                    $scope.$evalAsync(function() {
                        $scope.$destroy();
                    });
                }
            });
        }

        function onDestroy() {
            angular.forEach(destroyTasks, function(handle) {
                try {
                    handle();
                } catch (e) {
                    logger.warn("销毁模态框｛" + self.model.id + "｝异常：", e);
                }
            });
        }

        function listenKeyupEvent() {
            var keyupEventName = RandomUtils.unique("keyup.");
            var jqWin = angular.element(window);
            jqWin.on(keyupEventName, function(event) {
                var model = self.model;
                if (event.key === "Escape") {
                    switch (model.keyboard) {
                        case "hide":
                            model.hide();
                            break;
                        case true:
                        case "destroy":
                            model.destroy();
                            break;
                        default:
                            throw new Error("invalid keyboard value: " + model.keyboard);
                    }
                    $scope.$apply();
                }
                event.preventDefault();
            });
            destroyTasks.push(function() {
                jqWin.off(keyupEventName);
            });
        }

        function hide() {
            self.model.hide();
        }

        function show() {
            self.model.show();
        }

        function destroy() {
            self.model.destroy();
        }
        function confirm(){
            self.model.trigger("confirm", self.model);
        }
    }
});