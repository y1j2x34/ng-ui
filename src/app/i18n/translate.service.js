define([
    "./i18n.module",
    "./i18n.provider"
], function(app) {
    "use strict";

    app.service("$translate", TranslateService);

    /* @ngInject */
    function TranslateService($i18n, $window) {
        var service = this;

        service.getFirstBrowserLanguage = getFirstBrowserLanguage;
        service.translateTo = translateTo;

        activate();

        function activate() {
            service.lang = $i18n.lang || getFirstBrowserLanguage();
        }

        function getFirstBrowserLanguage() {
            var i,
                language,
                nav = $window.navigator,
                browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'];
            if(angular.isArray(nav.languages)){
                for(i = 0;i<nav.languages.lenth; i++){
                    language = nav.languages[i];
                    if(language && language.length){
                        return language;
                    }
                }
            }
            for(i = 0;i<browserLanguagePropertyKeys.length; i++){
                language = nav[browserLanguagePropertyKeys[i]];
                if(language && language.length){
                    return language;
                }
            }
            return null;
        }

        function translateTo(lang, name, params) {
            return $i18n.compiler(lang, name)(params);
        }
    }
});