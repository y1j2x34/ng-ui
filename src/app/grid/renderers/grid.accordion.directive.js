define([
    "../grid.module",
    "utils/random.util",
    "underscore"
], function(app, RandomUtil, _){
    "use strict";
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