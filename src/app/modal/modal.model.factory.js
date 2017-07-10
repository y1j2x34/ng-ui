define([
    "./modal.module",
    "supports/Class",
    "event/subject",
    "utils/random.util",
    "./modal.provider"
], function(app, Class, Subject, RandomUtils) {
    "use strict";
    app.factory("NgUIModalModel", moduleFactory);

    function moduleFactory($modal) {
        return Class.extend(Subject, {
            init: init,
            show: show,
            hide: hide,
            destroy: destroy
        });

        function init(self, options) {
            self.$super();

            var defaultOptions = $modal.options;
            options = angular.extend({}, defaultOptions, options);
            /**
             * 模态框唯一标识
             * @type {String}
             */
            var id = options.id;
            /**
             * 模态框数据， 以$modalData形式注入模态框controller中
             * @type {Any}
             */
            var data = options.data;
            /**
             * @type {function|string}
             */
            var controller = options.controller;
            /**
             * @type {String} 默认$ctrl
             */
            var controllerAs = options.controllerAs;
            /**
             * 内容模板，
             * @type {String}
             */
            var template = options.template;
            /**
             * 控制隐藏后是否销毁
             * @type {boolean}
             */
            var destroyOnHidden = options.destroyOnHidden !== false;
            /**
             *头部模板地址，默认使用$modalProvider.options.headerTemplateUrl
             * @type {String}
             */
            var headerTemplateUrl = options.headerTemplateUrl;
            /**
             *
             * 内容模板地址，默认使用$modalProvider.options.bodyTemplateUrl
             * @type {String}
             */
            var bodyTemplateUrl = options.bodyTemplateUrl;
            /**
             * 底部模板地址，默认使用$modalProvider.options.footerTemplateUrl
             * @type {String}
             */
            var footerTemplateUrl = options.footerTemplateUrl;
            /**
             *
             * 按下Esc键后的行为，true, ‘hide’都表示隐藏, destroy表示直接销毁。
             * @type {string|boolean}
             */
            var keyboard = options.keyboard;
            /**
             * header icon css class
             * @type {String}
             */
            var iconCls = options.iconCls;
            /**
             * .dialog-modal css class
             * @type {String}
             */
            var modalCls = options.cls;
            /**
             * 标题
             * @type {String}
             */
            var title = options.title;
            /**
             * 模态框宽度
             * @type {Number}
             */
            var width = options.width;
            /**
             * 控制模态框是否同时只能显示一个，如果已有oneAtTime为true的模态框显示，则当前模态框会被放入队列等待其其它被关闭
             * @type {boolean}
             * @default false
             */
            var oneAtTime = options.oneAtTime;
            /**
             * 是否开启拖拽
             * @type {boolean}
             */
            var draggable = options.draggable;

            if (!angular.isObject(data)) {
                data = {};
            }
            if (data.$modal || data[controllerAs]) {
                throw new Error("数据名称不合法");
            }

            if (angular.isUndefined(controller)) {
                controller = angular.noop;
            }
            self.id = id || RandomUtils.unique("modal-");
            self.data = data;
            self.controller = controller;
            self.controllerAs = controllerAs;
            self.bodyTemplateUrl = bodyTemplateUrl;
            self.footerTemplateUrl = footerTemplateUrl;
            self.headerTemplateUrl = headerTemplateUrl;
            self.destroyOnHidden = destroyOnHidden;
            self.visible = false;
            self.showAfterInitialized = options.show === true;
            self.keyboard = keyboard;
            self.destroyed = false;
            self.template = template;
            self.iconCls = iconCls;
            self.title = title;
            self.cls = modalCls;
            self.width = width;
            self.oneAtTime = oneAtTime === true;
            self.draggable = draggable === true;
        }

        function show(self) {
            if (!self.visible) {
                self.visible = true;
                self.trigger("show", self);
            }
        }

        function hide(self) {
            if (self.visible) {
                self.visible = false;
                self.trigger("hide", self);
            }
        }

        function destroy(self) {
            if (!self.destroyed) {
                self.destroyed = true;
            }
        }
    }
});