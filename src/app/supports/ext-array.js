(function(factory){
    "use strict";
    if(typeof module === "object" && module.exports){
        require("./pythonic");
        module.exports = factory();
    }else if(typeof define === "function" && define.amd){
        define([
            "./pythonic"
        ], factory);
    }else{
        factory();
    }
})(function(){
    "use strict";
    Array.prototype.remove = remove.pythonic();
    Array.prototype.removeFirst = removeFirst.pythonic();
    Array.prototype.removeWhere = removeWhere.pythonic();

    function remove(self, element){
        var removed = [];
        var lastIndex = 0;

        while(self.length > 0){
            var index = self.indexOf(element, lastIndex);
            if(index === -1){
                return removed;
            }else{
                lastIndex = index;
                var curRemoved = self.splice(index, 1);
                removed.push.apply(removed, curRemoved);
            }
        }
        return removed;
    }

    function removeFirst(self, element){
        var index = self.indexOf(element);
        if(index !== -1){
            return self.splice(index, 1);
        }else{
            return [];
        }
    }
    function removeWhere(self, acceptFilter){
        if(!acceptFilter){
            return [];
        }
        var removed = [];
        for(var i =0;i<self.length;i++){
            var toRemove = acceptFilter(self[i]);
            if(toRemove === "break"){
                break;
            }
            if(toRemove){
                removed.push(self[i]);
                self.splice(i, 1);
            }
        }
        return removed;
    }

});
