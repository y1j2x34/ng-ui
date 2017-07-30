define([
    "angular",
    "./charts.module",
    "./echarts.directive"
], function(angular, app){
    "use strict";
    app.directive("uiEchartsXAxis", echartsXAxisDirective);

    /* @ngInject */
    function echartsXAxisDirective(){
        var directive = {
            restrict: "AE",
            scope: true,
            require: ["^uiEcharts", "uiEchartsXAxis"],
            controller: angular.noop,
            controllerAs: "xAxis",
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
                 *  类目数据， type=category有效
                 */
                data: "<?",
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
                pre: xAxisPreLink
            }
        };
        return directive;

        function xAxisPreLink(scope, element, attrs, ctrls){
            var echartsCtrl = ctrls[0];
            var echartsXAxisCtrl = ctrls[1];

            var options = {
                axisLabel: {}
            };
            echartsCtrl.options.xAxis = options;

            bindXAxisOptions();

            scope.$watch(function(){
                bindXAxisOptions();
                return options;
            }, function(){
                echartsCtrl.updateOptions();
            }, true);

            function bindXAxisOptions() {
                options.type = echartsXAxisCtrl.type;
                options.data = echartsXAxisCtrl.data;
                options.min = echartsXAxisCtrl.min;
                options.max = echartsXAxisCtrl.max;
                options.minInterval = echartsXAxisCtrl.minInterval;
                options.splitNumber = echartsXAxisCtrl.splitNumber;
                options.axisLabel.formatter = echartsXAxisCtrl.labelFormatter;
            }
        }
    }
});