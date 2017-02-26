define([
    "config"
], function(config){
    "use strict";

    var invokr_dev = noop;
    var invokr_test = noop;
    var invokr_multi = noop;

    switch (config.env) {
        case "develop":
            invokr_dev = invoker;
            invokr_multi = multiInvoke_dev;
            break;
        case "product":
            invokr_test = invoker;
            invokr_multi = multiInvoke_product;
            break;
        default:
            throw new Error("环境配置错误： " + JSON.stringify(config));
    }

    return {
        invoke: function(options) {
            if (typeof options === "function") {
                return invoker(options);
            } else {
                return invokr_multi.call(this, options);
            }
        },
        dev: {
            invoke: invokr_dev
        },
        product: {
            invoke: invoker
        }
    };

    function multiInvoke_product(options) {
        return invoker(options.product);
    }

    function multiInvoke_dev(options) {
        return invoker(options.dev || options.product);
    }

    function invoker(callback) {
        if (typeof callback === "function") {
            return callback();
        }
        return callback;
    }

    function noop() {}
});
