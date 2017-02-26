(function(root, factory) {
    "use strict";
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory();
    } else if (define && define.amd) {
        define(factory);
    } else {
        root.pythonic = factory();
    }
})(this, function() {
    "use strict";

    function pythonic(prototype, func, funcName) {
        var name = funcName || func.name;
        prototype[name] = function() {
            // jshint validthis:false
            var self = this;
            // jshint validthis:true
            var args = [self];
            args.push.apply(args, arguments);
            return func.apply(self, args);
        };
    }
    return pythonic;
});
