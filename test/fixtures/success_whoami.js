'use strict';

const Config = require('../../lib/config');
const Status = require('../../lib/enum/status');

const packageJson = require('../../package.json');

module.exports.getInput = function () {
    return {
        requestContext: {
            resourcePath: '/',
            httpMethod: 'GET'
        }
    };
};

module.exports.getAssertions = function () {
    const config = Config.get();

    return {
        meta: Status.get()['200'],
        data: {
            name: packageJson.name,
            version: config.VERSION
        }
    };
};
