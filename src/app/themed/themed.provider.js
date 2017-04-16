define([
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
            self.baseUrl = options.baseUrl || "src/partials/" + self.name;
        }
    }
});