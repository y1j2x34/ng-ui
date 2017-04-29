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
			var args = arguments;
			switch(args.length){
                case 0:
                    return func.call(self, self);
                case 1:
                    return func.call(self, self, args[0]);
                case 2:
                    return func.call(self, self, args[0], args[1]);
                case 3:
                    return func.call(self, self, args[0], args[1], args[2]);
                case 4:
                    return func.call(self, self, args[0], args[1], args[2], args[3]);
                default:
                    var _args = [self];
            		_args.push.apply(args, arguments);
                    return func.apply(self, _args);
			}
        };
    }
    return pythonic;
});
