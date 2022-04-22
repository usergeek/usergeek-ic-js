"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryKeyValueStore = void 0;
var KeyValueStore_1 = require("./KeyValueStore");
var InMemoryKeyValueStore = /** @class */ (function () {
    function InMemoryKeyValueStore() {
        this.items = {};
    }
    InMemoryKeyValueStore.prototype.isFake = function () {
        return true;
    };
    InMemoryKeyValueStore.prototype.set = function (key, data) {
        this.items[key] = (0, KeyValueStore_1.stringifyValue)(data);
    };
    InMemoryKeyValueStore.prototype.get = function (key) {
        var storageValue = this.items[key];
        if (storageValue) {
            return (0, KeyValueStore_1.parseValue)(storageValue);
        }
        return undefined;
    };
    InMemoryKeyValueStore.prototype.remove = function (key) {
        delete this.items[key];
    };
    InMemoryKeyValueStore.prototype.clearAll = function () {
        this.items = {};
    };
    InMemoryKeyValueStore.prototype.isEmpty = function () {
        for (var key in this.items) {
            if (this.items.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    };
    return InMemoryKeyValueStore;
}());
exports.InMemoryKeyValueStore = InMemoryKeyValueStore;
//# sourceMappingURL=InMemoryKeyValueStore.js.map