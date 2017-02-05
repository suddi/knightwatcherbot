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
            text: '/add',
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
            resourcePath: '/hooks/telegram',
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

    sinon.stub(DB, 'putItem', function (params) {
        const body = getBody().message.chat;
        expect(params).to.deep.eql({
            Item: {
                username: body.username,
                firstname: body.first_name,
                lastname: body.last_name,
                chatId: body.id,
                active: true
            }
        });
        return Promise.resolve();
    });

    sinon.stub(Telegram, 'sendMessage', function (chatId, text) {
        expect(chatId).to.be.eql(getBody().message.chat.id);
        expect(text.startsWith('Added user')).to.be.eql(true);
        return Promise.resolve({});
    });

    return [deleteEnv, DB.putItem.restore, Telegram.sendMessage.restore];
};
