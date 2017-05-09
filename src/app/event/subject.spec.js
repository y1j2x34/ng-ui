// (function() {
//     "use strict";
//     var Subject = require("./subject");
//
//     var subject = new Subject();
//     subject.on("click, hover", function() {
//         console.info("touch me!");
//     });
//     subject.trigger("click");
//     subject.trigger("hover");
//     describe("subject",);
// })();
define([
    "./subject"
], (Subject) => {
    describe("Subject", () => {
        it("正常触发绑定的事件", () => {
            var subject = new Subject();
            var touched = false;
            subject.on("touch", () => {
                touched = true;
            });
            subject.trigger("touch");
            expect(touched).toBeTruthy();
        });
        it("正常解绑事件", () => {
            var subject = new Subject();
            var touched = false;
            subject.on("touch", () => {
                touched = true;
            });
            subject.off("touch");
            subject.trigger("touch");
            expect(touched).toBeFalsy();
        });
        it("允许在同一个处理器上同时绑定多个事件", () => {
            var subject = new Subject();
            var touched = false;
            subject.on("click, hover", () => {
                touched = true;
            });
            subject.trigger("click");
            expect(touched).toBeTruthy();
            touched = false;
            subject.trigger("hover");
            expect(touched).toBeTruthy();
        });
        it("允许使用事件别名", () => {
            var subject = new Subject();
            var touched = false;
            subject.on("touch.a", () => {
                touched = true;
            });
            subject.trigger("touch");
            expect(touched).toBeTruthy();
            touched = false;
            subject.trigger("touch.a");
            expect(touched).toBeTruthy();
            touched = false;
            subject.trigger(".a");
            expect(touched).toBeTruthy();
        });
        it("绑定的事件只生效一次", () => {
            var subject = new Subject();
            var seq = 0;
            subject.one("touch", () => {
                seq ++;
            });
            subject.trigger("touch");
            subject.trigger("touch");
            expect(seq).toBe(1);
        });
    });
});