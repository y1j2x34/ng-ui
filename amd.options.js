function createOptions(){
    "use strict";
    return {
        "baseUrl": "/src/app",
        "paths": {
            "jquery": "../../vendors/jquery/dist/jquery",
            "angular": "../../vendors/angular/angular",
            "angular-sanitize": "../../vendors/angular-sanitize/angular-sanitize"
        },
        "shim": {
            "angular": {
                "exports": "angular"
            },
            "angular-sanitize": {
                "deps": ["angular"]
            }
        }
    };
}

module.exports = createOptions();
