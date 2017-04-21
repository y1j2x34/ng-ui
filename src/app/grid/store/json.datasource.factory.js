define([
    "../grid.module",
    "supports/Class"
], function(app, Class){
    "use strict";

    app.factory("NgUIJSONDatasource", JSONDatasourceFactory);

    /* @ngInject */
    function JSONDatasourceFactory($q){
        return Class.create({
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
