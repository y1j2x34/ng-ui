define([
    "angular",
    "./charts.module",
    "./echarts.directive"
], function (angular, app) {
    "use strict";
    app.directive("uiEchartsZoom", echartsZoomDirective);

    function echartsZoomDirective() {
        var directive = {
            restrict: "AE",
            // scope: true,
            require: ["^^uiEcharts", "uiEchartsZoom"],
            controller: angular.noop,
            controllerAs: "echartsZoom",
            bindToController: {
                start: "<?",
                end: "<?"
            },
            link: {
                pre: echartsZoomPreLink
            }
        };
        return directive;

        function echartsZoomPreLink(scope, element, attrs, ctrls) {
            var echartsCtrl = ctrls[0];
            var echartsZoomCtrl = ctrls[1];

            if (echartsCtrl.options.dataZoom && echartsCtrl.options.dataZoom.length > 1) {
                throw new Error("data zoom");
            }
            var dataZoomOptions0 = {
                type: "inside",
                start: echartsZoomCtrl.start || 0,
                end: echartsZoomCtrl.end || 100
            };
            var dataZoomOptions = {
                start: 0,
                end: 100,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            };
            
            echartsCtrl.options.dataZoom = [dataZoomOptions0, dataZoomOptions];
        }
    }
});