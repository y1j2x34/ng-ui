define([
    "./widget.module",
    "listview.plugin"
], function(app){
    "use strict";
    app.directive("uiListview", listviewDirective);

    /* @ngInject */
    function listviewDirective(){
        var directive = {
            restrict: "A",
            scope: {
                options: "=?uiListview"
            },
            link: {
                pre: listviewPreLink
            }
        };
        return directive;

        function listviewPreLink(scope, element){
            var listview = element.listview(scope.options || {}).data("listview");
            scope.$watch(scope.options, function(options){
                if(!options){
                    return;
                }
                listview.update(options);
            });
            scope.$on("$destroy", function(){
                listview.destroy();
            });
        }
    }
});