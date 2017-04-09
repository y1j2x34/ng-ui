define([
    "./widget.module",
    "pnotify",
    "angular",
    "pnotify.buttons"
], function(app, PNotify, angular) {
    "use strict";
    app.service("$notify", NotifyService);
    var DEFAULT_TITLES = {
        "success": "提示",
        "info": "提示",
        "notice": "警告",
        "error": "错误"
    };
    /* @ngInject */
    function NotifyService() {
        var service = this;
        service.notify = notify;
        service.success = success;
        service.info = info;
        service.notice = notice;
        service.error = error;
        service.dark = dark;

        function notify(options) {
            if (!angular.isObject(options)) {
                options = {};
            }
            options.styling = options.styling || "bootstrap3";
            return new PNotify(options);
        }

        function success(title, text) {
            return typedNotify("success", title, text);
        }

        function info(title, text) {
            return typedNotify("info", title, text);
        }

        function notice(title, text) {
            return typedNotify("notice", title, text);
        }

        function error(title, text) {
            return typedNotify("error", title, text);
        }

        function dark(title, text) {
            return typedNotify("info", {
                title: arguments.length > 1 ? title : undefined,
                text: text || title,
                addClass: "dark"
            });
        }

        function typedNotify(type, title, text) {
            if (angular.isObject(title)) {
                return notify(angular.extend(title, {
                    type: type
                }));
            } else if (!text) {
                return notify({
                    type: type,
                    title: DEFAULT_TITLES[type],
                    text: title
                });
            } else {
                return notify({
                    type: type,
                    title: title,
                    text: text
                });
            }
        }
    }
});