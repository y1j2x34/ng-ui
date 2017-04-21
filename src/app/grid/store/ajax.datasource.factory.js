define([
    "../grid.module",
    "supports/Class"
], function(app, Class){
    "use strict";
    app.factory("NgUIAjaxDataSource", AjaxDataSourceFactory);

    /* @ngInject */
    function AjaxDataSourceFactory(ajax){
        return Class.create({
            name: "AjaxDataSource",
            init: function(self, options){
                if(angular.isString(options)){
                    self.url = options;
                }else if(angular.isObject(options)){
                    self.url = options.url;
                    self.headers = options.headers;
                }
            },
            load: function(self, params){
                return ajax.request(self.url, params, self.headers);
            }
        });
    }
});