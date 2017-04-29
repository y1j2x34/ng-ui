define([
    "supports/Class"
], function(Class){
    "use strict";
    return Class.singleton({
        init: function(self){
            self.modals = {};
        },
        get: get,
        put: put,
        remove: remove
    });
    function get(self, page, id) {
        var pagesModal = self.modals[page];
        if (pagesModal && pagesModal && id !== undefined) {
            return pagesModal[id];
        } else {
            return pagesModal;
        }
    }

    function put(self, page, id, modal) {
        var pagesModals = getOrDefault(self.modals, page);
        if (pagesModals[id]) {
            throw new Error("Duplicated modal id :" + id);
        } else {
            pagesModals[id] = modal;
        }
    }

    function getOrDefault(obj, name) {
        var val = obj[name];
        if (!val) {
            val = {};
            obj[name] = val;
        }
        return val;
    }

    function remove(self, page, id) {
        var pageModals = self.modals[page];
        if (pageModals) {
            if (pageModals[id]) {
                var modal = pageModals[id];
                modal.destroy();
                try {
                    delete pageModals[id];
                } catch (e) {
                    pageModals[id] = undefined;
                }
            } else {
                for (var i in pageModals) {
                    var modalItem = pageModals[i];
                    if(!modalItem.destroyed){
                        modalItem.destroy();
                    }
                }
                self.modals = {};
            }
        }
    }
});