"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseValue = exports.stringifyValue = void 0;
var stringifyValue = function (obj) {
    return JSON.stringify(obj);
};
exports.stringifyValue = stringifyValue;
var parseValue = function (str) {
    try {
        if (str) {
            return JSON.parse(str);
        }
    }
    catch (e) {
        // nop
    }
    return str;
};
exports.parseValue = parseValue;
//# sourceMappingURL=KeyValueStore.js.map