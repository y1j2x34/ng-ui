define([
    "../grid.module",
    "supports/Class",
    "./datasource",
], function(app, Class){
    "use strict";

    app.factory("JSONDatasource", JSONDatasourceFactory);

    /* @ngInject */
    function JSONDatasourceFactory($q, Datasource){
        return Class.extend(Datasource, {
            name: "JSONDatasource",
            init: function(self, data){
                self.data = data;
            },
            load: function(self){
                var data = self.data || [];
                return $q.when({
                    page: 1,
                    data: data,
                    total: data.length
                });
            }
        });
    }

});
