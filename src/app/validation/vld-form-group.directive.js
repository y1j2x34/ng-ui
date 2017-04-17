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