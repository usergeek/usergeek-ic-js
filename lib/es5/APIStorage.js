"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIStorage = void 0;
var utils_1 = require("./utils");
var KeyValueStoreFacade_1 = require("./store/KeyValueStoreFacade");
var store = KeyValueStoreFacade_1.KeyValueStoreFacade.createStore("ug-ic");
var Key_TopologyId = "coordinator__topologyId";
var Key_CanisterIds = "coordinator__canisterIds";
exports.APIStorage = {
    coordinator: {
        getTopologyId: function () {
            var value = store.get(Key_TopologyId);
            if (value) {
                return Number(value);
            }
            return undefined;
        },
        setTopologyId: function (value) {
            store.set(Key_TopologyId, JSON.stringify(value));
        },
        getCanisterIds: function () {
            try {
                var value = JSON.parse(store.get(Key_CanisterIds));
                if (value && Array.isArray(value)) {
                    return value;
                }
            }
            catch (e) {
                (0, utils_1.warn)("storage.getCanisterIds", e);
            }
            return [];
        },
        setCanisterIds: function (value) {
            store.set(Key_CanisterIds, JSON.stringify(value));
        },
    }
};
//# sourceMappingURL=APIStorage.js.map