'use strict';

/* eslint no-console:off */

const _ = require('lodash');

const Config = require('./config');

_.templateSettings.interpolate = /{([\s\S]+?)}/g;

function initLogger(logFn) {
    const config = Config.get();
    return function (jsonLog) {
        /* istanbul ignore if */
        if (config.ENV !== 'test') {
            return logFn(jsonLog);
        }
    };
}

function accessLog(fn) {
    const log = initLogger(console.log);
    return function (req) {
        const output = fn(req);

        const compiled = _.template(req.context.path);
        log({
            method: req.context.method,
            path: compiled(req.pathParams),
            routeKey: `${req.context.method} ${req.context.path}`
        });
        return output;
    };
}

module.exports = {
    debug: initLogger(console.debug),
    info: initLogger(console.log),
    warn: initLogger(console.warn),
    error: initLogger(console.error),
    fatal: initLogger(console.error),

    accessLog
};
