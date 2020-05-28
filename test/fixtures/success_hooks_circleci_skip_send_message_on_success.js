'use strict';

/* eslint camelcase: off */
const Status = require('../../lib/enum/status');

function getBotName() {
    return 'testbot';
}

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
