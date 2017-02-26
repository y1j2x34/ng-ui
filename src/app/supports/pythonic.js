(function(factory){
    "use strict";
    if(typeof module === "object" && module.exports){
        module.exports = factory();
    }else if(typeof define === "function" && define.amd){
        define( factory);
    }else{
        factory();
    }
})(function(){
    "use strict";
    Function.prototype.pythonic = pythonic;

    function pythonic(){
        // jshint -W040
        var fn = this;
        var decorator = function(){
            var self = this;
            var args = [self];
            args.push.apply(args, arguments);
            return fn.apply(self, args);
        };
        return decorator;
    }

});
