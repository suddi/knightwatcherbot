'use strict';

/* eslint camelcase: off */
const Status = require('../../lib/enum/status');

function getBotName() {
    return 'testbot';
}

function getBody() {
    return {};
}

module.exports.getInput = function () {
    return {
        requestContext: {
            resourcePath: '/v1/{botName}/hooks/{hookType}',
            httpMethod: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        pathParameters: {
            botName: getBotName(),
            hookType: 'circleci'
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
