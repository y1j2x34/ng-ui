define([
    "./i18n.module",
    "./translate.service"
], function(app) {
    "use strict";

    app.filter("translate", translateFilter);

    /* ngInject */
    function translateFilter($translate) {
        return function(key, lang, params) {
            var targetLang, templateParams;
            if (angular.isObject(lang)) {
                templateParams = lang;
                targetLang = $translate.lang;
            } else {
                if (angular.isString(lang)) {
                    targetLang = lang;
                } else {
                    targetLang = $translate.lang;
                }
                templateParams = params;
            }
            return $translate.translateTo(targetLang, key, templateParams);
        };
    }
});