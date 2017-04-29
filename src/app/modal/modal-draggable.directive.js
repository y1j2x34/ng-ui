define([
    "./modal.module",
    "utils/random.util",
    "underscore"
], function(app, RandomUtil, _){
    "use strict";
    app.directive("uiModalDraggable", modalDraggableDirective);

    /* @ngInject */
    function modalDraggableDirective($document, $window){
        var directive = {
            restrict: "A",
            link: draggablePostLink
        };
        return directive;

        function draggablePostLink(scope, element, attrs){
            var draggable = scope.$eval(attrs.uiModalDraggable);
            if(!draggable){
                return;
            }
            attrs.$addClass("modal_draggable");

            var dialog = element.closest(".modal-dialog");
            var eventId = RandomUtil.unique(".");
            var offsetX, offsetY;
            var positionInitialized = false;
            var jqWin = angular.element($window);

            var winWidth = jqWin.width(), winHeight = jqWin.height();
            var maxRight = winWidth - dialog.outerWidth(),
                maxTop = winHeight - dialog.outerHeight();

            var updatePosition = _.throttle(function(newLeft, newTop){
                dialog.css({
                    "left": Math.min(maxRight, Math.max(0, newLeft)),
                    "top": Math.min(maxTop, Math.max(0,newTop))
                });
            }, 25);

            jqWin.on("resize"+eventId, _.throttle(function(){
                winWidth = jqWin.width();
                winHeight = jqWin.height();
                if(!positionInitialized){
                    initPosition();
                }else{
                    var offset = dialog.offset();
                    updatePosition(offset.left, offset.top);
                }
                maxRight = winWidth - dialog.outerWidth();
                maxTop = winHeight - dialog.outerHeight();
            }, 40));

            element.on("mousedown"+eventId, function(event){
                initPosition();
                var offset = dialog.offset();

                var pageX = event.screenX;
                var pageY = event.screenY;

                offsetX = pageX - offset.left;
                offsetY = pageY - offset.top;
                $document.on("mousemove"+eventId, onMouseMove);
            });

            $document.on("mouseup"+eventId, function(){
                $document.off("mousemove"+eventId);
            });
            function onMouseMove(event){
                var pageX = event.screenX;
                var pageY = event.screenY;
                var newLeft = pageX - offsetX;
                var newTop = pageY - offsetY;

                updatePosition(newLeft, newTop);
            }
            scope.$on("$destroy", function(){
                $document.off(eventId);
                jqWin.off(eventId);
            });
            function initPosition(){
                if(positionInitialized){
                    return;
                }
                positionInitialized = true;
                var offset = dialog.offset();

                dialog.css({
                    "left": offset.left - $document.scrollLeft(),
                    "top": offset.top - $document.scrollTop(),
                    "margin": 0,
                    "position": "fixed"
                });
            }
        }
    }
});