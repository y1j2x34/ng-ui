(function() {
    "use strict";
    var Subject = require("./subject");

    var subject = new Subject();
    subject.on("click, hover", function() {
        console.info("touch me!");
    });
    subject.trigger("click");
    subject.trigger("hover");
})();
