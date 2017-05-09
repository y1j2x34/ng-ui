# ng-ui

## Status

## 控件/功能
- validation(vld-form-group, vld-message)
- datetimepicker(datepicker, timepicker)
- spinner
- logger
- grid
- listview
- notify
- scrollbar
- modal
- ajax service
- Class.js

## 准备环境
- 安装nodejs, npm(随nodejs安装的)
- 全局安装gulp `npm install -g gulp`
- ng-ui工程根目录执行 `npm install`

## 开发命令

- `gulp jshint`
- `gulp compile-scss` 编译scss
- `gulp html2js` ng-html2js
- `gulp karma` karma 运行测试
- `gulp optimizejs` jshint, html2js, 合并、压缩脚本
- `gulp watch`  监听src/style/\*\*/\*.scss的文件变化，执行compile-scss


## 使用

```
bower install ng-ui
```

```html
<head>
    <link rel="stylesheet" href="/bower_components/ng-ui/dist/css/ng-ui.css">
</head>
<body>
    <script src="/bower_components/requirejs/require" data-main="main" charset="utf-8"></script>
</body>
```
main.js
```js
require.config({
    paths:{
        "ngUI": "/bower_components/ng-ui/dist/ng-ui",
        "angular": "/bower_components/angular/angular",
        "underscore": "/bower_components/underscore/underscore",
        "jquery": "/bower_components/jquery/dist/jquery",
        "angular-sanitize": "/bower_components/angular-sanitize/angular-sanitize",
        "jquery-mousewheel": "/bower_components/jquery-mousewheel/jquery-mousewheel",
        "jquery.scrollbar": "/bower_components/scrollbar-plugin/jQuery.mCustomScrollbar",
        "listview": "/bower_components/listview/dist/listview",
        "moment": "/bower_components/moment/min/moment.min",
        "pnotify": "/bower_components/pnotify/dist/pnotify",
        "pnotify.buttons": "/bower_components/pnotify/dist/pnotify.buttons"
    },
    bundles: {
        "ngUI": ["ng-ui-app"],
        "listview": ["listview.plugin"]
    },
    shim: {
        "angular": {
            exports: "angular",
            deps:["jquery"]
        },
        "underscore": {
            exports: "_"
        },
        "angular-sanitize": ["angular"]
    }
});
```