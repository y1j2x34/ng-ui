define([
    "angular",
    "./charts.module",
    "./echarts.directive"
], function(angular, app){
    "use strict";
    app.directive("uiEchartsToolip", echartsToolipDirective);

    function echartsToolipDirective($compile, $window){
        var directive = {
            restrict: "AE",
            scope: true,
            require: ["^uiEcharts", "uiEchartsTooltip"],
            controller: angular.noop,
            controllerAs: "tooltip",
            bindToController: {
                /**
                 * 触发类型
                 * item 数据项图形触发，散点图、饼图等无类目轴的图表使用
                 * axis 坐标轴触发，柱状图、折线图等类目轴的图标中使用
                 * none 不触发
                 */
                trigger: "@?",
                /**
                 * 背景颜色， 默认 rgba(0,0,0,0)
                 */
                bgColor: "@?",
                /**
                 * 边框颜色， 默认 #333
                 */
                borderColor: "@?",
                /**
                 * 边框粗细
                 */
                borderWidth: "=?",
                /**
                 * 内边距，默认5px
                 */
                padding: "=?"
            },
            link: {
                pre: tooltipPreLink
            }
        };
        return directive;
        function tooltipPreLink(scope, element, attrs, ctrls){
            var template = element.html();
            var echartCtrl = ctrls[0];
            var tooltipCtrl = ctrls[1];

            var tooltip = {};

            if(template.trim().length > 0){
                tooltip.formatter = tooltipFormatter;
            }

            updateTooltipOptions();
            scope.$watch(function(){
                updateTooltipOptions();
                return tooltip;
            }, function(){
                echartCtrl.updateOptions();
            }, true);

            echartCtrl.options.tooltip = tooltip;
            
            function updateTooltipOptions(){
                tooltip.trigger = tooltipCtrl.trigger || "axis";
                tooltip.backgroundColor = tooltipCtrl.bgColor;
                tooltip.borderColor = tooltipCtrl.borderColor;
                tooltip.borderWidth = tooltipCtrl.tooltipCtrl.borderWidth;
            }
            function tooltipFormatter(params, ticket, callback) {
                if (angular.isArray(params)) {
                    var newScope = angular.extend(scope.$new(), {
                        series: params
                    });
                    var wrapper = angular.element("<div>");
                    wrapper.html(template);
                    $compile(wrapper)(newScope);
                    $window.setTimeout(function () {
                        callback(wrapper.get(0));
                    });
                }
                return "...";
            }
        }
    }
});