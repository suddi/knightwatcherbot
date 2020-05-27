'use strict';

/* eslint camelcase: off */
const Status = require('../../lib/enum/status');

function getBody() {
    return {
        payload: {
            stop_time: '2017-10-01T20:00:00Z',
            outcome: 'success',
            username: 'smith',
            reponame: 'simple-code',
            build_url: 'https://circleci.com/gh/circleci/simple-code/22'
        }
    };
}

module.exports.getInput = function () {
    return {
        requestContext: {
            resourcePath: '/v1/hooks/circle',
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
