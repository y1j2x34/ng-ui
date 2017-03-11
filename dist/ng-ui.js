define('widgets/widget.module',[
    "angular",
    "jquery"
],function(angular){
    "use strict";
    return angular.module("ngUI.widget", []);
});
(function(factory){
    "use strict";
    if(typeof module === "object" && module.exports){
        module.exports = factory();
    }else if(typeof define === "function" && define.amd){
        define( 'supports/pythonic',factory);
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

(function(factory){
    "use strict";
    if(typeof module === "object" && module.exports){
        require("./pythonic");
        module.exports = factory();
    }else if(typeof define === "function" && define.amd){
        define('supports/ext-array',[
            "./pythonic"
        ], factory);
    }else{
        factory();
    }
})(function(){
    "use strict";
    Array.prototype.remove = remove.pythonic();
    Array.prototype.removeFirst = removeFirst.pythonic();
    Array.prototype.removeWhere = removeWhere.pythonic();

    function remove(self, element){
        var removed = [];
        var lastIndex = 0;

        while(self.length > 0){
            var index = self.indexOf(element, lastIndex);
            if(index === -1){
                return removed;
            }else{
                lastIndex = index;
                var curRemoved = self.splice(index, 1);
                removed.push.apply(removed, curRemoved);
            }
        }
        return removed;
    }

    function removeFirst(self, element){
        var index = self.indexOf(element);
        if(index !== -1){
            return self.splice(index, 1);
        }else{
            return [];
        }
    }
    function removeWhere(self, acceptFilter){
        if(!acceptFilter){
            return [];
        }
        var removed = [];
        for(var i =0;i<self.length;i++){
            var toRemove = acceptFilter(self[i]);
            if(toRemove === "break"){
                break;
            }
            if(toRemove){
                removed.push(self[i]);
                self.splice(i, 1);
            }
        }
        return removed;
    }

});

(function(globe, factory) {
    "use strict";
    if (typeof module === "object" && module.exports) {
        require("./pythonic");
        require("./ext-array");
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define('supports/Class',[
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

define('utils/random.util',[
    "../supports/Class"
],function(Class){
    "use strict";

    var CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var HEX_CHARACTERS = "0123456789abcdefg";
    var counter = new Date().getTime();
    return Class.create({
        statics: {
            randomString: function(size){
                return randomString(size, CHARACTERS);
            },
            unique: function(prefix){
                return prefix + (counter++).toString(16);
            },
            randomHex: randomHex
        }
    });

    function randomHex(size){
        return randomString(size, HEX_CHARACTERS);
    }

    function randomString(size, optionsText){
        if(typeof size !== "number" || size < 1){
            size = 8;
        }
        var text = "";

        while(text.length < size){
            text += optionsText[Math.floor(Math.random() * optionsText.length)];
        }

        return text;
    }
});

define('widgets/scrollbar.directive',[
    "./widget.module",
    "angular",
    "utils/random.util",
    "jquery.scrollbar"
], function(app, angular, RandomUtil) {
    "use strict";

    scrollbarDirective.$inject = ["$timeout", "$window"];
    app.directive("uiScrollbar", scrollbarDirective);

    /* @ngInject */
    function scrollbarDirective($timeout, $window) {

        var DEFAULT_OPTIONS = {
            scrollInertia: 0,
            live: true,
            mouseWheelPixels: 140, // 滚动单位
            mouseWheel: true,
            updateOnContentResize: true
        };

        var directive = {
            strict: "AE",
            priority: 500,
            scope: {
                bottomHeight: "@?",
                boxHeight: "@?",
                theme: "@?",
                options: "=?uiScrollbar",
                model: "=?scrollbarModel"
            },
            controller: angular.noop,
            controllerAs: "scrollbar",
            link: {
                pre: preLink
            }
        };

        return directive;

        function preLink($scope, element, attrs) {
            var jqWindow = angular.element($window);

            $scope.model = {
                scrollTo: scrollTo
            };

            attrs.$observe("bottomHeight", fitBotomHeight);
            attrs.$observe("boxHeight", fitBoxHeight);

            var windowResizeEventId = "resize." + RandomUtil.randomString(6);

            $scope.$watch("options", updateOnOptionsChange);
            $scope.$watch(function() {
                return element.is(":visible") + "_" + element.height();
            }, fitHeight, true);
            jqWindow.on(windowResizeEventId, fitHeight);

            $scope.$on("$destroy", onScopeDestroy);

            function scrollTo(position) {
                element.mCustomScrollbar("scrollTo", position);
            }

            function updateOnOptionsChange(options) {
                if (typeof options === "object") {
                    element.mCustomScrollbar(angular.extend({}, DEFAULT_OPTIONS, options));
                }
            }

            function onScopeDestroy() {
                jqWindow.off(windowResizeEventId);
                element.mCustomScrollbar("destroy");
            }
            return $timeout(function() {
                jqWindow.trigger("resize");
            });

            function fitHeight() {
                if (attrs.bottomHeight) {
                    fitBotomHeight(attrs.bottomHeight);
                }
                if (attrs.boxHeight) {
                    fitBoxHeight(attrs.boxHeight);
                }
            }

            function fitBotomHeight(value) {
                var top = element.offset().top;
                var screenHeight = jqWindow.height();
                var height = Math.max(0, screenHeight - top);

                if (isPercent(value)) {
                    height = height * parseFloat(value) / 100;
                } else if (isNumeric(value)) {
                    height = Math.max(0, height - Number(value));
                } else {
                    try {
                        var $elm = angular.element(value);
                        if ($elm.length > 0) {
                            height = Math.max(0, height - $elm.outerHeight());
                        }
                    } catch (e) {
                        return;
                    }
                }
                if (isNaN(height) || typeof height !== "number") {
                    return;
                }
                element.css({
                    "max-height": height,
                    "height": height,
                    "min-height": height
                });
            }

            function fitBoxHeight(value) {
                var height;
                if (isNumeric(value)) {
                    height = Number(value);
                } else if (isPercent(value)) {
                    var top = element.offset().top;
                    var screenHeight = jqWindow.height();
                    height = Math.max(10, screenHeight - top) * parseFloat(value) / 100;
                } else if (value === "parent") {
                    height = element.parent().height();
                } else {
                    try {
                        height = angular.element(height).outerHeight();
                    } catch (e) {}
                }
                if (isNaN(height) || typeof height !== "number") {
                    return;
                }
                element.css({
                    "max-height": height,
                    "height": height
                });
            }
        }

        function isPercent(text) {
            return ('string' === typeof text) && text.match(/\d+(\.\d+)?\%/g);
        }

        function isNumeric(text) {
            return ("string" === typeof text) && text.match(/\d+(\.\d+)?.*/);
        }
    }
});
define('widgets/widgets-require',[
    "./widget.module",
    "./scrollbar.directive"
], function(app){
    "use strict";
    return app.name;
});
define('grid/grid.module',[
    "angular",
    "widgets/widgets-require",
    "angular-sanitize",
    "underscore",
    "jquery"
], function(angular, widgetModuleName){
    "use strict";
    return angular.module("ngUI.grid", [
        "ng",
        "ngSanitize",
        widgetModuleName
    ]);
});
define('var/noop',[],function(){
    "use strict";
    return function noop(){};
});
define('grid/renderers/value.renderer',[
    "jquery",
    "var/noop"
], function($, noop) {
    "use strict";
    return {
        type: "cell",
        name: "value",
        priority: 0,
        header: noop,
        row: function(options) {
            var element = options.element;
            element.addClass("grid_value");
            var $value = $("<span>");
            $value.attr("ng-bind", "$rowdata[$column.def.field]");
            element.append($value);
        }
    };
});
define('grid/renderers/title.renderer',[
    "jquery",
    "var/noop"
], function($, noop){
    "use strict";
    return {
        type: "cell",
        name:"title",
        priority: 0,
        header: function(options){
            var $cont = $("<span>");
            $cont.addClass("grid_title");
            $cont.text(options.value);
            options.element.prepend($cont);
        },
        row: noop
    };
});
define('grid/renderers/grid.accordion.directive',[
    "../grid.module",
    "utils/random.util",
    "underscore"
], function(app, RandomUtil, _){
    "use strict";
    AccordionController.$inject = ["$scope", "$compile"];
    app.directive("uiGridAccordion", accordionDirective);

    /* @ngInject */
    function accordionDirective(){
        var directive = {
            restrict: "A",
            require: ["^^uiGrid", "uiGridAccordion"],
            templateUrl: "{themed}/grid/ui-grid-accordion.html",
            replace: true,
            controller: AccordionController,
            controllerAs: "accordion",
            link: accordionPostLink
        };
        return directive;

        function accordionPostLink(scope, element, attrs, ctrls){
            var vm = ctrls[1];
            var grid = ctrls[0];
            var $row = element.closest("tr.grid_row");

            var $contentRow = angular.element("<tr>");
            var $contentCell = angular.element("<td>");

            var colspan = $row.find(">td").length;
            $contentCell.attr("colspan", colspan);

            $contentRow.append($contentCell);
            var columnDef = scope.$column.def;
            if(!columnDef.templateUrl){
                throw new Error("'templateUrl' 不能为空!");
            }
            vm.__init__(grid, $row, $contentRow, $contentCell, columnDef);
            scope.$on("$destroy", vm.__destroy__);
        }
    }
    /* @ngInject */
    function AccordionController($scope, $compile){
        var self = this;
        var first = true;
        var compId = RandomUtil.unique("grid-accordion-");

        self.toggleContent = toggleContent;
        self.__destroy__ = __destroy__;
        self.__init__ = __init__;

        function __init__(grid, $row, $contentRow, $contentCell, def){
            self.grid = grid;
            self.$myRow = $row;
            self.$contentRow = $contentRow;
            self.$contentCell = $contentCell;
            self.columnDef = def;

            self.isVisible = false;
            self.templateUrl = def.templateUrl;
            self.oneAtTime = def.oneAtTime !== false;
            if(self.oneAtTime){
                if(!grid.accordions){
                    grid.accordions = {};
                }
                grid.accordions[compId] = self;
            }
        }

        function toggleContent(){
            if(first){
                initialContent();
            }
            first = false;
            self.isVisible = !self.isVisible;
            if(self.oneAtTime){
                _.each(self.grid.accordions, function(accordion){
                    if(accordion !== self){
                        accordion.isVisible = false;
                    }
                });
            }
        }

        function initialContent(){
            var contentScope = $scope.$new();
            self.$contentRow.attr("ng-show", "accordion.isVisible");
            self.$contentCell.attr("ng-include", "accordion.templateUrl");

            self.$myRow.after(self.$contentRow);
            $compile(self.$contentRow)(contentScope);
        }

        function __destroy__(){
            self.$contentRow.remove();
            if(self.oneAtTime){
                delete self.grid.accordions[compId];
            }
        }
    }
});
define('grid/renderers/accordion.renderer',[
    "./grid.accordion.directive",
], function(){
    "use strict";

    return {
        type: "ext",
        name: "accordion",
        header: function(){},
        row: function(options){
            options.element.append("<a ui-grid-accordion>");
        }
    };
});
define('grid/renderers/align.renderer',[],function() {
    "use strict";
    return {
        type: "cell",
        name: "align",
        priority: 0,
        init: function(columnDef) {
            columnDef.align = normalizeAlignValue(columnDef.align);
        },
        header: function(options) {
            options.element.addClass("text-"+options.value);
        },
        row: function(options) {
            var td = options.element,
            alignment = options.value;
            td.addClass("text-"+alignment);
        }
    };

    function normalizeAlignValue(value) {
        if (typeof value === "string") {
            value = value.toLowerCase();
        }else if(typeof value === "object"){
            value = value.value;
        }
        switch (value) {
            case "left":
            case "right":
            case "center":
                return value;
            default:
                return "left";
        }
    }
});
define('grid/renderers/stripe.renderer',[],function(){
    "use strict";
    return {
        type: "row",
        name: "stripe",
        init: function(value){
            if(typeof value === "object"){
                value.oddClass = value.oddClass || "odd";
                value.evenClass = value.evenClass || "even";
            }else{
                return {
                    oddClass: "odd",
                    evenClass: "even"
                };
            }
        },
        render: function(options){
            var rowIndex = options.rowIndex;
            var element = options.element;
            var value = options.value;
            var oddClass = value.oddClass;
            var evenClass = value.evenClass;

            element.removeClass(oddClass, evenClass);

            if((rowIndex & 1) === 0){
                element.addClass(evenClass);
            }else{
                element.addClass(oddClass);
            }
        }
    };
});
define('grid/renderers/all',[
    "./value.renderer",
    "./title.renderer",
    "./accordion.renderer",
    "./align.renderer",
    "./stripe.renderer"
], function(){
    "use strict";
    return Array.prototype.slice.call(arguments);
});
define('utils/registable',[
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

define('grid/grid.provider',[
    "./grid.module",
    "underscore",
    "utils/registable",
    "supports/Class"
], function(app, _, Registable, Class) {
    "use strict";

    app.provider("$grid", GridProvider);

    /*  @ngInject */
    function GridProvider() {
        var renderers = new Registable();

        var renderersWriter = renderers.writer();

        var $grid = Class.singleton({
            init: function(self) {
                self.renderersReader = renderers.reader();
            },
            getRowRenderer: function(self, name) {
                var rendererName = rowName(name);
                return self.renderersReader.get(rendererName);
            },
            hasRowRenderer: function(self, name) {
                var rendererName = rowName(name);
                return self.renderersReader.has(rendererName);
            },
            getCellRenderer: function(self, name, isExtention){
                var registName = registNameOf(isExtention ? "ext": "cell", name);
                return self.renderersReader.get(registName);

            },
            hasCellRenderer: function(self, name, isExtention) {
                var registName = registNameOf(isExtention ? "ext": "cell", name);
                return self.renderersReader.has(registName);
            }
        });

        this.registRenderer = registRenderer;

        function registRenderer(name, renderer, type) {
            var registName = registNameOf(type, name);
            renderersWriter.regist(registName, renderer);
        }

        this.$get = function() {
            return $grid;
        };

        function registNameOf(type, name){
            switch(type){
                case "cell":
                return cellName(name);
                case "row":
                return rowName(name);
                case "ext":
                return extName(name);
                default:
                throw new Error("invalid regist type: " + type);
            }
        }

        function cellName(name) {
            return "cell." + name;
        }

        function extName(name) {
            return "ext." + name;
        }

        function rowName(name) {
            return "row." + name;
        }
    }
});
define('grid/grid.config',[
    "./grid.module",
    "./renderers/all",
    "./grid.provider",
], function(app, allRenderers){
    "use strict";

    configure.$inject = ["$gridProvider"];
    app.config(configure);

    /* @ngInject */
    function configure($gridProvider){
        _.each(allRenderers, function(renderer){
            $gridProvider.registRenderer(renderer.name, renderer, renderer.type || "cell");
        });
    }
});
define('event/subject',[
    "supports/Class"
],function(Class) {
    "use strict";

    return Class.create("Subject", {
        init: function(self){
            self.observers = {};
        },
        //注册事件
        on: on,
        //只执行一次
        one: one,
        //事件触发
        trigger: trigger,
        // 取消事件
        off: off
    });

    function Observer(source, name, data, callback, times) {
        this.source = source;
        this.name = name;
        this.data = data;
        this.callback = callback;
        this.times = times || Infinity;
    }

    function attach(self, names, callback, data, times) {
        if (names === undefined) {
            names = undefined + "";
        }

        var nameParts = names.split(",");
        for(var i=0;i<nameParts.length;i++){
            attachOne(nameParts[i].trim());
        }

        function attachOne(name){
            var parts = name.split(".");
            name = parts[0];
            var cls = parts[1];
            var obs = self.observers[name];
            if (!obs) {
                obs = {};
                self.observers[name] = obs;
            }
            var ob = obs[cls];
            if (!ob) {
                ob = [];
                obs[cls] = ob;
            }
            ob.push(new Observer(self, name, data, callback, times));
        }
    }


    function on(self, name, dataOrCallback, callback) {
        var data;
        if (typeof dataOrCallback === "function") {
            data = callback;
            callback = dataOrCallback;
        } else if (typeof callback === "function") {
            data = dataOrCallback;
        }
        attach(self, name, callback, data);
    }

    function one(self, name, dataOrCallback, callback) {
        var data;
        if (typeof dataOrCallback === "function") {
            data = callback;
            callback = dataOrCallback;
        } else if (typeof callback === "function") {
            data = dataOrCallback;
        }
        attach(self, name, callback, data, 1);
    }

    function trigger(self, names) {
        if (names === undefined) {
            names = undefined + "";
        }
        var nameParts = names.split(",");

        var args = Array.prototype.slice.call(arguments, 2);

        for(var i = 0; i < nameParts.length; i++){
            triggerOneName(nameParts[i].trim());
        }

        function triggerOneName(name){
            var parts = name.split(".");
            name = parts[0];
            var cls = parts[1];
            var observersOfName = self.observers[name];

            if (!observersOfName) {
                return false;
            }

            if (cls) {
                triggerByCls(self, observersOfName[cls], args);
            } else {
                triggerAll(self, observersOfName, args);
            }
        }
    }

    function triggerAll(self, observersOfName, args) {
        var has = false;
        for (var k in observersOfName) {
            has = true;
            var observers = observersOfName[k];
            if (observers && observers.length > 0) {
                for (var i = 0; i < observers.length; i++) {
                    var observer = observers[i];
                    callObserver(self, observer, args);
                }
            }
        }
        return has;
    }

    function triggerByCls(self, observers, args) {
        if (observers && observers.length > 0) {
            for (var i = 0; i < observers.length; i++) {
                var observer = observers[i];
                callObserver(self, observer, args);
            }
            return true;
        }
    }

    function off(self, names, func) {
        if (names === "*") {
            self.observers = {};
            return;
        }

        if (names === undefined) {
            names = undefined + "";
        }

        var nameParts = names.split(",");

        for(var i = 0; i < nameParts.length; i++){
            dettachOne(self, nameParts[i].trim(), func);
        }

        function dettachOne(self, name, func){
            var parts = name.split(".");
            name = parts[0];
            var cls = parts[1];
            var observersOfName = self.observers[name];
            if (!observersOfName) {
                return false;
            }
            if (cls) {
                observersOfName[cls] = undefined;
                delete observersOfName[cls];
            } else if ('function' === typeof func) {
                for (var k in observersOfName) {
                    var observerItems = observersOfName[k];
                    for (var i = 0; i > -1 && i < observerItems.length; i++) {
                        var observerItem = observerItems[i];
                        if (observerItem && observerItem.callback === func) {
                            observerItems.splice(i, 1);
                            i--;
                        }
                    }
                }
            } else {
                self.observers[name] = {};
            }
        }
    }

    function callObserver(self, observer, args) {
        if (observer !== undefined) {
            try {
                var callArgs = [observer];
                callArgs.push.apply(callArgs, args);
                observer.callback.apply(observer.source, callArgs);
            } catch (e) {
                throw e;
            } finally {
                observer.times -= 1;
            }
        }
    }
});

define('grid/store/datasource',[
    "../grid.module",
    "supports/Class"
],function(app, Class){
    "use strict";

    DatasourceFactory.$inject = ["$http"];
    app.factory("NgUIDatasource", DatasourceFactory);

    /* @ngInject */
    function DatasourceFactory($http){
        return Class.create({
            name: "Datasource",
            init: function init(self, options){
                self.url = options.url;
                self.headers = options.headers;
                self.requestMethod = options.requestMethod || "GET";
                self.options = options;
            },
            load: function load(self, params){
                return $http({
                    url: self.url,
                    params: params,
                    headers: self.headers,
                    method: self.requestMethod
                }).then(function(response){
                    return response.data;
                });
            }
        });
    }

});

define('grid/store/jsonDatasource',[
    "../grid.module",
    "supports/Class",
    "./datasource",
], function(app, Class){
    "use strict";

    JSONDatasourceFactory.$inject = ["$q", "NgUIDatasource"];
    app.factory("NgUIJSONDatasource", JSONDatasourceFactory);

    /* @ngInject */
    function JSONDatasourceFactory($q, NgUIDatasource){
        return Class.extend(NgUIDatasource, {
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

define('grid/store/store.provider',[
    "../grid.module",
], function(app) {
    "use strict";

    app.provider("$store", StoreProvider);

    function StoreProvider() {
        var self = this;

        var config = {};

        self.$get = function() {
            return config;
        };
    }
});

define('grid/store/store.factory',[
    "../grid.module",
    "underscore",
    "supports/Class",
    "event/subject",
    "./datasource",
    "./jsonDatasource",
    "./store.provider"
], function(app, _, Class, Subject) {
    "use strict";

    StoreFactory.$inject = ["$q"];
    app.factory("UIGridStore", StoreFactory);

    var BEFORE_LOAD_EVENT = "beforeLoad";
    var LOAD_SUCCESS_EVENT = "loaded";
    var LOAD_ERROR_EVENT = "loadError";
    var LOAD_COMPLETE_EVENT = "complete";

    var DEFAULT_OPTIONS = {
        autoLoad: false,
        keepSelect: true // 重新加载后保持原来的选择状态， 对于使用序号做标识的情况无效
    };
    /* @ngInject */
    function StoreFactory($q) {
        return Class.extend(Subject, {
            name: "Store",
            statics: {
                BEFORE_LOAD_EVENT: BEFORE_LOAD_EVENT,
                LOAD_SUCCESS_EVENT: LOAD_SUCCESS_EVENT,
                LOAD_ERROR_EVENT: LOAD_ERROR_EVENT,
                LOAD_COMPLETE_EVENT: LOAD_COMPLETE_EVENT
            },
            init: init,
            setParams: setParams,
            reload: reload,
            load: load,
            setCollation: setCollation,
            unsetCollation: unsetCollation,
            fetchLoaded: fetchLoaded
        });

        /**
         * 构造器
         * @param  {Object} options store配置
         */
        function init(self, options) {
            self.$super();
            options = _.extend({}, DEFAULT_OPTIONS, options);

            self.params = _.extend({}, options.params);
            self.datasource = options.datasource;
            self.collation = {};

            self.dataHandlers = [];

            _.each(options.events, function(handler, eventName) {
                if (_.isFunction(handler)) {
                    self.on(eventName, handler);
                }
            });

            self.$$loadCount = 0;
        }
        /**
         * 设置参数
         * @param {String|Object} name  参数名称或参数对象
         * @param {Object} value 参数值, 仅name做string使用时有效
         */
        function setParams(self, name, value) {
            var newParams;
            if (_.isObject(name)) {
                newParams = name;
            } else {
                newParams = {};
                newParams[name] = value;
            }
            self.params = _.extend({}, self.params, newParams);
        }
        /**
         * 使用旧参数重新加载数据
         */
        function reload(self) {
            if (!_.isUndefined(self.lastParams)) {
                return self.load(self.lastParams);
            }
        }
        function fetchLoaded(self){
            return self.$$lastLoadPromise || $q.reject("unloaded");
        }
        /**
         * 加载数据
         * @param  {Object} params 加载参数
         * @return {promise}
         */
        function load(self, params) {
            var remoteOrder = {};
            var localOrders = [];

            _.each(self.collation, function(field, def) {
                if (def.remote) {
                    remoteOrder[field] = def.remote;
                } else if (def.local) {
                    localOrders.push(def.local);
                }
            });

            params = _.extend({}, self.params, {
                order: remoteOrder
            }, params);

            self.trigger(BEFORE_LOAD_EVENT, params);

            self.lastParams = params;

            var promise = self.datasource
                .load(params, self)
                .then(loadSuccess, loadError);
            self.$$lastLoadPromise = promise;
            return promise;

            function loadSuccess(result) {
                var lastLoadPromise = self.$$lastLoadPromise;
                if(lastLoadPromise !== undefined && lastLoadPromise !== promise){
                    return lastLoadPromise;
                }

                var data = invokeDataHandles(self, result.data);

                self.trigger(LOAD_SUCCESS_EVENT, result, data, params);
                self.trigger(LOAD_COMPLETE_EVENT, result, data, params);
                return {
                    result: result,
                    data: data,
                    params: params
                };
            }
            function loadError(reason) {
                var lastLoadPromise = self.$$lastLoadPromise;
                if(lastLoadPromise !== undefined && lastLoadPromise !== promise){
                    return lastLoadPromise;
                }
                self.trigger(self.clazz.LOAD_ERROR_EVENT, reason);
                self.trigger(self.clazz.LOAD_COMPLETE_EVENT, reason);
                return $q.reject(reason, params);
            }
        }

        function invokeDataHandles(self, data) {
            _.each(self.dataHandlers, function(handle) {
                var result = handle.call(self, data);
                if (_.isArray(result)) {
                    data = result;
                }
            });
            return data;
        }

        function setCollation(self, field, direction, priority, remote) {

            var collation = self.collation[field] || {};

            var config = {
                direction: direction,
                priority: priority
            };
            if (remote) {
                collation.locale = undefined;
                collation.remote = config;
            } else {
                collation.locale = config;
                collation.remote = undefined;
            }

            self.collation[field] = collation;
        }

        function unsetCollation(self, field) {
            self.collation[field] = undefined;
        }
    }

});

define('grid/grid.factory',[
    "./grid.module",
    "underscore",
    "utils/random.util",
    "supports/Class",
    "event/subject",
    "var/noop",
    "./store/store.factory"
], function(app, _, RandomUtil, Class, Subject, noop) {
    "use strict";

    gridFactory.$inject = ["$grid", "$q", "UIGridStore"];
    app.factory("UIGrid", gridFactory);

    /* @ngInject */
    function gridFactory($grid, $q, UIGridStore) {
        var CONSTT_VALUE = "";
        var INDEX_KEY = "$index";
        var BEFORE_LOAD_EVENT = UIGridStore.BEFORE_LOAD_EVENT + "." + RandomUtil.randomString();
        var LOAD_SUCCESS_EVENT = UIGridStore.LOAD_SUCCESS_EVENT + "." + RandomUtil.randomString();
        var LOAD_ERROR_EVENT = UIGridStore.LOAD_ERROR_EVENT + "." + RandomUtil.randomString();
        var LOAD_COMPLETE_EVENT = UIGridStore.LOAD_COMPLETE_EVENT + "." + RandomUtil.randomString();


        var DEFAULT_OPTIONS = {
            key: INDEX_KEY, // $index 表示使用序号做标识符
            page: 1,
            autoLoad: false,
            pageSize: 10,
            keepSelect: true // 重新加载后保持原来的选择状态， 对于使用序号做标识的情况无效
        };

        return Class.extend(Subject, {
            name: "Grid",
            statics: {
                BEFORE_LOAD_EVENT: BEFORE_LOAD_EVENT,
                LOAD_SUCCESS_EVENT: LOAD_SUCCESS_EVENT,
                LOAD_ERROR_EVENT: LOAD_ERROR_EVENT,
                LOAD_COMPLETE_EVENT: LOAD_COMPLETE_EVENT
            },
            init: init,
            goPage: goPage,
            prevPage: prevPage,
            nextPage: nextPage,
            getRow: getRow,
            destroy: destroy
        });

        function init(self, options) {
            self.$super();
            if (!_.isObject(options)) {
                throw new Error("invlaid option");
            }
            options = _.extend({}, DEFAULT_OPTIONS, options);
            if (!options.store) {
                throw new Error("store is required");
            }

            var defaults = options.defaults || {};
            self.bordered = options.bordered !== false;
            self.gridHeight = options.gridHeight;

            self.page = options.page;
            self.pageSize = options.pageSize;
            self.key = options.idField || INDEX_KEY;

            self.store = options.store;

            _.each(options.events, function(handler, eventName) {
                if (_.isFunction(handler)) {
                    self.on(eventName, handler);
                }
            });

            if (options.pageStrategy !== "button" && options.pageStrategy !== "scroll") {
                self.pageStrategy = options.pageStrategy || "button";
            }
            self.headers = [];
            self.columns = [];
            self.rows = [];

            resolveExtention(self.headers, self.columns, options.ext);

            _.sortBy(self.columns, orderByPriority);
            _.sortBy(self.headers, orderByPriority);

            resolveColumn(self.headers, self.columns, options.columns, defaults);

            resolveRowRenderers(self.rows, options.rows);

            var store = self.store;
            store.on(BEFORE_LOAD_EVENT, function(event, params) {
                params.page = self.page;
                params.pageSize = self.pageSize;
                self.loadStatus = "loading";
            });
            store.on(LOAD_SUCCESS_EVENT, function(event, response, data, params) {
                self.loadStatus = "success";
                onLoadSuccess(self, response, data, params);
            });
            store.on(LOAD_COMPLETE_EVENT, function() {
                self.loadStatus = "complete";
            });
            store
                .fetchLoaded()
                .then(function(result) {
                    self.loadStatus = "success";
                    onLoadSuccess(self, result.result, result.data, result.params);
                });
        }

        function resolveColumn(resolvedHeaders, resolvedColumns, columns, defaults) {
            _.each(columns, function(columnDef) {
                _.defaults(columnDef, defaults);
                columnDef.value = CONSTT_VALUE;

                var keys = _.keys(columnDef);

                var headerRenderers = [];
                var rowRenderers = [];

                _.each(
                    keys,
                    function(name) {
                        var def = columnDef[name];
                        if (!isEnabledDef(def)) {
                            return;
                        }
                        var renderersDef = $grid.getCellRenderer(name, false);
                        if (renderersDef) {
                            if (_.isFunction(renderersDef.init)) {
                                renderersDef.init(columnDef);
                            }
                            rowRenderers.push({
                                def: def,
                                name: renderersDef.name,
                                priority: renderersDef.priority,
                                render: renderersDef.row || noop
                            });
                            headerRenderers.push({
                                def: def,
                                name: renderersDef.name,
                                priority: renderersDef.priority,
                                render: renderersDef.header || noop
                            });
                        }
                    }
                );
                _.sortBy(rowRenderers, orderByPriority);
                _.sortBy(headerRenderers, orderByPriority);

                resolvedHeaders.push({
                    renderers: headerRenderers,
                    def: columnDef
                });
                resolvedColumns.push({
                    renderers: rowRenderers,
                    def: columnDef
                });
            });
        }

        function resolveExtention(resolvedHeaders, resolvedColumns, ext) {
            _.each(ext, function(def, attr) {
                if (!isEnabledDef(def)) {
                    return;
                }

                if (!$grid.hasCellRenderer(attr, true)) {
                    return;
                }

                var rendererDef = $grid.getCellRenderer(attr, true);

                if (_.isFunction(rendererDef.init)) {
                    def = rendererDef.init(def) || def;
                }

                resolvedHeaders.push({
                    priority: rendererDef.priority,
                    renderers: [{
                        name: rendererDef.name,
                        priority: rendererDef.priority,
                        render: rendererDef.header || noop
                    }],
                    def: def
                });

                resolvedColumns.push({
                    priority: rendererDef.priority,
                    renderers: [{
                        name: rendererDef.name,
                        priority: rendererDef.priority,
                        render: rendererDef.row || noop
                    }],
                    def: def
                });
            });
        }

        function resolveRowRenderers(rowRenderersHolder, rows) {
            _.each(rows, function(def, name) {
                if (!isEnabledDef(def)) {
                    return;
                }

                if (!$grid.hasRowRenderer(name)) {
                    return;
                }

                var rendererDef = $grid.getRowRenderer(name);

                if (_.isFunction(rendererDef.init)) {
                    rendererDef.init(def);
                }

                rowRenderersHolder.push({
                    priority: rendererDef.priority,
                    render: rendererDef.render,
                    def: def
                });
            });
            _.sortBy(rowRenderersHolder, orderByPriority);
        }

        function isEnabledDef(def) {
            return !(def === undefined ||
                def === "none" ||
                def === false ||
                def === null ||
                def.enabled === false);
        }

        function orderByPriority(renderer) {
            return renderer.priority;
        }
        /**
         * 请求指定页码数据
         * @param  {number} page   目标页码
         * @param  {object} params [description]
         * @return {promise}
         */
        function goPage(self, page, params) {
            if (self.pageCount === undefined || (page > 0 && page <= self.pageCount)) {
                params = _.extend({}, self.lastParams, params);
                self.page = parseInt(page, 10);
                return self.load(params);
            } else {
                return $q.reject("parameter error");
            }
        }
        /**
         * 请求下n页的数据
         * @param  {number} step 往后几页
         */
        function nextPage(self, step) {
            self.goPage(self.page + (step || 1));
        }
        /**
         * 请求上n页的数据
         * @param  {number} step 往上几页
         */
        function prevPage(self, step) {
            self.goPage(self.page - (step || 1));
        }
        /**
         * 获取一行数据
         * @param  {any} id  数据ID
         * @return {object}      一行数据
         */
        function getRow(self, id) {
            return self.dataMap[id];
        }
        /**
         * 销毁
         * @return {[type]}
         */
        function destroy(self) {
            self.store.off(BEFORE_LOAD_EVENT);
            self.store.off(LOAD_SUCCESS_EVENT);
            self.store.off(LOAD_ERROR_EVENT);
            self.store.off(LOAD_COMPLETE_EVENT);
        }

        function onLoadSuccess(self, response, data, params) {
            self.data = data;
            self.dataMap = {};
            if (_.isArray(data)) {
                if (self.key === INDEX_KEY) {
                    _.each(data, function(item, index) {
                        data[self.key] = index;
                    });
                }
                _.each(data, function(item) {
                    self.dataMap[item[self.key]] = item;
                });
            }

            self.total = response.total;

            self.page = response.page || params.page;

            self.pageCount = Math.max(1, Math.ceil(self.total / self.pageSize));

            var min = Math.max(1, Math.min(self.page - 3, self.pageCount - 6));
            var max = Math.min(min + 6, self.pageCount);
            self.pageNumbers = _.range(min, max + 1, 1);
        }
    }
});
define('grid/grid.controller',[
    "./grid.module",
    "./grid.factory",
], function(app) {
    "use strict";
    GridController.$inject = ["UIGrid"];
    app.controller("UIGridController", GridController);

    /* @ngInject */
    function GridController(UIGrid) {
        var self = this;

        self.nextPage = nextPage;
        self.prevPage = prevPage;
        self.goPage = goPage;
        self.changePageSize = changePageSize;
        self.activate = activate;
        self.destroy = destroy;
        self.getRowRenderers = getRowRenderers;

        function activate(options) {
            self.grid = new UIGrid(options);
            self.gridBodyScrollbarOptions = {
                'live':'on',
                'theme':'minimal-dark'
                // 'callbacks':self.scrollbarCallbacks
            };
        }

        function destroy(){
            self.grid.destroy();
        }

        function nextPage() {
            return self.grid.nextPage();
        }

        function prevPage() {
            return self.grid.prevPage();
        }

        function goPage(page, params) {
            return self.grid.goPage(page, params);
        }

        function changePageSize(newPageSize) {
            var pageCount = Math.ceil(self.store.total / newPageSize);
            self.grid.pageSize = newPageSize;
            if (self.grid.page > pageCount) {
                self.go(pageCount);
            } else {
                self.store.load();
            }
        }

        function getRowRenderers(){
            return self.grid.rows;
        }
    }
});

define('grid/grid.head-cell.directive',[
    "./grid.module",
    "underscore"
], function(app, _) {
    "use strict";

    gridHeadCellDirective.$inject = ["$compile", "$timeout"];
    app.directive("uiGridHeadCell", gridHeadCellDirective);

    /* @ngInject */
    function gridHeadCellDirective($compile, $timeout) {
        var directive = {
            restrict: "A",
            require: "^^uiGrid",
            link: {
                pre: preLink
            }
        };
        return directive;

        function preLink(scope, element, attrs, grid) {
            var header = scope.header;
            _(
                _.filter(header.renderers, function(render) {
                    return _.isFunction(render.render);
                })
            ).each(function(renderer) {
                element.addClass("ui_grid_head_rendered--" + renderer.name);
                // renderer.render(element, renderer.def, header.def, grid);
                renderer.render({
                    element: element,
                    value: renderer.def,
                    column: header.def,
                    grid: grid
                });
            });

            $compile(element.contents())(scope);

            return $timeout(function() {
                var width;
                if (header.def.width) {
                    width = Math.max(50, Math.floor(header.def.width));
                } else {
                    width = element.outerWidth();
                }

                element.attr("width", width);
                element.css({
                    "width": width,
                    "min-width": width,
                    "max-width": width
                });

                header.realWidth = element.outerWidth();

            });
        }
    }
});
define('grid/grid.header.directive',[
    "./grid.module"
], function(app){
    "use strict";

    app.directive("uiGridHeader", gridHeaderDirective);

    function gridHeaderDirective(){
        var directive = {
            restrict: "A",
            require:"^^uiGrid"
        };
        return directive;
    }
});

define('grid/grid.row-cell.directive',[
    "./grid.module",
    "angular",
    "underscore",
    "utils/random.util"
], function(app, angular, _, RandomUtil) {
    "use strict";

    uiGridCellDirective.$inject = ["$compile", "$window"];
    app.directive("uiGridRowCell", uiGridCellDirective);

    /* @ngInject */
    function uiGridCellDirective($compile, $window) {
        var jqWindow = angular.element($window);
        var directive = {
            restrict: "A",
            require: "^^uiGrid",
            link: {
                pre: gridCellPreLink,
                post: gridCellPostLink
            }
        };
        return directive;

        function gridCellPreLink(scope, element, attrs, grid) {
            var $column = scope.$column;
            scope.$header = $column.def;
            var $rowdata = scope.$rowdata;
            _(
                _.filter($column.renderers, function(renderer){
                    return _.isFunction(renderer.render);
                })
            ).each(function(renderer){
                element.addClass("ui_grid_cell_rendered--" + renderer.name);
                renderer.render({
                    element: element,
                    value: renderer.def,
                    rowdata: $rowdata,
                    column: $column,
                    grid: grid
                });
            });
            $compile(element.contents())(scope);
        }

        function gridCellPostLink(scope, element) {
            var $column = scope.$column;
            // var header = $column.def;
            var columnIndex = $column.columnIndex;
            var $rowIndex = scope.$rowIndex;

            if ($rowIndex === 0) {
                autoAdjustWidth(scope, element, columnIndex);
            }
        }

        function autoAdjustWidth(scope, element, columnIndex) {
            var $header = element.closest(".grid_container").find(".grid_header table>thead>tr>th").eq(columnIndex);
            var resizeEventId = RandomUtil.unique("resize.");

            jqWindow.on(resizeEventId, function() {
                adjustCellWidth();
            });

            scope.$on("$destroy", function() {
                jqWindow.off(resizeEventId);
            });

            adjustCellWidth();

            function adjustCellWidth() {
                var columnWidth = $header.outerWidth();
                setElementWidth(element, columnWidth);
            }

            function setElementWidth(element, width) {
                element.css({
                    "max-width": width,
                    "width": width,
                    "min-width": width
                });
            }
        }
    }
});
define('grid/grid.row.directive',[
    "./grid.module",
    "var/noop",
    "underscore"
], function(app, noop, _) {
    "use strict";
    app.directive("uiGridRow", gridRowDirective);

    /* @ngInject */
    function gridRowDirective() {
        var directive = {
            restrict: "A",
            require: "^^uiGrid",
            controller: noop,
            controllerAs: "rowCtrl",
            link: postLink
        };
        return directive;

        function postLink($scope, element, attr, grid) {
            // $scope.rowCtrl.__init__($scope.$rowdata, grid);
            element.find(">*").click(function(e) {
                e.stopPropagation();
            });

            var rowRenderers = grid.getRowRenderers();

            _.each(rowRenderers, function(renderer){
                renderer.render({
                    element: element,
                    value: renderer.def,
                    rowIndex: $scope.$index,
                    rowdata: $scope.$rowdata
                });
            });
        }
    }

});
define('grid/grid.directive',[
    "./grid.module",
    "./grid.controller",
    "./grid.head-cell.directive",
    "./grid.header.directive",
    "./grid.row-cell.directive",
    "./grid.row.directive"
], function(app) {
    "use strict";
    app.directive("uiGrid", gridDirective);

    /* @ngInject */
    function gridDirective() {
        var directive = {
            restrict: "A",
            templateUrl: "{themed}/grid/ui-grid.html",
            replace: true,
            scope: false,
            controller: "UIGridController",
            controllerAs: "grid",
            bindToController: {
                "options": "=uiGrid"
            },
            link: gridPostLink
        };
        return directive;

        function gridPostLink(scope, element, attrs, grid) {
            var cancelWatchOption = scope.$watch("grid.options", function(options){
                if(options){
                    cancelWatchOption();
                    grid.activate(options);
                }
            });

            scope.$on("$destroy", function() {
                grid.destroy();
            });
        }
    }
});
define('grid/grid-require',[
    "./grid.module",
    "./grid.config",
    "./grid.directive"
], function(app){
    "use strict";
    return app.name;
});
define('themed/themed.module',[
    "angular"
], function(angular){
    "use strict";
    return angular.module("ngUI.theme", []);
});
define('themed/themed.provider',[
    "./themed.module"
], function(app){
    "use strict";

    app.provider("$themed", ThemeProvider);

    /* @ngInject */
    function ThemeProvider(){
        var self = this;

        self.config = config;
        activate();

        function activate(){
            self.config({
                name: "bootstrap",
                validation: {

                }
            });
        }

        self.$get = function(){
            return self;
        };

        function config(options){
            if(!options){
                return;
            }
            self.name = options.name || self.name;
            self.baseUrl = options.baseUrl || "/src/partials/" + self.name;
        }
    }
});
define('themed/themed-require',[
    "./themed.module",
    "./themed.provider"
],function(app){
    "use strict";
    return app.name;
});
define('validation/validation.module',[
    "angular",
    "../themed/themed-require"
],function(angular, themedModuleName){
    "use strict";
    return angular.module("ngUI.validation", [themedModuleName]);
});
define('validation/validation.provider',[
    "./validation.module",
    "utils/registable"
], function(app, Registable) {
    "use strict";

    app.provider("$validation", ValidationProvider);

    /* @ngInject */
    function ValidationProvider() {
        var self = this;
        var handlers = new Registable();
        var reader = handlers.reader();
        var writer = handlers.writer();

        var provider = {
            getMessageActionHandler: getMessageActionHandler,
            setErrorClass: function(className){
                self.errorClass = className;
            }
        };
        self.errorClass = "has-error";
        self.handles = writer;
        self.$get = validationMessageProviderGetter;

        function getMessageActionHandler(name){
            return reader.get(name);
        }
        /* @ngInject */
        function validationMessageProviderGetter() {
            return provider;
        }
    }

});
define('validation/validation.config',[
    "./validation.module",
    "./validation.provider"
], function(app) {
    "use strict";

    configValidationMessage.$inject = ["$validationProvider"];
    formDirectiveDecorate.$inject = ["$provide"];
    app.config(formDirectiveDecorate);

    app.config(configValidationMessage);

    /* @ngInject */
    function configValidationMessage($validationProvider) {
        $validationProvider.handles.regist("visibility", function(modelCtrl, formCtrl, messageElement, isInvalid) {
            if (isInvalid) {
                messageElement.show();
            } else {
                messageElement.hide();
            }
        });
    }

    /* @ngInject */
    function formDirectiveDecorate($provide) {
        ngModelDecorator.$inject = ["$delegate"];
        submitDecorator.$inject = ["$delegate", "logger", "$parse"];
        $provide.decorator("formDirective", formDecoratorFactory(false));
        $provide.decorator("ngFormDirective", formDecoratorFactory(true));
        $provide.decorator("ngSubmitDirective", submitDecorator);
        $provide.decorator("ngModelDirective", ngModelDecorator);

        /* @ngInject */
        function ngModelDecorator($delegate) {
            var directive = $delegate[0];
            directive.require.push("^?vldFormGroup");
            var ctrlIndex = directive.require.length - 1;
            var lastCompile = directive.compile;

            directive.compile = function customNgModelCompile(element) {
                var link = lastCompile(element);
                var preLink = link.pre;

                link.pre = function(scope, element, attr, ctrls) {
                    var modelCtrl = ctrls[0];
                    var vldFormGroupCtrl = ctrls[ctrlIndex];
                    if (vldFormGroupCtrl) {
                        vldFormGroupCtrl.$setNgModel(modelCtrl);
                    }
                    return preLink.apply(this, arguments);
                };
                return link;
            };
            return $delegate;
        }

        function formDecoratorFactory(isNgForm) {
            /* @ngInject */
            formDecorator.$inject = ["$delegate"];
            function formDecorator($delegate) {
                var directive = $delegate[0];

                var FormController = directive.controller;
                FormController.prototype.$setAllDirty = $setAllDirty;

                function $setAllDirty() {
                    var models = getErrorModels(this);
                    models.forEach(function(ngModel) {
                        ngModel.$setDirty();
                    });
                }
                var ngFormCompile = directive.compile;

                directive.compile = function() {
                    var link = ngFormCompile.apply(this, arguments);

                    var ngFormPreLink = link.pre;

                    link.pre = function(scope, element, attr, ctrls) {
                        var formCtrl = ctrls[0];
                        if (!isNgForm) {
                            formCtrl.$submit = function() {
                                return element.submit();
                            };
                        } else {
                            formCtrl.$submit = function() {
                                return new Error("不支持提交ngForm");
                            };
                        }
                        return ngFormPreLink.apply(this, arguments);
                    };

                    return link;
                };

                return $delegate;
            }
            return formDecorator;
        }
        /* @ngInject */
        function submitDecorator($delegate, logger, $parse) {
            var directive = $delegate[0];

            directive.compile = compile;

            return $delegate;

            function compile($element, attr) {
                return function ngEventHandler(scope, element) {
                    var fn = $parse(attr.ngSubmit);
                    var $formCtrl = element.data("$formController");
                    element.on("submit", function(event) {
                        if (!scope.$$phase) {
                            scope.$apply(callback);
                        } else {
                            scope.$evalAsync(callback);
                        }
                        return false;

                        function callback() {
                            if ($formCtrl.$valid) {
                                fn(scope, {
                                    $event: event
                                });
                            } else {
                                $formCtrl.$setAllDirty();
                                var errorModels = getErrorModels($formCtrl);

                                var modelSelectors = [];
                                errorModels.forEach(function(model) {
                                    modelSelectors.push("[name=" + model.$name + "]");
                                });
                                // 验证不通过的第一个控件获取焦点
                                element.find(modelSelectors.join(", ")).eq(0).focus();
                            }
                        }
                    });
                };
            }
        }

        function getErrorModels($formCtrl) {
            var errors = $formCtrl.$error;
            var errorModels = [];
            for (var k in errors) {
                var models = errors[k];
                for (var i in models) {
                    errorModels.push(models[i]);
                }
            }
            return errorModels;
        }

    }
});
define('validation/vld-form-group.directive',[
    "./validation.module",
    "angular"
], function(app) {
    "use strict";

    app.directive("vldFormGroup", validFormGroupDirective);

    /* @ngInject */
    function validFormGroupDirective() {
        var directive = {
            restrict: "A",
            require: "^^form",
            template: "<div ng-class=\"{true:vldGroup.errorCls}[(vldGroup.dirty?vldGroup.model.$dirty: true) && vldGroup.model.$invalid]\" ng-transclude>",
            replace: true,
            transclude: true,
            scope: true,
            bindToController: {
                config: "=?vldFormGroup"
            },
            controller: ValidFormGroupController,
            controllerAs: "vldGroup",
            link: postLink
        };
        return directive;

        function postLink(scope, element, attr, formModel) {
            scope.vldGroup.__init__(formModel);
        }
    }
    /* @ngInject */
    function ValidFormGroupController() {
        var self = this;
        self.$setNgModel = $setNgModel;
        self.__init__ = __init__;

        function __init__(form) {
            var config = self.config;
            self.form = form;
            self.field = config.field;
            self.dirty = config.dirty === undefined ? true : !!config.dirty;
            self.errorCls = config.errorCls || "has-error";
        }
        /**
         * ngModel decorator 会将ngModelController设置进来
         * @param {object} ngModel NgModelController
         */
        function $setNgModel(ngModel) {
            if (self.field && ngModel.name === self.field) {
                self.model = ngModel;
            } else if (self.model === undefined) {
                self.model = ngModel;
                self.field = ngModel.name;
            }
        }
    }
});
define('validation/vld-message.directive',[
    "./validation.module",
    "angular",
    "./validation.provider"
], function(app, angular) {
    "use strict";

    validMessageDirective.$inject = ["$validation"];
    app.directive("vldMessage", validMessageDirective);

    /* @ngInject */
    function validMessageDirective($validation) {
        var directive = {
            restrict: "A",
            require: "^^vldFormGroup",
            scope: {
                conf: "=vldMessage"
            },
            link: postLink
        };
        return directive;

        function postLink(scope, element, attr, formgroup) {
            element.hide();
            var conf = scope.conf;
            var action = "visibility";
            var actionHandle;
            var errorNames = normalizeErrorNames(conf);

            if (!errorNames && angular.isObject(conf)) {
                action = conf.action || action;
                errorNames = normalizeErrorNames(conf["for"]);
            }
            actionHandle = $validation.getMessageActionHandler(action);
            if (!errorNames || !actionHandle) {
                throw new Error("验证消息配置错误！");
            }

            scope.$watch(function() {
                var model = formgroup.model;

                if (!model) {
                    return true;
                }
                return (formgroup.dirty ? model.$dirty : true) && hasError(model, errorNames);
            }, function(invalid) {
                actionHandle.call(null, formgroup.model, formgroup.form, element, invalid);
            });

            function hasError(model, names) {
                for (var i in names) {
                    if (model.$error[names[i]]) {
                        return true;
                    }
                }
                return false;
            }

            function normalizeErrorNames(errors) {
                if (angular.isString(errors)) {
                    return [errors];
                } else if (angular.isArray(errors)) {
                    return errors;
                }
            }
        }
    }

});
define('validation/validation-require',[
    "./validation.module",
    "./validation.config",
    "./vld-form-group.directive",
    "./vld-message.directive"
], function(module){
    "use strict";
    return module.name;
});
(function(global, factory){
    "use strict";
    if (typeof define === "function" && define.amd){
        define('partials',["angular"], function(angular){
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
    (function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid-accordion.html',
    '<a class="btn btn-xs btn-link" href="javascript:;" ng-click="accordion.toggleContent()"><i class="glyphicon" ng-class="{true: \'glyphicon-minus\',false: \'glyphicon-plus\'}[accordion.isVisible]"></i></a>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid-footer.html',
    '<div><span class="pull-right"><ul class="pagination pagination-sm grid_pagination"><li title="{{grid.page === 1? \'已经是第一页了\':\'第1页\'}}" ng-class="{\'disabled\': grid.page === 1}" ng-disabled="grid.page === 1" ng-click="grid.page > 1 &amp;&amp; grid.go(1)"><a href="javascript:;"><i class="fa fa-angle-double-left"></i></a></li><li title="{{grid.page === 1? \'已经是第一页了\':\'上一页\'}}" ng-class="{\'disabled\': grid.page === 1}" ng-disabled="grid.page === 1" ng-click="grid.page > 1 &amp;&amp; grid.prevPage(1)"><a href="javascript:;"><i class="fa fa-angle-left"></i></a></li><li title="第{{page}}页" ng-class="{\'active\': page === grid.page}" ng-repeat="page in grid.pageNumbers | limitTo: 7" ng-click="grid.go(page)"><a href="javascript:;" ng-bind="page"></a></li><li title="{{grid.page == grid.pageCount ? \'已经是最后一页\':\'下一页\'}}" ng-class="{\'disabled\':grid.page === grid.pageCount}" ng-disabled="grid.page === grid.pageCount" ng-click="grid.page < grid.pageCount &amp;&amp; grid.nextPage(1)"><a href="javascript:;"><i class="fa fa-angle-right"></i></a></li><li title="{{grid.page == grid.pageCount ? \'已经是最后一页\':\'最后一页\'}}" ng-class="{\'disabled\':grid.page === grid.pageCount}" ng-disabled="grid.page === grid.pageCount" ng-click="grid.page &lt; grid.pageCount &amp;&amp; grid.go(grid.pageCount)"><a href="javascript:;"><i class="fa fa-angle-double-right"></i></a></li></ul><span class="grid_pager_status text-primary">查询出<span ng-bind="grid.total"></span>条记录，每页<select class="form-control grid_change_page_size" ng-model="grid.pageSize" ng-change="grid.changePageSize(grid.pageSize)" ng-options="ps as ps for ps in grid.pageSizes"></select>条，共<span ng-bind="grid.pageCount"></span>页</span></span><div class="clearfix"></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid.html',
    '<div><div class="grid_container" ng-class="{\'grid_fixedheader\': grid.fixHeader}"><div class="grid_header"><table class="table table-bordered" ui-grid-header=""><thead><tr><th ng-repeat="header in grid.grid.headers" class="grid_head" ui-grid-head-cell=""></th></tr></thead></table></div><div class="grid_body" ui-scrollbar="grid.gridBodyScrollbarOptions" box-height="{{grid.gridHeight}}"><table class="table table-hover table-bordered"><tbody><tr ui-grid-row="" ng-repeat="$rowdata in grid.grid.data" ng-init="$rowIndex = $index" class="grid_row" data-index="{{$index}}"><td ng-repeat="$column in grid.grid.columns" ui-grid-row-cell=""></td></tr></tbody></table><div class="text-center" ng-if="!grid.grid.data || grid.grid.data.length < 1"><h2>没有数据</h2></div></div><div class="grid_toolbar_container"><div ng-include="grid.footerTemplateUrl"></div></div></div></div>');
}]);
})();

});
define('app.module',[
    "grid/grid-require",
    "validation/validation-require",
    "themed/themed-require",
    "partials"
], function(uiGridModuleName, themedModuleName, validationModuleName){
    "use strict";
    var deps = [
        "ng",
        "ngUI.partials",
        uiGridModuleName,
        validationModuleName,
        themedModuleName
    ];
    return angular.module("ngUI", deps);
});

define('init/themed.config',[
    "../app.module",
    "angular",
    "../themed/themed-require",
], function(app, angular){
    "use strict";

    decorateConfigure.$inject = ["$provide", "$themedProvider"];
    app.config(decorateConfigure);

    /* @ngInject */
    function decorateConfigure($provide, $themedProvider){
        decorateTemplateRequest.$inject = ["$delegate"];
        decorateTemplateCahce.$inject = ["$delegate"];
        $provide.decorator("$templateRequest", decorateTemplateRequest);
        $provide.decorator("$templateCache", decorateTemplateCahce);

        /* @ngInject */
        function decorateTemplateRequest($delegate){
            return angular.extend(function(tpl, ignoreRequestError){
                tpl = replace(tpl);
                return $delegate.call(this, tpl, ignoreRequestError);
            }, $delegate);
        }
        /* @ngInject */
        function decorateTemplateCahce($delegate){
            var _get = $delegate.get;
           var _has = $delegate.has;
           var _remove = $delegate.remove;
           var _put = $delegate.put;

           $delegate.get = function(key){
               return _get.call($delegate, replace(key));
           };
           $delegate.has = function(key){
               return _has.call($delegate, replace(key));
           };
           $delegate.put = function(key, value){
               return _put.call($delegate, key, value);
           };
           $delegate.remove = function(key){
               return _remove.call($delegate, replace(key));
           };
           return $delegate;
        }

        function replace(templateUrl){
            if(templateUrl){
                return templateUrl.replace("{themed}", $themedProvider.baseUrl);
            }
            return templateUrl;
        }
    }
});
define('ng-ui-app',[
    "./app.module",
    "./init/themed.config"
], function(app){
    "use strict";
    return app;
});

