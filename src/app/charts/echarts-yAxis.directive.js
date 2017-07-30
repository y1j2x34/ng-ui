define([
    "angular",
    "./charts.module",
    "./echarts.directive"
], function (angular, app) {
    "use strict";
    app.directive("uiEchartsYAxis", echartsYAxisDirective);

    /* @ngInject */
    function echartsYAxisDirective() {
        var directive = {
            restrict: "AE",
            scope: true,
            require: ["^uiEcharts", "uiEchartsYAxis"],
            controller: angular.noop,
            controllerAs: "yAxis",
            bindToController: {
                /**
                 * 坐标轴类型
                 * value 数值轴
                 * category 类目轴， 需要使用data设置横坐标类目数据
                 * time
                 * log
                 */
                type: "@?",
                /**
                 * 坐标轴名称
                 */
                name: "@?",
                /**
                 * 坐标轴刻度最小值, 不设置使用数据的最小值
                 */
                min: "@?",
                /**
                 * 坐标轴刻度最大值， 不设置使用数据最大值
                 */
                max: "@?",
                /**
                 * 自动计算的坐标轴最小间隔大小
                 * 例如可以设置成1保证坐标轴分割刻度显示成整数
                 * type=value 有效
                 */
                minInterval: "=?",
                /**
                 * 坐标轴的分割段数预估值，默认为5，
                 */
                splitNumber: "<?",
                /**
                 * 横轴格式
                 */
                labelFormatter: "@"
            },
            link: {
                pre: yAxisPreLink
            }
        };
        return directive;

        function yAxisPreLink(scope, element, attrs, ctrls) {
            var echartsCtrl = ctrls[0];
            var echartsYAxisCtrl = ctrls[1];

            var options = {
                boundaryGap: [0, "100%"],
                axisLabel: {}
            };
            echartsCtrl.options.yAxis = options;

            bindYAxisOptions();

            scope.$watch(function () {
                bindYAxisOptions();
                return options;
            }, function(){
                echartsCtrl.updateOptions();
            }, true);

            function bindYAxisOptions() {
                options.type = echartsYAxisCtrl.type || "value";
                options.name = echartsYAxisCtrl.name;
                options.min = echartsYAxisCtrl.min;
                options.max = echartsYAxisCtrl.max;
                options.minInterval = echartsYAxisCtrl.minInterval;
                options.splitNumber = echartsYAxisCtrl.splitNumber;
                options.axisLabel.formatter = echartsYAxisCtrl.labelFormatter;
            }
        }
    }
});