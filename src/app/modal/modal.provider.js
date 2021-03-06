define([
    "./modal.module"
], function(app){
    "use strict";
    app.provider("$modal", ModalProvider);

    /* @ngInject */
    function ModalProvider(){
        var self = this;
        self.options = {
            headerTemplateUrl: "{themed}/widget/modal/header.html",
            footerTemplateUrl: "{themed}/widget/modal/footer.html",
            bodyTemplateUrl: "{themed}/widget/modal/body.html",
            controllerAs: "$ctrl"
        };
        self.defaultPromptLabel = "请输入：";
        self.defaultPromptWarningMessage = "内容不能为空！";
        self.promptHeaderTemplateUrl = "none";
        self.promptFooterTemplateUrl = "{themed}/widget/modal/prompt-footer.html";
        self.promptBodyTemplateUrl = "{themed}/widget/modal/prompt-body.html";

        self.defaultAlertTitle = "确定要继续？";
        self.contentTemplateUrl = "{themed}/widget/modal/content.html";
        self.confirmFooterTemplateUrl = "{themed}/widget/modal/confirm-footer.html";
        self.confirmHeaderTemplateUrl = "none";

        self.alertHeaderTemplateUrl = "none";
        self.alertBodyTemplateUrl = "{themed}/widget/modal/alert-body.html";
        self.alertFooterTemplateUrl = "{themed}/widget/modal/alert-footer.html";

        self.$get = instanceRef;
        self.config = config;

        function instanceRef(){
            return self;
        }

        function config(cfg){
            var defaultOptions = cfg.options;
            angular.extend(self.options, defaultOptions);
            self.defaultConfirmMessage = cfg.defaultConfirmMessage || self.defaultConfirmMessage;
        }
    }
});