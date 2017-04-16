(function(global, factory){
    "use strict";
    if (typeof define === "function" && define.amd){
        define(["angular"], function(angular){
            return factory(global, angular);
        });
    } else if (typeof module === "object" && module.exports){
		var angular = global.angular || require("angular");
		module.exports = factory(global, angular);
	}else{
		factory(global, global.angular);
	}
})(this, function(window, angular){
    "use strict";
    (function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid-accordion.html',
    '<a class="btn btn-xs btn-link btn-block" href="javascript:;" ng-click="accordion.toggleContent()"><i class="glyphicon" ng-class="{true: \'glyphicon-minus\',false: \'glyphicon-plus\'}[accordion.isVisible]"></i></a>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid-footer.html',
    '<div><span class="pull-right"><ul class="pagination pagination-sm grid_pagination"><li title="{{grid.page === 1? \'已经是第一页了\':\'第1页\'}}" ng-class="{\'disabled\': grid.page === 1}" ng-disabled="grid.page === 1" ng-click="grid.page > 1 &amp;&amp; grid.go(1)"><a href="javascript:;"><i class="fa fa-angle-double-left"></i></a></li><li title="{{grid.page === 1? \'已经是第一页了\':\'上一页\'}}" ng-class="{\'disabled\': grid.page === 1}" ng-disabled="grid.page === 1" ng-click="grid.page > 1 &amp;&amp; grid.prevPage(1)"><a href="javascript:;"><i class="fa fa-angle-left"></i></a></li><li title="第{{page}}页" ng-class="{\'active\': page === grid.page}" ng-repeat="page in grid.pageNumbers | limitTo: 7" ng-click="grid.go(page)"><a href="javascript:;" ng-bind="page"></a></li><li title="{{grid.page == grid.pageCount ? \'已经是最后一页\':\'下一页\'}}" ng-class="{\'disabled\':grid.page === grid.pageCount}" ng-disabled="grid.page === grid.pageCount" ng-click="grid.page < grid.pageCount &amp;&amp; grid.nextPage(1)"><a href="javascript:;"><i class="fa fa-angle-right"></i></a></li><li title="{{grid.page == grid.pageCount ? \'已经是最后一页\':\'最后一页\'}}" ng-class="{\'disabled\':grid.page === grid.pageCount}" ng-disabled="grid.page === grid.pageCount" ng-click="grid.page &lt; grid.pageCount &amp;&amp; grid.go(grid.pageCount)"><a href="javascript:;"><i class="fa fa-angle-double-right"></i></a></li></ul><span class="grid_pager_status text-primary">查询出<span ng-bind="grid.total"></span>条记录，每页<select class="form-control grid_change_page_size" ng-model="grid.pageSize" ng-change="grid.changePageSize(grid.pageSize)" ng-options="ps as ps for ps in grid.pageSizes"></select>条，共<span ng-bind="grid.pageCount"></span>页</span></span><div class="clearfix"></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid-head-checkbox.html',
    '<label class="grid_checkbox_label"><input type="checkbox" name="gridSelectAll" ng-model="vm.selected" ng-change="vm.selectStateChange(vm.selected)"></label>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid-row-checkbox.html',
    '<label class="grid_checkbox_label"><input type="checkbox" name="gridSelectOne" ng-model="vm.selected" ng-change="vm.selectStateChange(vm.selected)"></label>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid-row-radio.html',
    '<label class="grid_radio_label"><input type="radio" name="gridSelectOne" ng-model="self.grid.$selectedRow" ng-value="vm.rowdata.$$hashKey" ng-change="vm.selectStateChange(self.grid.$selectedRow)"></label>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/grid/ui-grid.html',
    '<div><div class="grid_container" ng-class="{\'fix-header\': delegate.fixHeader}"><div class="grid_header" ng-if="delegate.fixHeader"><table class="table table-bordered grid_header_table" ui-grid-header=""><thead class="grid_head"><tr><th ng-repeat="header in delegate.headers" class="grid_head" ui-grid-head-cell=""></th></tr></thead></table></div><div class="grid_body" ui-scrollbar="grid.gridBodyScrollbarOptions" box-height="{{delegate.height}}"><table class="table table-hover table-bordered grid_body_table"><thead ng-if="!delegate.fixHeader" class="grid_head"><tr><th ng-repeat="header in delegate.headers" class="grid_head" ui-grid-head-cell=""></th></tr></thead><tbody><tr ui-grid-row="" ng-repeat="$rowdata in grid.delegate.data" ng-init="$rowIndex = $index" class="grid_row" data-index="{{$index}}"><td ng-repeat="$column in delegate.columns" ui-grid-row-cell=""></td></tr></tbody></table><div class="text-center" ng-if="!delegate.data || delegate.data.length < 1"><h2>没有数据</h2></div></div><div class="grid_toolbar_container"><div ng-include="delegate.footerTemplateUrl"></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/check.html',
    '<div class="ui_check"><replacement></replacement><span class="ins"></span></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/datetimepicker-selector.html',
    '<div class="ui_datetimepicker_selector"><div class="dtp_header"><a class="dtp_toggler dtp_preview" ng-click="picker.previewMonth()"><i class="glyphicon glyphicon-arrow-left"></i></a><div class="dtp_selectors"><div class="dtp_dropdown dtp_month" ng-class="{\'open\': picker.showMonthSelector}"><a class="dtp_dropdown_text" ng-focus="picker.monthSelectorFocus(picker.monthSelectorScrollbar)" ng-blur="picker.showMonthSelector = false" tabindex="-1"><span ng-bind="picker.locale._months[picker.viewValue.month]"></span> <i class="caret"></i></a><div class="dtp_dropdown_content" ui-scrollbar="picker.scrollbarOptions" scrollbar-model="picker.monthSelectorScrollbar" box-height="160px"><ul><li ng-repeat="month in picker.locale._months" ng-mousedown="picker.selectMonth($index)" ng-class="{\'active\': picker.viewValue.month === $index}"><a href="javascript:;" ng-bind="month"></a></li></ul></div></div><div class="dtp_dropdown dtp_year" ng-class="{\'open\': picker.showYearSelector}"><a class="dtp_dropdown_text" ng-focus="picker.yearSelectorFocus(picker.yearSelectorScrollbar)" ng-blur="picker.showYearSelector = false" tabindex="-1"><span ng-bind="picker.viewValue.year"></span><i class="caret"></i></a><div class="dtp_dropdown_content" ui-scrollbar="picker.scrollbarOptions" scrollbar-model="picker.yearSelectorScrollbar" box-height="160px"><ul><li ng-repeat="year in picker.selectionYears" ng-mousedown="picker.selectYear(year)" ng-class="{\'active\':picker.viewValue.year === year}"><a href="javascript:;" ng-bind="year"></a></li></ul></div></div></div><a class="dtp_toggler dtp_next" ng-click="picker.nextMonth()"><i class="glyphicon glyphicon-arrow-right"></i></a></div><div class="dtp_body"><div class="dtp_calendar"><table class="dtp_calendar_table"><thead><tr><th ng-repeat="weekdayMin in picker.locale._weekdaysMin" ng-bind="weekdayMin"></th></tr></thead><tbody ui-mousewheel="picker.switchDateOnMouseWheel($event)"><tr ng-repeat="weekdays in picker.calendar.dateInfo"><td ng-repeat="weekday in weekdays" ng-bind="weekday.dayOfMonth" title="{{weekday.t}}" ng-click="picker.selectDate(weekday)" ng-class="{\'other-month\': !weekday.isCurrentMonth, \'active\': weekday.isCurrentDate}"></td></tr></tbody></table></div><div class="dtp_timepicker"><table><tr><td class="dtp_spinner dtp_hover"><input type="text" class="ui_spinner_md" name="hour" ui-spinner="" ng-model="picker.time.hour" ng-change="picker.changeHour($value, $originValue)" min="-1" max="24" step="1" orientation="vertical"></td><td class="dtp_colon">:</td><td class="dtp_spinner dtp_minute"><input type="text" class="ui_spinner_md" name="minute" ng-model="picker.time.minute" ng-change="picker.changeMinute($value, $originValue)" ui-spinner="" min="-1" max="60" step="1" orientation="vertical"></td><td class="dtp_colon">:</td><td class="dtp_spinner dtp_second"><input type="text" class="ui_spinner_md" name="second" ng-model="picker.time.second" ng-change="picker.changeSeconds($value, $originValue)" ui-spinner="" min="-1" max="60" step="1" orientation="vertical"></td></tr></table></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/datetimepicker.html',
    '<span class="ui_datetimepicker" ng-class="{\'dtp_inline\':vm.inline, \'dtp_hide_datepicker\': !vm.datepicker, \'dtp_hide_timepicker\': !vm.timepicker, \'open\':vm.containerVisible}"><a class="btn btn-sm btn-primary dtp_viewer" ng-click="vm.toggleContainer()"><i class="glyphicon glyphicon-calendar" ng-if="!vm.timepicker"></i> <i class="glyphicon glyphicon-time" ng-if="vm.timepicker"></i> <span ng-bind="vm.ngModel.$modelValue"></span></a><div class="dtp_container"><input type="hidden" ui-datetimepicker-selector="" lang="{{vm.lang}}" ng-model="vm.viewValue"></div></span>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/default-tree-node-tpl.html',
    '<span class="ui_tree_node_icon"><i class="glyphicon" ng-if="nodeCtrl.hasChildren" ng-class="{false: \'glyphicon-plus\', true: \'glyphicon-minus\'}[nodeCtrl.opened]"></i></span><div class="ui_tree_node_content_text" ng-bind="nodeCtrl.data.text"></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/spinner.html',
    '<div class="ui_spinner input-group" ng-class="\'ui_spinner_\' + spinner.orientation"><script type="text/ng-template" id="widget_spinner_partials_decrement_btn"><a class="ui_spinner_btn decrement btn btn-default" ng-disabled="spinner.viewValue == spinner.min" ng-mousedown="spinner.startIncrement(spinner.decrementEvent)"> <i class="glyphicon glyphicon-minus"></i> </a></script><script type="text/ng-template" id="widget_spinner_partials_increment_btn"><a class="ui_spinner_btn increment btn btn-default" ng-disabled="spinner.viewValue == spinner.max" ng-mousedown="spinner.startIncrement(spinner.incrementEvent)"> <i class="glyphicon glyphicon-plus"></i> </a></script><span class="input-group-btn" ng-if="spinner.isHorizontal" ng-include="\'widget_spinner_partials_decrement_btn\'"></span> <span class="input-group-btn" ng-if="spinner.isVertical" ng-include="\'widget_spinner_partials_increment_btn\'"></span> <input type="text" ui-number="" class="ui_spinner_input form-control" ng-model="spinner.viewValue" ng-min="spinner.min" ng-max="spinner.max" step="{{spinner.step}}" number-type="{{spinner.numberType}}" ng-model-options="{updateOn:\'blur\'}" ng-blur="spinner.handleBlurEvent()" ng-keydown="spinner.handleKeydownEvent($event)" ng-keyup="spinner.stopIncrement()"> <span class="input-group-btn" ng-if="spinner.isHorizontal" ng-include="\'widget_spinner_partials_increment_btn\'"></span> <span class="input-group-btn" ng-if="spinner.isVertical" ng-include="\'widget_spinner_partials_decrement_btn\'"></span></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/sub_tree.html',
    '<ul class="ui_tree_node_list"><li ng-repeat="node in nodeCtrl.data.children track by node.id" class="ui_tree_node" ui-tree-node="" node-data="node"></li></ul>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/tree.html',
    '<div class="ui_tree"><ul class="ui_tree_node_list"><li ng-repeat="node in tree.rootTreeNodes track by node.id" ui-tree-node="" node-data="node"></li></ul></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ngUI.partials');
} catch (e) {
  module = angular.module('ngUI.partials', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('src/partials/bootstrap/widget/tree_node.html',
    '<li class="ui_tree_node" ng-class="{\'open\':nodeCtrl.opened}"><a href="javascript:;" class="ui_tree_node_content" ng-include="nodeCtrl.templateUrl" ng-click="nodeCtrl.toggle()" ng-keydown="nodeCtrl.onKeydown($event)"></a><div ng-if="nodeCtrl.hasChildren" class="ui_sub_tree" ng-include="\'{themed}/widget/sub_tree.html\'"></div></li>');
}]);
})();

});