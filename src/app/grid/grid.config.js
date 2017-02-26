define([
    "./grid.module",
    "./grid.provider"
], function(app){
    "use strict";

    app.config(configure);

    /* @ngInject */
    function configure($gridProvider){

        $gridProvider.registRenderer();
    }
});