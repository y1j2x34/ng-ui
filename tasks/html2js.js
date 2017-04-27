module.exports = function(){
    var gulp = require("gulp");
    var ngHtml2Js = require("gulp-ng-html2js");

    function ngHtml2JsTask() {
        return gulp.src("./src/partials/**/*.html")
            .pipe(minifyHtml({
                "empty": true,
                "spare": true,
                "quotes": true
            }))
            .pipe(ngHtml2Js({
                "moduleName": "ngUI.partials",
                "prefix": "/src/partials/"
            }))
            .pipe(concat("partials.js"))
            .pipe(wrap({
                src: "wrap-partials.tpl"
            }, {}, {
                parse: false
            }))
            .pipe(gulp.dest("./dist"));
    }
};