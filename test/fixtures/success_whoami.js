'use strict';

const Status = require('../../lib/enum/status');

module.exports.getInput = function () {
    return {
        requestContext: {
            resourcePath: '/',
            httpMethod: 'GET'
        }
    };
};

module.exports.getAssertions = function () {
    return {
        meta: Status.get()['200'],
        data: {}
    };
};
