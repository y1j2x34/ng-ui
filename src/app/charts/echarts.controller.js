define([
    "./charts.module",
    "echarts"
], function (app, Echarts) {
    "use strict";
    app.controller("EchartsController", EchartsController);

    /* @ngInject */
    function EchartsController($element, logger, $window) {
        var self = this;
        self.options = {
            title: {},
            tooltip: {
                trigger: "axis"
            },
            legend: {
                data: []
            },
            series: []
        };
        self.updateOptions = updateOptions;

        self.initialize = function () {
            var instance = Echarts.init($element.get(0));
            self.echartsInstance = instance;
            updateOptions();
        };

        function updateOptions() {
            $window.clearTimeout(self.updateOptionTimmerId);
            self.updateOptionTimmerId = $window.setTimeout(function () {
                self.echartsInstance.__flagInMainProcess = false;
                self.echartsInstance.setOption(self.options);
            }, 40);
        }
    }
});