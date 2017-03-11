define([
    "angular",
    "./i18n.module"
], function(angular, app){
    "use strict";
    app.provider("$i18n", I18nProvider);

    /* @ngInject */
    function I18nProvider(){
        var self = this;
        self.config = config;

        activate();

        function activate(){
            self.sources = {};
            self.obj = {
                getSoruce: function(lang, key){
                    var sourceMap = self.sources[lang];
                    if(sourceMap){
                        return sourceMap[key];
                    }
                    return null;
                }
            };
        }

        self.$get = function(){
            return self.obj;
        };

        function config(options){
            angular.extend(self.sources, options.source);
        }
    }
});