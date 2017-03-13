define([
    "angular",
    "./i18n.module",
    "underscore",
    "var/noop"
], function(angular, app, _, noop){
    "use strict";
    app.provider("$i18n", I18nProvider);

    /* @ngInject */
    function I18nProvider(){
        var self = this;
        self.config = config;

        activate();

        function activate(){
            self.messages = {};
            var compilers = {};
            self.obj = {
                getMessage: function(lang, key){
                    var messageMap = self.messages[lang];
                    if(messageMap){
                        return messageMap[key];
                    }
                    return null;
                },
                compiler: function(lang, key){
                    var message = self.obj.getMessage(lang, key);
                    if(!message){
                        return noop;
                    }
                    var templateMap = compilers[lang];
                    if(!templateMap){
                        compilers[lang] = templateMap = {};
                    }
                    var template = templateMap[key];
                    if(!templateMap[key]){
                        templateMap[key] = template = _.template(message);
                    }
                    return function(params){
                        return template(params);
                    };
                }
            };
        }

        self.$get = function(){
            return self.obj;
        };

        function config(options){
            angular.extend(self.messages, options.messages);
            if(angular.isFunction(options.compiler)){
                self.obj.compiler = options.compiler;
            }
        }
    }
});