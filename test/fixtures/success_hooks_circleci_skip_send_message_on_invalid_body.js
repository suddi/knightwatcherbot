'use strict';

/* eslint camelcase: off */
const Status = require('../../lib/enum/status');

function getBody() {
    return {};
}

module.exports.getInput = function () {
    return {
        requestContext: {
            resourcePath: '/v1/hooks/circleci',
            httpMethod: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        queryStringParameters: {},
        body: getBody()
    };
};

module.exports.getAssertions = function () {
    return {
        meta: Status.get()['200'],
        data: {}
    };
};
