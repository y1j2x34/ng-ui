define([
    "angular",
    "./modal.module",
    "./modalCache",
    "./modal.model.factory",
    "./modal.provider"
], function(angular, app, cache) {
    "use strict";
    app.service("$modals", ModalService);


    /* @ngInject */
    function ModalService($rootScope, $q, $modal, $location, $rootElement, $compile, $timeout, NgUIModalModel) {
        var service = this;
        var $body = $rootElement.find("body");
        var modalIdQueue = [];

        var currentPageName;

        service.create = createModal;
        service.alert = alert;
        service.confirm = confirm;

        activate();

        function activate() {
            currentPageName = $location.path();
            $rootScope.$watch(function() {
                return $location.path();
            }, onPageSwitch);
        }

        function confirm(message) {
            var defaultConfirmMessage = $modal.defaultConfirmMessage;
            var defer = $q.defer();

            var modal = createModal({
                template: message || defaultConfirmMessage,
                controller: function() {
                    this.cancel = function() {
                        modal.hide();
                        defer.reject(modal);
                    };
                },
                oneAtTime: true,
                show: true,
                destroyOnHidden: true,
                headerTemplateUrl: $modal.confirmHeaderTemplateUrl,
                footerTemplateUrl: $modal.confirmFooterTemplateUrl
            });
            modal.on("confirm", function() {
                defer.resolve(modal);
                modal.hide();
            });
            return defer.promise;
        }

        function alert(message) {
            var modal = createModal({
                headerTemplateUrl: $modal.alertHeaderTemplateUrl,
                footerTemplateUrl: $modal.alertFooterTemplateUrl,
                template: message,
                show: true,
                oneAtTime: true,
                destroyOnHidden: true
            });
            var defer = $q.defer();
            modal.on("confirm", function() {
                defer.resolve(modal);
                modal.hide();
            });
            return defer.promise;
        }

        function onPageSwitch(currentPath, lastPath) {
            if (currentPath === lastPath) {
                return;
            }
            currentPageName = currentPath;
            var fromStateModals = cache.get(lastPath);
            if (fromStateModals) {
                for (var modalId in fromStateModals) {
                    var modal = fromStateModals[modalId];
                    if (modal) {
                        modal.destroy();
                    }
                }
            }
        }

        function createModal(options) {
            if (angular.isString(options)) {
                return cache.get(currentPageName, options);
            }

            var modal = new NgUIModalModel(options);

            $timeout(function() {
                initializeModal(modal);
            });
            return modal;
        }

        function initializeModal(modal) {
            var beforeCreatePageName = currentPageName;
            cache.put(beforeCreatePageName, modal.id, modal);

            var directiveElement = angular.element("<div ui-modal='model'>");

            var modalScope = $rootScope.$new();
            modalScope.model = modal;
            modalScope.service = service;

            modalScope.$on("$destroy", onDestroy);

            var compiledElement = $compile(directiveElement)(modalScope);

            if (modal.oneAtTime) {
                modal.on("show", function() {
                    if (modalIdQueue.length === 0) {
                        service.currentId = modal.id;
                    }
                    if(modalIdQueue.indexOf(modal.id) === -1){
                        modalIdQueue.unshift(modal.id);
                    }
                });
                modal.on("hidden", function() {
                    showNextOne();
                });
                modal.on("destroy", function(){
                    showNextOne();
                });
            }

            modal.one("shown", function() {
                $body.append(compiledElement);
            });

            if (modal.showAfterInitialized) {
                modal.show();
            }

            function showNextOne(){
                if(modalIdQueue.indexOf(modal.id) !== -1){
                    modalIdQueue.pop();
                    service.currentId = modalIdQueue[modalIdQueue.length - 1];
                }
            }

            function onDestroy() {
                cache.remove(beforeCreatePageName, modal.id);
                compiledElement.remove();
                modal.trigger("destroy", modal);
            }

            $timeout(function() {
                // 页面快速切换而模态框还未创建完，需要及时释放
                if (beforeCreatePageName !== currentPageName) {
                    modalScope.$destroy();
                }
            });
        }

    }
});