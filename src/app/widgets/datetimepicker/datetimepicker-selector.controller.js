define([
    "angular",
    "../widget.module",
    "underscore",
    "moment"
], function(angular, app, moment){
    "use strict";
    var isNumber = angular.isNumber;

    app.controller("DatetimepickerSelectorController", DatetimepickerController);

    // @ngInject
    function DatetimepickerController($scope){
        var self = this;
        self.locale = locale;
        self.directivePostLink = angular.noop;
        self.directivePreLink = directivePreLink;
        self.changeSeconds = changeSeconds;
        self.changeMinute = changeMinute;
        self.changeHour = changeHour;
        self.updateViewTime = updateViewTime;
        self.updateCalendar = updateCalendar;
        self.selectDate = selectDate;
        self.switchDateOnMouseWheel = switchDateOnMouseWheel;
        self.nextMonth = nextMonth;
        self.previewMonth = previewMonth;
        self.selectMonth = selectMonth;
        self.selectYear = selectYear;
        self.yearSelectorFocus = yearSelectorFocus;
        self.monthSelectorFocus = monthSelectorFocus;

        activate();

        function activate(){
            self.scrollbarOptions = {
                mouseWheelPixels: 70,
                theme: "minimal-dark"
            };
            self.selectionYears = [];
            var min = 1950;
            var max = moment().year() + 50;
            for(var i = min; i <= max; i++ ){
                self.selectionYears.push(i);
            }
        }

        function directivePreLink(ngModel, parsedModel){
            self.showMonthSelector = false;
            self.showYearSelector = false;
            self.locale = moment.localeData(self.lang);
            self.calendar = { };
            self.ngModel = ngModel;
            self.parsedModel = parsedModel;
            ngModel.$render();
        }
        /**
         * 切换语言
         * @param  {String} lang language
         * @return {Object}      localeData
         */
        function locale(lang){
            self.locale = moment.localeData(lang);
            return self.locale;
        }
        /**
         * 展开年份列表事件
         * @param  {object} scrollbarModel 年份列表滚动条
         * @return {void}
         */
        function yearSelectorFocus(scrollbarModel){
            self.showYearSelector = true;
            scrollbarModel.scrollTo(self.selectionYears.indexOf(self.viewValue.year) * 21.6);
        }
        /**
         * 展开月份列表事件
         * @param  {object} scrollbarModel 月份列表滚动条
         * @return {void}
         */
        function monthSelectorFocus(scrollbarModel){
            self.showMonthSelector = true;
            scrollbarModel.scrollTo(self.viewValue.month * 21.8 );
        }
        function selectMonth(month){
            var currentMonth = self.viewValue.month;
            addToTimeField("M", month - currentMonth);
        }
        function selectYear(year){
            var currentYear = self.viewValue.year;
            addToTimeField("Y", year - currentYear);
        }
        /**
         * 鼠标在日期列表上滚动事件
         * @param  {Object} $event jquery-mousewheel 事件对象
         * @return {void}
         */
        function switchDateOnMouseWheel($event){
            var deltaY = $event.deltaY;
            var field;
            if($event.ctrlKey){
                if($event.shiftKey){
                    field = "Y";
                }else{
                    field = "M";
                }
            }else{
                field = "d";
            }
            $scope.$apply(function(){
                addToTimeField(field, -deltaY);
            });

            $event.stopPropagation();
            $event.preventDefault();
        }
        /**
         * 切换到下个月按钮
         * @return {[type]} [description]
         */
        function nextMonth(){
            addToTimeField("M", 1);
        }
        /**
         * 切换到上个月按钮
         * @return {[type]} [description]
         */
        function previewMonth(){
            addToTimeField("M", -1);
        }

        /**
         * 用户点击日期事件
         * @param  {Object} weekday {time: moment}
         * @return {void}
         */
        function selectDate(weekday){
            self.parsedModel.assign($scope.$parent, +weekday.time);
        }
        /**
         * 使用该事件更新时间表
         * @param  {moment} time 时间
         * @return {void}
         */
        function updateCalendar(time){
            var days = [];
            var i, t;

            var m = moment(+time);
            m.set("D", 1);

            var firstWeekday = m.weekday();

            m.subtract("d", firstWeekday + 1);

            for(i = 1; days.length<42;i++){
                t = moment(+m);
                t.add("d", i);
                days.push(dayInfo(t));
            }

            var result = [];

            for(i = 0; i<7; i++){
                result.push(days.splice(0, 7));
            }

            self.calendar.dateInfo = result;

            function dayInfo(t){
                var month = t.month();
                var dayOfMonth = t.date();
                var isCurrentMonth = month === self.viewValue.month;
                var isCurrentDate = dayOfMonth === self.viewValue.dayOfMonth && isCurrentMonth;
                return {
                    time: t,
                    isCurrentDate: isCurrentDate,
                    isCurrentMonth: isCurrentMonth,
                    year: t.year(),
                    month: month,
                    dayOfWeek: t.weekday(),
                    week: t.week(),
                    dayOfMonth: dayOfMonth
                };
            }
        }
        function changeHour(value, oldValue){
            addToTimeField("H", value - oldValue);
        }
        function changeMinute(value, oldValue){
            addToTimeField("m", value - oldValue);
        }
        function changeSeconds(value, oldValue){
            addToTimeField("s", value - oldValue);
        }
        function addToTimeField(field, offset){
            if(isNaN(offset) || offset === 0 || !isFinite(offset) || !isNumber(offset)){
                return;
            }
            var m = moment(self.ngModel.$modelValue);
            m.add(field, offset);
            self.parsedModel.assign($scope.$parent, 0+m);
        }
        function updateViewTime(m){
            self.time = {
                hour: m.hour(),
                minute: m.minute(),
                second: m.second()
            };
        }
    }

});