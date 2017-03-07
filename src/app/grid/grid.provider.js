define([
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