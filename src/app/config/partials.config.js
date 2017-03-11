define([
    "app.module"
], function(app) {
    "use strict";
    var PARTIALS_URL_PREFFIX = "src/partials";
    app.config(configure);

    /* @ngInject */
    function configure($provide){
        $provide.decorator("$templateRequest", decorateTemplateRequest);
        $provide.decorator("$templateCache", decorateTemplateCache);

        /* @ngInject */
        function decorateTemplateRequest($delegate){
            return function(tpl, ignoreRequestError){
                tpl = makePartialsKey(tpl);
                return $delegate.call(this, tpl, ignoreRequestError);
            };
        }
        /* @ngInject */
        function decorateTemplateCache($delegate){
            var _get = $delegate.get;
            var _has = $delegate.has;
            var _remove = $delegate.remove;
            var _put = $delegate.put;

            $delegate.get = function(key){
                return _get.call($delegate, makePartialsKey(key));
            };
            $delegate.has = function(key){
                return _has.call($delegate, makePartialsKey(key));
            };
            $delegate.put = function(key, value){
                return _put.call($delegate, key, value);
            };
            $delegate.remove = function(key){
                return _remove.call($delegate, makePartialsKey(key));
            };
            return $delegate;
        }
    }
    function makePartialsKey(templateUrl){
        if(templateUrl){
            if(templateUrl.indexOf(PARTIALS_URL_PREFFIX) !== 0){
                var firstChar = templateUrl.charAt(0);
                if(firstChar !== "/" && firstChar !== "\\"){
                    return PARTIALS_URL_PREFFIX  + "/" + templateUrl;
                }
                return PARTIALS_URL_PREFFIX + templateUrl;
            }
        }
        return templateUrl;
    }
});
