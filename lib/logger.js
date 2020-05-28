'use strict';

/* eslint no-console:off */

const _ = require('lodash');

_.templateSettings.interpolate = /{([\s\S]+?)}/g;

function accessLog(fn) {
    return function (req) {
        const output = fn(req);

        const compiled = _.template(req.context.path);
        console.log({
            method: req.context.method,
            path: compiled(req.pathParams),
            routeKey: `${req.context.method} ${req.context.path}`
        });
        return output;
    };
}

function accessLogExtensive(fn) {
    return function (req) {
        const output = fn(req);

        console.log(req);
        const compiled = _.template(req.context.path);
        console.log({
            method: req.context.method,
            path: compiled(req.pathParams),
            routeKey: `${req.context.method} ${req.context.path}`
        });
        return output;
    };
}

module.exports = {
    debug: console.debug,
    info: console.log,
    warn: console.warn,
    error: console.error,
    fatal: console.error,

    accessLog,
    accessLogExtensive
};
