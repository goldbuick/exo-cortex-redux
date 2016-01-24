"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function debounce(fn, delay) {
    var timer = undefined;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(fn, delay);
    };
}

exports.default = debounce;