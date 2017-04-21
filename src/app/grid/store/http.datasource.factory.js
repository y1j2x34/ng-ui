define([
    "../grid.module",
    "supports/Class"
],function(app, Class){
    "use strict";

    app.factory("NgUIDatasource", DatasourceFactory);

    /* @ngInject */
    function DatasourceFactory($http){
        return Class.create({
            name: "Datasource",
            init: function init(self, options){
                self.url = options.url;
                self.headers = options.headers;
                self.requestMethod = options.requestMethod || "GET";
                self.options = options;
            },
            load: function load(self, params){
                return $http({
                    url: self.url,
                    params: params,
                    headers: self.headers,
                    method: self.requestMethod
                }).then(function(response){
                    return response.data;
                });
            }
        });
    }

});
