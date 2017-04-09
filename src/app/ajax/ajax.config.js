define([
    "./ajax.module",
    "./ajax.provider"
], function(app){
    "use strict";
    app.config(ajaxConfigurer);

    /* @ngInject */
    function ajaxConfigurer($ajaxProvider){
        $ajaxProvider.configHandlers({
            isErrorResponse: isErrorResponse,
            isRedirectResponse: isRedirectResponse,
            getResponseMessage: getResponseMessage
        });

        function getResponseMessage(response){
            var data = response.data;
            return data.msg || data.message;
        }

        function isErrorResponse(response){
            var status = response.status;
            return status >= 400;
        }
        function isRedirectResponse(response){
            return response.status >= 300 && response.status < 400;
        }
    }
});