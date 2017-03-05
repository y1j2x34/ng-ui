define([
    "../app.module",
    "angular",
    "../themed/themed-require",
], function(app, angular){
    "use strict";

    app.config(decorateConfigure);

    /* @ngInject */
    function decorateConfigure($provide, $themedProvider){
        $provide.decorator("$templateRequest", decorateTemplateRequest);
        $provide.decorator("$templateCache", decorateTemplateCahce);

        /* @ngInject */
        function decorateTemplateRequest($delegate){
            return angular.extend(function(tpl, ignoreRequestError){
                tpl = replace(tpl);
                return $delegate.call(this, tpl, ignoreRequestError);
            }, $delegate);
        }
        /* @ngInject */
        function decorateTemplateCahce($delegate){
            var _get = $delegate.get;
           var _has = $delegate.has;
           var _remove = $delegate.remove;
           var _put = $delegate.put;

           $delegate.get = function(key){
               return _get.call($delegate, replace(key));
           };
           $delegate.has = function(key){
               return _has.call($delegate, replace(key));
           };
           $delegate.put = function(key, value){
               return _put.call($delegate, key, value);
           };
           $delegate.remove = function(key){
               return _remove.call($delegate, replace(key));
           };
           return $delegate;
        }

        function replace(templateUrl){
            if(templateUrl){
                return templateUrl.replace("{themed}", $themedProvider.baseUrl);
            }
            return templateUrl;
        }
    }
});