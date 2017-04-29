define([
    "./validation.module",
    "./validation.provider"
], function(app) {
    "use strict";

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
                    var model = models[i];
                    if(model.$invalid && model.$setDirty){
                        errorModels.push(model);
                    }
                }
            }
            return errorModels;
        }

    }
});