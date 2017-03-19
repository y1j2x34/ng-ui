define([
    "../grid.module",
    "underscore",
    "utils/random.util"
], function(app, _, RandomUtil){
    "use strict";
    app.directive("uiGridHeadCheckbox", gridHeadCheckboxDirective);

    /* @ngInject */
    function gridHeadCheckboxDirective(){
        var directive = {
            restrict: "A",
            require: ["uiGridHeadCheckbox", "^uiGrid"],
            scope: true,
            controller: HeadCheckboxController,
            controllerAs: "vm",
            templateUrl: "{themed}/grid/ui-grid-head-checkbox.html",
            link: headCheckboxPostLink
        };
        return directive;

        function headCheckboxPostLink(scope, element, attrs, ctrls){
            var vm = ctrls[0];
            var grid = ctrls[1];
            vm.__init__(grid);
            scope.$on("$destroy", vm.__destroy__);
        }
    }
    /* @ngInject */
    function HeadCheckboxController(){
        var self = this;
        var selectOneEventName = RandomUtil.unique("selectOne.");
        self.__init__ = __init__;
        self.__destroy__ = __destroy__;
        self.selectStateChange = selectStateChange;

        var selectedRows = [];

        function __init__(grid){
            self.grid = grid;
            grid.delegate.on(selectOneEventName, onSelectOne);
            grid.delegate.getSelectedRows = getSelectedRows;
            grid.delegate.getSelectedRow = getSelectedRow;
        }
        function __destroy__(){
            self.grid.delegate.off(selectOneEventName);
        }
        function onSelectOne(event, selected, rowdata){
            if(!selected){
                self.selected = false;
                var index = selectedRows.indexOf(rowdata);
                if(index > -1){
                    selectedRows.splice(index, 1);
                }
            }else{
                selectedRows.push(rowdata);
                self.selected = selectedRows.length === self.grid.delegate.data.length;
            }
            console.info(selectedRows, self.grid.delegate.data);
        }
        function selectStateChange(selected){
            if(selected){
                selectedRows = _.clone(self.grid.delegate.data);
            }else{
                selectedRows = [];
            }
            self.grid.delegate.trigger("selectAll", selected);
        }

        function getSelectedRow(){
            return selectedRows[0];
        }
        function getSelectedRows(){
            return selectedRows;
        }
    }
});