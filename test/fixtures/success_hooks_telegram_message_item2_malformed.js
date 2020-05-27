'use strict';

/* eslint camelcase: off */

const expect = require('chai').expect;
const sinon = require('sinon');

const Status = require('../../lib/enum/status');
const DB = require('../../lib/db');
const Telegram = require('../../lib/telegram');

function getApiKey() {
    return '123';
}

function setEnv() {
    process.env.TELEGRAM_API_KEY = getApiKey();
}

function deleteEnv() {
    delete process.env.TELEGRAM_API_KEY;
}

function getBody() {
    return {
        message: {
            text: '/message anotheruser\nHi there, I\'m John Smith',
            chat: {
                id: 1,
                username: 'user',
                first_name: 'John',
                last_name: 'Smith'
            }
        }
    };
}

module.exports.getInput = function () {
    return {
        requestContext: {
            resourcePath: '/v1/hooks/telegram',
            httpMethod: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        queryStringParameters: {
            apiKey: getApiKey()
        },
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
    setEnv();

    const getValues = function (key) {
        const value = {
            active: 1,
            chatId: 1
        };
        return key ? value[key] : value;
    };

    sinon.stub(DB, 'getItem').callsFake(function (params) {
        if (params.Key.username === getBody().message.chat.username) {
            return Promise.resolve({
                Item: getValues()
            });
        }
        return Promise.resolve({});
    });

    sinon.stub(Telegram, 'sendMessage').callsFake(function (chatId, text) {
        expect(chatId).to.be.eql(getBody().message.chat.id);
        expect(text.startsWith('Failed to send message')).to.be.eql(true);
        return Promise.resolve();
    });

    return [deleteEnv, DB.getItem.restore, Telegram.sendMessage.restore];
};
