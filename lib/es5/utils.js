"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsergeekUtils = exports.warn = exports.log = exports.delayPromise = exports.getSharedFunctionDataPrincipal = exports.getSharedFunctionData = exports.isErrWrongTopology = exports.isErrApi = exports.isErrTemporarilyUnavailable = exports.createErrRestart = exports.createErrRetry = exports.createErrFatal = exports.createProceedResult = exports.createErrResult = exports.createOkResult = exports.isProceed = exports.isErr = exports.isOk = exports.hasOwnProperty = void 0;
var okResultKey = "ok";
var errResultKey = "err";
var proceedResultKey = "proceed";
/**
 * We want to check if prop is a property key of obj
 * @param obj - object
 * @param prop - property
 */
function hasOwnProperty(obj, prop) {
    return obj && obj.hasOwnProperty(prop);
}
exports.hasOwnProperty = hasOwnProperty;
var isOk = function (obj) {
    return hasOwnProperty(obj, okResultKey);
};
exports.isOk = isOk;
var isErr = function (obj) {
    return hasOwnProperty(obj, errResultKey);
};
exports.isErr = isErr;
var isProceed = function (obj) {
    return hasOwnProperty(obj, proceedResultKey);
};
exports.isProceed = isProceed;
var createOkResult = function (value) {
    var _a;
    return _a = {}, _a[okResultKey] = value, _a;
};
exports.createOkResult = createOkResult;
var createErrResult = function (value) {
    var _a;
    return _a = {}, _a[errResultKey] = value, _a;
};
exports.createErrResult = createErrResult;
var createProceedResult = function (value) {
    var _a;
    return _a = {}, _a[proceedResultKey] = value, _a;
};
exports.createProceedResult = createProceedResult;
var createErrFatal = function () {
    return (0, exports.createErrResult)("fatal");
};
exports.createErrFatal = createErrFatal;
var createErrRetry = function () {
    return (0, exports.createErrResult)("retry");
};
exports.createErrRetry = createErrRetry;
var createErrRestart = function () {
    return (0, exports.createErrResult)("restart");
};
exports.createErrRestart = createErrRestart;
var isErrTemporarilyUnavailable = function (obj) {
    return hasOwnProperty(obj, "temporarilyUnavailable");
};
exports.isErrTemporarilyUnavailable = isErrTemporarilyUnavailable;
var isErrApi = function (obj) {
    return hasOwnProperty(obj, "api");
};
exports.isErrApi = isErrApi;
var isErrWrongTopology = function (obj) {
    return hasOwnProperty(obj, "wrongTopology");
};
exports.isErrWrongTopology = isErrWrongTopology;
var getSharedFunctionData = function (value) {
    try {
        if (Array.isArray(value)) {
            var newCoordinator = value;
            if (newCoordinator.length === 2) {
                debugger;
                var principal = newCoordinator[0]; //Principal.from(newCoordinator[0])
                var methodName = newCoordinator[1];
                return [principal, methodName];
            }
        }
    }
    catch (e) {
        (0, exports.warn)("util.getSharedFunctionData", e);
    }
    return undefined;
};
exports.getSharedFunctionData = getSharedFunctionData;
var getSharedFunctionDataPrincipal = function (value) {
    try {
        if (Array.isArray(value)) {
            var newCoordinator = value;
            if (newCoordinator.length === 2) {
                var principal = newCoordinator[0]; //Principal.from(newCoordinator[0])
                return principal;
            }
        }
    }
    catch (e) {
        (0, exports.warn)("util.getSharedFunctionDataPrincipal", e);
    }
    return undefined;
};
exports.getSharedFunctionDataPrincipal = getSharedFunctionDataPrincipal;
var delayPromise = function (duration) {
    return new Promise(function (resolve) { return setTimeout(resolve, duration); });
};
exports.delayPromise = delayPromise;
function log() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    dumpToWindow("log", args);
    // if (process.env.NODE_ENV === "development") {
    //     console.log.apply(null, ["DEV LOG", ...args])
    // }
}
exports.log = log;
var warn = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    dumpToWindow("warn", args);
    // if (process.env.NODE_ENV === "development") {
    //     console.warn.apply(null, ["DEV WARN", ...args])
    // }
};
exports.warn = warn;
var usergeekLogName = "UsergeekLog";
var debugSequenceId = 0;
function dumpToWindow(ctx, value) {
    window[usergeekLogName] = window[usergeekLogName] || {};
    window[usergeekLogName][ctx] = window[usergeekLogName][ctx] || [];
    window[usergeekLogName][ctx].push(__spreadArray([debugSequenceId++, new Date().getTime()], value, true));
    if (window[usergeekLogName][ctx].length >= 1000) {
        window[usergeekLogName][ctx].splice(0, 100);
    }
}
var UsergeekUtils = /** @class */ (function () {
    function UsergeekUtils() {
    }
    UsergeekUtils.getCurrentTime = function () {
        return new Date().getTime();
    };
    UsergeekUtils.isString = function (value) {
        return typeof value === "string" || value instanceof String;
    };
    UsergeekUtils.isStringEmpty = function (value) {
        if (!UsergeekUtils.isString(value)) {
            return true;
        }
        var stringValue = value;
        return stringValue.length === 0;
    };
    UsergeekUtils.isNil = function (value) {
        return value == null;
    };
    UsergeekUtils.isNumber = function (value) {
        return typeof value === 'number' ||
            (UsergeekUtils.isObjectLike(value) && UsergeekUtils.getTag(value) === '[object Number]');
    };
    UsergeekUtils.isMap = function (value) {
        return value instanceof Map;
    };
    UsergeekUtils.isArray = function (value) {
        return value instanceof Array || Array.isArray(value);
    };
    UsergeekUtils.isObjectLike = function (value) {
        return typeof value === 'object' && value !== null;
    };
    UsergeekUtils.getTag = function (value) {
        if (value == null) {
            return value === undefined ? '[object Undefined]' : '[object Null]';
        }
        return toString.call(value);
    };
    UsergeekUtils.parseJSONSafe = function (value) {
        try {
            return JSON.parse(value);
        }
        catch (e) {
        }
        return undefined;
    };
    UsergeekUtils.getSize = function (value) {
        if (UsergeekUtils.isNil(value)) {
            return 0;
        }
        if (UsergeekUtils.isMap(value)) {
            return value.size;
        }
        if (UsergeekUtils.isObjectLike(value)) {
            return Object.keys(value).length;
        }
        if (UsergeekUtils.isArray(value) || UsergeekUtils.isString(value)) {
            return value.length;
        }
        return 0;
    };
    UsergeekUtils.jsonStringifyWithBigInt = function (value) {
        return JSON.stringify(value, function (key, value) {
            return typeof value === "bigint" ? value.toString() + "n" : value;
        });
    };
    UsergeekUtils.jsonParseWithBigInt = function (value) {
        return JSON.parse(value, function (key, value) {
            if (typeof value === "string" && /^\d+n$/.test(value)) {
                return BigInt(value.substr(0, value.length - 1));
            }
            return value;
        });
    };
    return UsergeekUtils;
}());
exports.UsergeekUtils = UsergeekUtils;
//# sourceMappingURL=utils.js.map