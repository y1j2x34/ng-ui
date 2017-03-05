define([
    "./grid.module",
    "./renderers/all",
    "./grid.provider",
], function(app, allRenderers){
    "use strict";

    app.config(configure);

    /* @ngInject */
    function configure($gridProvider){
        _.each(allRenderers, function(renderer){
            $gridProvider.registRenderer(renderer.name, renderer.header, renderer.row, !!renderer.ext);
        });
    }
});