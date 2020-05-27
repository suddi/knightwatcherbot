'use strict';

/* eslint camelcase: off */

const expect = require('chai').expect;
const sinon = require('sinon');

const Config = require('../../lib/config');
const Status = require('../../lib/enum/status');
const Telegram = require('../../lib/telegram');

function getBody() {
    return {
        payload: {
            stop_time: '2017-10-01T20:00:00Z',
            outcome: 'timedout',
            username: 'smith',
            reponame: 'simple-code',
            build_url: 'https://circleci.com/gh/circleci/simple-code/22'
        }
    };
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

module.exports.mock = function () {
    const config = Config.get();

    sinon.stub(Telegram, 'sendMessage').callsFake(function (chatId, text) {
        expect(chatId).to.be.eql(config.DEFAULT_NOTIFIER);
        expect(text.startsWith('Failed build on CircleCI')).to.be.eql(true);
        return Promise.resolve({});
    });

    return [Telegram.sendMessage.restore];
};
