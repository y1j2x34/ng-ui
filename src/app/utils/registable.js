define([
    "../supports/Class"
], function(Class) {
    "use strict";

    return Class.create({
        init: function(self){
            self.components = {};
        },
        reader: reader,
        writer: writer
    });

    function writer(self) {
        return {
            regist: function(name, component) {
                return regist(self, name, component);
            }
        };
    }

    function reader(self) {
        return {
            get: function(name) {
                return get(self, name);
            },
            has: function(name) {
                return has(self, name);
            }
        };
    }

    function regist(self, name, component) {
        self.components[name] = component;
    }

    function has(self, name) {
        var comps = self.components;
        return comps[name] !== undefined;
    }

    function get(self, names) {
        var comps = self.components;
        var results = [];
        if (angular.isString(names)) {
            return comps[names];
        }else{
            var args = arguments;
            if(args.length > 2){
                names = _(args).slice(1);
            }
        }
        if(_.isArray(names)){
            results = _.pick(comps, names);
        }

        if (results.length > 1) {
            return _.sortBy(results, function(a){
                return priorityOf(a);
            });
        }
        return results;

        function priorityOf(comp) {
            if (!angular.isObject(comp)) {
                return 0;
            }
            if (angular.isNumber(comp.priority)) {
                return comp.priority;
            }
            return 0;
        }
    }
});
