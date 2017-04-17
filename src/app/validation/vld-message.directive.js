define([
    "./validation.module",
    "angular",
    "./validation.provider"
], function(app, angular) {
    "use strict";

    app.directive("vldMessage", validMessageDirective);

    /* @ngInject */
    function validMessageDirective($validation, $timeout) {
        var directive = {
            restrict: "A",
            require: ["^^?vldFormGroup", "^^form"],
            scope: {
                conf: "=vldMessage"
            },
            link: postLink
        };
        return directive;

        function postLink(scope, element, attr, ctrls) {
            var formgroup = ctrls[0];
            var form = ctrls[1];

            attr.$addClass("vld_message");

            if(formgroup){
                activate(formgroup);
            }else{
                var times = 10;
                var timmer ;
                timmer = $timeout(function lazyLoad(){
                    var conf = scope.conf;
                    var field = conf.field;
                    if(!field && conf.expr){
                        activate(null);
                        return;
                    }
                    var formgroup = form.formgroups[field];
                    if(!formgroup){
                        var isTimeout = --times < 1;
                        if(isTimeout && conf.expr){
                            return;
                        }else if(isTimeout){
                            throw new Error("验证消息配置错误！找不到formgroup: " + field);
                        }
                        $timeout.cancel(timmer);
                        timmer = $timeout(lazyLoad, 100 / times).then(function(){
                            $timeout.cancel(timmer);
                        });
                    }else{
                        activate(formgroup);
                    }
                });
            }


            function activate(formgroup){
                var conf = scope.conf;
                /**
                 * @type {String} actionName
                 */
                var action,
                /**
                 * @type {Function}
                 */
                actionHandle,
                /**
                 * @type {Array} errorNamesArray
                 */
                errorNames,
                /**
                 * @type {String} expresson
                 */
                expr;

                if(angular.isString(conf) || angular.isArray(conf)){
                    errorNames = normalizeErrorNames(conf);
                }else if(angular.isObject(conf)){
                    action = conf.action || "visibility";
                    if(conf["for"]){
                        errorNames = normalizeErrorNames(conf["for"]);
                    }else{
                        expr = conf.expr;
                    }
                    actionHandle = $validation.getMessageActionHandler(action);
                    if (( !errorNames && !expr ) || !actionHandle) {
                        throw new Error("验证消息配置错误！");
                    }
                }

                if(errorNames){
                    scope.$watch(function() {
                        var model = formgroup.model;

                        if (!model) {
                            return true;
                        }
                        return (formgroup.dirty ? model.$dirty : true) && hasError(model, errorNames);
                    }, function(invalid) {
                        actionHandle.call(null, formgroup.model, form, element, invalid);
                    });
                }else if(expr){
                    var nscope = scope.$new();
                    var formgroups = [];
                    for(var name in form){
                        if(name.indexOf('$') === -1){
                            formgroups.push(form[name]);
                        }
                    }
                    angular.forEach(formgroups, function(formgroup){
                        Object.defineProperty(nscope, formgroup.$name, {
                            get: function(){
                                return formgroup.$modelValue;
                            }
                        });
                    });

                    var formgroupModel = formgroup? formgroup.model:null;
                    nscope.$watch(expr, function(invalid){
                        actionHandle.call(null, formgroupModel, form, element, invalid);
                    });
                }
            }

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