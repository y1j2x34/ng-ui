(function(global, factory){
    "use strict";
    if (typeof define === "function" && define.amd){
        define(["angular"], function(angular){
            return factory(global, angular);
        });
    } else if (typeof module === "object" && module.exports){
		var angular = global.angular || require("angular");
		module.exports = factory(global, angular);
	}else{
		factory(global, global.angular);
	}
})(this, function(window, angular){
    "use strict";
    <%= contents %>
});