define([
    "../grid.module"
], function(app){
    "use strict";
    app.directive("uiGridRowRadio", gridRowRadioDirective);

    /* @ngInject */
    function gridRowRadioDirective(){
        var directive = {
            restrict: "A",
            require: ["uiGridRowRadio", "^uiGrid"],
            templateUrl: "{themed}/grid/ui-grid-row-radio.html",
            replace: true,
            scope: true,
            controller: GridRowRadioController,
            controllerAs: "vm",
            link: gridRowRadioPostLink
        };
        return directive;

        function gridRowRadioPostLink(scope, element, attrs, ctrls){
            var vm = ctrls[0];
            var grid = ctrls[1];

            vm.__init__(grid, scope.$rowdata);
        }
    }

    /* @ngInject */
    function GridRowRadioController(){
        var self = this;

        self.__init__ = __init__;
        self.selectStateChange = selectStateChange;

        function __init__(grid, rowdata){
            self.grid = grid;
            self.rowdata = rowdata;
        }

        function selectStateChange(selected){
            if(selected){
                self.grid.delegate.getSelectedRow = getSelectedRow;
                self.grid.delegate.getSelectedRows = getSelectedRows;
            }
            self.grid.delegate.trigger("selectOne", !!selected, self.rowdata);
        }

        function getSelectedRow(){
            return self.rowdata;
        }
        function getSelectedRows(){
            return [self.rowdata];
        }
    }
});