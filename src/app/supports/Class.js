(function(globe, factory) {
    "use strict";
    if (typeof module === "object" && module.exports) {
        require("./pythonic");
        require("./ext-array");
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define([
            "./pythonic",
            "./ext-array"
        ], factory);
    } else {
        globe.Class = factory();
    }
})(this, function() {
    // jshint strict:false

    var constructorFactoryCache = {};

    function Class() {}

    Class.create = createClass;
    Class.extend = extend;
    Class.singleton = singleton;

    function singleton(){
        var Cls = createClass.apply(null, arguments);
        return new Cls();
    }

    function createClass(name, definition) {
        var args = arguments;
        switch (args.length) {
            case 0:
                throw new Error("Illegal arguments");
            case 1:
                if (isString(args[0])) {
                    definition = {};
                } else {
                    definition = name;
                    name = definition.name || "<anonymous>";
                }
                break;
            case 2:
                if(isDefined(definition)){
                    definition.name = name;
                }
        }
        if(definition){
            var clsName = definition.name;
            if(! /^\w+$/.test(clsName)){
                throw new Error("Invalid class name: " + clsName);
            }
        }
        return extend(Class, definition);
    }

    function extend(Super, definition) {

        if(arguments.length === 1){
            if(isFunction(Super)){
                definition = {};
            }else{
                definition = Super;
                Super = Class;
            }
        }

        function F() {}
        F.prototype = Super.prototype;

        var propertyNames = Object.getOwnPropertyNames(definition);
        var init = definition.init;
        propertyNames.removeFirst("init");
        if (typeof init !== "function") {
            init = noop;
        }
        var className = definition.name || "Class";
        // 启用python风格
        var isPythonicOn = definition.pythonic !== false;

        if(isPythonicOn){
            init = init.pythonic();
        }

        var clazz = createConstructor(className, init);

        clazz.prototype = new F();
        defineConstant(clazz.prototype, "constructor", clazz);
        defineConstant(clazz.prototype, "uber", Super.prototype);
        defineConstant(clazz.prototype, "clazz", clazz);
        defineConstant(clazz.prototype, "superclass", Super);
        defineConstant(clazz, "superclass", Super);
        defineConstant(clazz, "extend", function(definition) {
            return extend.call(clazz, clazz, definition);
        });
        var $super = function(first){
            var self = this;
            if(arguments.length === 1 && isArgument(first)){
                self.superclass.apply(self, first);
            }else{
                self.superclass.apply(self, arguments);
            }
        };

        defineConstant(clazz.prototype, "$super", $super);

        var statics = definition.statics || {};
        propertyNames.removeFirst("statics");

        copyDescriptors(statics, clazz, Object.getOwnPropertyNames(statics));

        if (isPythonicOn) {
            iteratePropNames(definition, propertyNames, function(origin, name) {
                var value = origin[name];
                if (isFunction(value)) {
                    clazz.prototype[name] = value.pythonic();
                } else {
                    copyDescriptor(origin, clazz.prototype, name);
                }
            });
        } else {
            copyDescriptors(definition, clazz.prototype, propertyNames, function(origin, dest, name) {
                return isFunction(origin[name]);
            });
        }

        propertyNames.removeWhere(function(name) {
            return isFunction(definition[name]);
        });
        return clazz;
    }
    function createConstructor(className, init){
        if(!constructorFactoryCache[className]){
            // jshint evil: true
            constructorFactoryCache[className] = new Function("init", "return function " + className + "(){return init.apply(this, arguments);}");
        }
        return constructorFactoryCache[className](init);
    }
    function defineConstant(target, name, value) {
        Object.defineProperty(target, name, {
            value: value,
            enumerable: false,
            configurable: false,
            writable: false
        });
    }

    function iteratePropNames(origin, propNames, callback) {
        if (!isFunction(callback)) {
            callback = noop;
        }
        if (isString(propNames)) {
            callback(origin, propNames);
        }
        for (var i = 0; i < propNames.length; i++) {
            callback(origin, propNames[i]);
        }
    }

    function copyDescriptors(origin, dest, propNames, filter) {
        if (!isFunction(filter)) {
            filter = acceptAll;
        }
        iteratePropNames(origin, propNames, function(origin, name) {
            if (filter(origin, dest, name)) {
                copyDescriptor(origin, dest, name);
            }
        });
    }

    function copyDescriptor(origin, dest, name) {
        var descriptor = Object.getOwnPropertyDescriptor(origin, name);
        if (isDefined(descriptor)) {
            Object.defineProperty(dest, name, descriptor);
        }
    }

    function isString(value) {
        return typeof value === "string";
    }

    function isFunction(value) {
        return typeof value === "function";
    }

    function isDefined(value) {
        return value !== undefined && value !== null;
    }

    function isArgument(value){
        return value + "" === "[object Arguments]";
    }

    return Class;

    function acceptAll() {
        return true;
    }

    function noop() {}
});
