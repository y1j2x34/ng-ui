define([
    "../grid.module",
    "utils/random.util"
], function(app, RandomUtil){
    "use strict";
    app.directive("uiGridRowCheckbox", gridRowCheckboxDirective);

    /* @ngInject */
    function gridRowCheckboxDirective(){
        var directive = {
            restrict: "A",
            require: ["uiGridRowCheckbox", "^uiGrid"],
            templateUrl: "{themed}/grid/ui-grid-row-checkbox.html",
            replace: true,
            controller: GridRowCheckboxController,
            controllerAs: "vm",
            scope: true,
            link: gridRowCheckboxPostLink
        };
        return directive;
        function gridRowCheckboxPostLink(scope, element, attrs, ctrls){
            var vm = ctrls[0];
            var grid = ctrls[1];
            vm.__init__(grid, scope.$rowdata);
            scope.$on("$destroy", vm.__destroy__);
        }
    }

    /* @ngInject */
    function GridRowCheckboxController(){
        var selectAllEventName = RandomUtil.unique("selectAll.");

        var self = this;
        self.__init__ = __init__;
        self.__destroy__ = __destroy__;
        self.selectStateChange = selectStateChange;

        function __init__(grid, rowdata){
            self.grid = grid;
            self.rowdata = rowdata;
            grid.delegate.on(selectAllEventName, onSelectAllStateChange);
        }

        function onSelectAllStateChange(event, selected){
            self.selected = selected;
        }

        function __destroy__(){
            self.grid.delegate.off(selectAllEventName);
        }
        function selectStateChange(selected){
            self.grid.delegate.trigger("selectOne", selected, self.rowdata);
        }
    }
});