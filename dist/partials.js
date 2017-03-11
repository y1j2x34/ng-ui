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
    '<a class="btn btn-xs btn-link" href="javascript:;" ng-click="accordion.toggleContent()"><i class="glyphicon" ng-class="{true: \'glyphicon-minus\',false: \'glyphicon-plus\'}[accordion.isVisible]"></i></a>');
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
  $templateCache.put('src/partials/bootstrap/grid/ui-grid.html',
    '<div><div class="grid_container" ng-class="{\'grid_fixedheader\': grid.fixHeader}"><div class="grid_header"><table class="table table-bordered" ui-grid-header=""><thead><tr><th ng-repeat="header in grid.grid.headers" class="grid_head" ui-grid-head-cell=""></th></tr></thead></table></div><div class="grid_body" ui-scrollbar="grid.gridBodyScrollbarOptions" box-height="{{grid.gridHeight}}"><table class="table table-hover table-bordered"><tbody><tr ui-grid-row="" ng-repeat="$rowdata in grid.grid.data" ng-init="$rowIndex = $index" class="grid_row" data-index="{{$index}}"><td ng-repeat="$column in grid.grid.columns" ui-grid-row-cell=""></td></tr></tbody></table><div class="text-center" ng-if="!grid.grid.data || grid.grid.data.length < 1"><h2>没有数据</h2></div></div><div class="grid_toolbar_container"><div ng-include="grid.footerTemplateUrl"></div></div></div></div>');
}]);
})();

});