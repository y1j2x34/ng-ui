define([
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