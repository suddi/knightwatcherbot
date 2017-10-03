'use strict';

/* eslint camelcase: off */

const expect = require('chai').expect;
const sinon = require('sinon');

const Config = require('../../lib/config');
const Status = require('../../lib/enum/status');
const Telegram = require('../../lib/telegram');

function getBody() {
    return {};
}

module.exports.getInput = function () {
    return {
        requestContext: {
            resourcePath: '/hooks/circle',
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
