define([
    "./validation.module",
    "angular",
    "./validation.provider"
], function(app, angular) {
    "use strict";

    app.directive("vldMessage", validMessageDirective);

    /* @ngInject */
    function validMessageDirective($validation) {
        var directive = {
            restrict: "A",
            require: "^^vldFormGroup",
            scope: {
                conf: "=vldMessage"
            },
            link: postLink
        };
        return directive;

        function postLink(scope, element, attr, formgroup) {
            element.hide();
            var conf = scope.conf;
            var action = "visibility";
            var actionHandle;
            var errorNames = normalizeErrorNames(conf);

            if (!errorNames && angular.isObject(conf)) {
                action = conf.action || action;
                errorNames = normalizeErrorNames(conf["for"]);
            }
            actionHandle = $validation.getMessageActionHandler(action);
            if (!errorNames || !actionHandle) {
                throw new Error("验证消息配置错误！");
            }

            scope.$watch(function() {
                var model = formgroup.model;

                if (!model) {
                    return true;
                }
                return (formgroup.dirty ? model.$dirty : true) && hasError(model, errorNames);
            }, function(invalid) {
                actionHandle.call(null, formgroup.model, formgroup.form, element, invalid);
            });

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