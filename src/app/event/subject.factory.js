define([
    "app",
    "./subject"
], function(app, Subject) {
    "use strict";

    app.factory("Subject", subjectFactory);

    function subjectFactory() {
        return Subject;
    }
});
