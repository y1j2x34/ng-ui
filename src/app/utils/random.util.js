define([
    "../supports/Class"
],function(Class){
    "use strict";

    var CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var HEX_CHARACTERS = "0123456789abcdefg";
    var counter = new Date().getTime();
    return Class.create({
        statics: {
            randomString: function(size){
                return randomString(size, CHARACTERS);
            },
            unique: function(prefix){
                return prefix + (counter++).toString(16);
            },
            randomHex: randomHex
        }
    });

    function randomHex(size){
        return randomString(size, HEX_CHARACTERS);
    }

    function randomString(size, optionsText){
        if(typeof size !== "number" || size < 1){
            size = 8;
        }
        var text = "";

        while(text.length < size){
            text += optionsText[Math.floor(Math.random() * optionsText.length)];
        }

        return text;
    }
});
