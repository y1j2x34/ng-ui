define([
    "./validation.module",
    "angular"
], function(app) {
    "use strict";

    app.directive("vldFormGroup", validFormGroupDirective);

    /* @ngInject */
    function validFormGroupDirective() {
        var directive = {
            restrict: "A",
            require: {
                form: "^^form"
            },
            template: "<div ng-class=\"{true:vldGroup.errorCls}[(vldGroup.dirty?vldGroup.model.$dirty: true) && vldGroup.model.$invalid]\" ng-transclude>",
            replace: true,
            transclude: true,
            scope: true,
            bindToController: {
                config: "=?vldFormGroup"
            },
            controller: ValidFormGroupController,
            controllerAs: "vldGroup"
        };
        return directive;

    }
    /* @ngInject */
    function ValidFormGroupController() {
        var self = this;
        self.$setNgModel = $setNgModel;
        self.$onInit = onInit;

        function onInit() {
            self.config = self.config || {};
            var config = self.config;
            self.dirty = config.dirty === undefined ? true : !!config.dirty;
            self.errorCls = config.errorCls || "has-error";
        }
        /**
         * ngModel decorator 会将ngModelController设置进来
         * @param {Object} ngModel NgModelController
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