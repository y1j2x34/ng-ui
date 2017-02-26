define([], function(){
    "use strict";
    var env = "${environment}";

    if(env.indexOf("${") === 0){
        env = "develop";
    }

    var config = {
        env: env
    };
    return config;
});
