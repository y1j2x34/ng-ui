define([
    "angular",
    "./modal.module",
    "./modalCache",
    "underscore",
    "./modal.model.factory",
    "./modal.provider"
], function(angular, app, cache, _) {
    "use strict";
    app.service("$modals", ModalService);

    /* @ngInject */
    function PromptModalController($modalModel, $modalData) {
        var self = this;
        var deferer = $modalData.deferer;

        angular.extend(self, $modalData.options);

        self.confirm = function(inputContent) {
            deferer.resolve(inputContent);
            $modalModel.hide();
        };
        self.cancel = function() {
            deferer.reject($modalModel);
            $modalModel.hide();
        };
    }
    /* @ngInject */
    function ConfirmModalController($modalModel, $modalData) {
        var deferer = $modalData.deferer;
        this.cancel = function() {
            $modalModel.hide();
            deferer.reject($modalModel);
        };
        this.confirm = function(){
            $modalModel.hide();
            deferer.resolve($modalModel);
        };
    }

    function AlertModalController($modalModel, $modalData){
        var deferer = $modalData.deferer;
        this.cancel = function() {
            $modalModel.hide();
            deferer.resolve($modalModel);
        };
        this.confirm = function(){
            $modalModel.hide();
            deferer.resolve($modalModel);
        };
    }

    /* @ngInject */
    function ModalService($rootScope, $q, $modal, $location, $rootElement, $compile, $timeout, NgUIModalModel) {
        var service = this;
        var $body = $rootElement.find("body");
        var modalIdQueue = [];

        var currentPageName;

        service.create = createModal;
        service.alert = alert;
        service.confirm = confirm;
        service.prompt = prompt;

        activate();

        function activate() {
            currentPageName = $location.path();
            $rootScope.$watch(function() {
                return $location.path();
            }, onPageSwitch);
        }

        function prompt(options) {
            if (angular.isString(options)) {
                options = {
                    label: options
                };
                var args = arguments;
                if (angular.isString(args[1])) {
                    options.placeholder = args[1];
                }
            }
            options = angular.extend({}, {
                labe: $modal.defaultPromptLabel,
                placeholder: "",
                required: true,
                warning: $modal.defaultPromptWarningMessage
            }, options);

            var defer = $q.defer();

            createModal({
                oneAtTime: true,
                show: true,
                destroyOnHidden: true,
                headerTemplateUrl: $modal.promptHeaderTemplateUrl,
                bodyTemplateUrl: $modal.promptBodyTemplateUrl,
                footerTemplateUrl: $modal.promptFooterTemplateUrl,
                data: {
                    options: options,
                    deferer: defer
                },
                controller: PromptModalController
            });
            return defer.promise;
        }

        function confirm(message) {
            var defaultConfirmMessage = $modal.defaultConfirmMessage;
            var deferer = $q.defer();

            createModal({
                template: message || defaultConfirmMessage,
                controller: ConfirmModalController,
                data:{
                    deferer: deferer
                },
                oneAtTime: true,
                show: true,
                destroyOnHidden: true,
                headerTemplateUrl: $modal.confirmHeaderTemplateUrl,
                footerTemplateUrl: $modal.confirmFooterTemplateUrl
            });
            return deferer.promise;
        }

        function alert(message) {
            var deferer = $q.defer();
            createModal({
                headerTemplateUrl: $modal.alertHeaderTemplateUrl,
                footerTemplateUrl: $modal.alertFooterTemplateUrl,
                bodyTemplateUrl: $modal.alertBodyTemplateUrl,
                controller: AlertModalController,
                data: {
                    deferer: deferer
                },
                template: message,
                show: true,
                oneAtTime: true,
                destroyOnHidden: true
            });
            return deferer.promise;
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
                    if (!_.contains(modal.id)) {
                        modalIdQueue.unshift(modal.id);
                        // var lastIndex = modalIdQueue.length - 1;
                        // modalIdQueue.splice(lastIndex, 1, modal.id, modalIdQueue[lastIndex]);
                    }
                });
                modal.on("hidden", function() {
                    if (modal.destroyOnHidden) {
                        return;
                    }
                    showNextOne();
                });
                modal.on("destroy", function() {
                    showNextOne();
                });
            }

            modal.one("shown", function() {
                $body.append(compiledElement);
            });

            if (modal.showAfterInitialized) {
                modal.show();
            }

            function showNextOne() {
                var currentIndex = _.lastIndexOf(modalIdQueue, modal.id);
                if (currentIndex !== -1) {
                    modalIdQueue.splice(currentIndex, 1);
                    service.currentId = _.last(modalIdQueue);
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