define([
    "./grid.module",
    "underscore",
    "utils/registable",
    "supports/Class"
], function(app, _, Registable, Class){
    "use strict";

    app.provider("$grid", GridProvider);

    /*  @ngInject */
    function GridProvider(){
        var renderers = new Registable();

        var renderersWriter = renderers.writer();

        var $grid = Class.singleton({
            init: function(self){
                self.renderersReader = renderers.reader();
            },
            getRenderersPair: function(self, names){
                var _names =_(names);
                var renderers = self.renderersReader;
                var headerRenderers = renderers.get(_names.map(headerColName));
                var rowRenderers = renderers.get(_names.map(rowColName));
                return {
                    headerRenderers: headerRenderers,
                    rowRenderers: rowRenderers
                };
            },
            getExtentionRendererPair: function(self, name){
                var namePair = makeName(name, true);
                var headerRenderer = self.renderersReader.get(namePair.headerName);
                var rowRenderer = self.renderersReader.get(namePair.rowName);

                return {
                    headerRenderer: headerRenderer,
                    rowRenderer: rowRenderer
                };
            },
            hasRenderer: function(self, name, isExtention){
                var namePair = makeName(name, isExtention);
                var hasHeaderRenderer = self.renderersReader.has(namePair.headerName);
                var hasRowRenderer = self.renderersReader.has(namePair.rowName);
                return hasHeaderRenderer || hasRowRenderer;
            }
        });

        this.registRenderer = registRenderer;

        function registRenderer(name, headerRenderer, rowRenderer, isExtention){
            var namePair = makeName(name, isExtention);
            renderersWriter.regist(namePair.headerName, {
                name: name,
                renderer: headerRenderer
            });
            renderersWriter.regist(namePair.rowName, {
                name: name,
                renderer: rowRenderer
            });
        }

        this.$get = function() {
            return $grid;
        };

        function makeName(name, isExtention){
            var headerName, rowName;

            if(isExtention){
                headerName = "header.ext." + name;
                rowName = "row.ext." + name;
            }else{
                headerName = headerColName(name);
                rowName = rowColName(name);
            }
            return {
                headerName: headerName,
                rowName: rowName
            };
        }

        function headerColName(name){
            return "header.cell." + name;
        }
        function rowColName(name){
            return "row.cell." + name;
        }
    }
});