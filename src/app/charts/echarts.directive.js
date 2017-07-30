define([
    "./charts.module",
    "./echarts.controller"
], function (app) {
    "use strict";
    app.directive("uiEcharts", echartsDirective);

    /* @ngInject */
    function echartsDirective(logger){
        var directive = {
            restrict: "AE",
            scope: true,
            controller: "EchartsController",
            controllerAs: "chart",
            bindToController: {
                title: "@",
                xAxisName: "@",
                xAxisData: "@",
                subTitle:"@?"
            },
            link: echartsPostLink
        };
        return directive;

        function echartsPostLink(scope, element, attrs, chartCtrl){
            chartCtrl.initialize();
        }
    }
});