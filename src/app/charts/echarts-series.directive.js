define([
    "angular",
    "./charts.module",
    "./echarts.directive"
], function (angular, app) {
    "use strict";
    app.directive("uiEchartsSeries", echartsSeriesDirective);

    /* @ngInject */
    function echartsSeriesDirective() {
        var directive = {
            restrict: "AE",
            scope: true,
            require: ["^uiEcharts", "uiEchartsSeries"],
            controller: angular.noop,
            controllerAs: "series",
            bindToController: {
                data: "<",
                name: "@",
                /**
                 * 类型
                 * 可选：
                 * line
                 * map
                 * radar
                 * bar
                 * pie
                 * scatter
                 * ...
                 * @type String
                 */
                type: "@", // line
                /**
                 * 堆叠
                 */
                stack: "@?",
                /**
                 * 
                 * 是否平滑曲线显示， type等于line时有效
                 * @type Boolean
                 */
                smooth: "<",
                /**
                 * 折线图在数据量远大于像素点时候的降采样策略，开启后可以有效的优化图表的绘制效率，默认关闭，也就是全部绘制不过滤数据点。
                 * 可选：
                 * 'average' 取过滤点的平均值
                 * 'max'取过滤点的最大值
                 * 'min'取过滤点的最小值
                 * 'sum'取过滤点的和
                 */
                sampling: "@?",
                /**
                 * 线条样式：
                 * {
                 *  color: "自适应",
                 *  type: "solid",
                 *  width: 2,
                 *  opacity: 1
                 * }
                 */
                lineStyle: "<?",
                /**
                 * 区域填充样式
                 * {
                 * color: "#000"，
                 * shadowBlur: ...,
                 * shadowColor: ...,
                 * shadowOffsetX: 0,
                 * shadowOffsetY: 0,
                 * opacity: 0
                 * }
                 */
                areaStyle: "<?"
            },
            link: {
                pre: echartsSeriesPreLink
            }
        };
        return directive;

        function echartsSeriesPreLink(scope, element, attrs, ctrls) {
            var echartsCtrl = ctrls[0];
            var echartsSeriesCtrl = ctrls[1];
            var series = {
                lineStyle: {},
                areaStyle: {}
            };
            var legend = echartsCtrl.options.legend;
            var seriesIndex = echartsCtrl.options.series.length;

            echartsCtrl.options.series.push(series);

            updateSeriesOptions();

            scope.$watch(function () {
                updateSeriesOptions();
                return series;
            }, function(){
                echartsCtrl.updateOptions();
            }, true);

            function updateSeriesOptions(){
                legend.data[seriesIndex] = echartsSeriesCtrl.name;
                series.data = echartsSeriesCtrl.data;
                series.name = echartsSeriesCtrl.name;
                series.type = echartsSeriesCtrl.type || "line";
                series.smooth = echartsSeriesCtrl.smooth !== false;
                series.sampling = echartsSeriesCtrl.sampling;

                series.lineStyle.normal = echartsSeriesCtrl.lineStyle;

                series.areaStyle.normal = echartsSeriesCtrl.areaStyle;

            }
        }
    }
});