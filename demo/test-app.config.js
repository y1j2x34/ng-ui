define([
    "./test-app"
], function(app){
    "use strict";
    app.config(configMessages);

    /* ngInject */
    function configMessages($i18nProvider){
        $i18nProvider.config({
            "messages": {
                "zh-CN": {
                    "xxxx": "翻译成功!!<%= placeholder %>"
                },
                "en": {
                    "xxxx": "translate success  <%= placeholder %>"
                }
            }
        });
    }
});