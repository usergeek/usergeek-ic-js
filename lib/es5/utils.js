"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warn = exports.log = exports.delayPromise = exports.getSharedFunctionDataPrincipal = exports.getSharedFunctionData = exports.isErrWrongTopology = exports.isErrTemporarilyUnavailable = exports.createErrRestart = exports.createErrRetry = exports.createErrFatal = exports.createProceedResult = exports.createErrResult = exports.createOkResult = exports.isProceed = exports.isErr = exports.isOk = exports.hasOwnProperty = void 0;
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
var isErrWrongTopology = function (obj) {
    return hasOwnProperty(obj, "wrongTopology");
};
exports.isErrWrongTopology = isErrWrongTopology;
var getSharedFunctionData = function (value) {
    try {
        if (Array.isArray(value)) {
            var newCoordinator = value;
            if (newCoordinator.length === 2) {
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
}
exports.log = log;
var warn = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    dumpToWindow("warn", args);
};
exports.warn = warn;
var usergeekLogName = "UsergeekLog";
function dumpToWindow(ctx, value) {
    window[usergeekLogName] = window[usergeekLogName] || {};
    window[usergeekLogName][ctx] = window[usergeekLogName][ctx] || [];
    window[usergeekLogName][ctx].push(value);
}
//# sourceMappingURL=utils.js.map