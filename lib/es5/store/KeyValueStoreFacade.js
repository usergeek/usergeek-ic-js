"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyValueStoreFacade = exports.grabLocalStorage = void 0;
var LocalStorageKeyValueStore_1 = require("./LocalStorageKeyValueStore");
var InMemoryKeyValueStore_1 = require("./InMemoryKeyValueStore");
var grabLocalStorage = function () {
    return window.localStorage;
};
exports.grabLocalStorage = grabLocalStorage;
var checkLocalStorage = function () {
    try {
        var storage = (0, exports.grabLocalStorage)();
        var testKey = "ug-ic_test_ls";
        storage.setItem(testKey, "_");
        storage.removeItem(testKey);
        return true;
    }
    catch (e) {
        return false;
    }
};
var isLocalStorageSupported = checkLocalStorage();
var createStore = function (namespace) {
    if (namespace === void 0) { namespace = ""; }
    if (isLocalStorageSupported) {
        return new LocalStorageKeyValueStore_1.LocalStorageKeyValueStore(namespace);
    }
    else {
        return new InMemoryKeyValueStore_1.InMemoryKeyValueStore();
    }
};
exports.KeyValueStoreFacade = {
    createStore: createStore,
};
//# sourceMappingURL=KeyValueStoreFacade.js.map