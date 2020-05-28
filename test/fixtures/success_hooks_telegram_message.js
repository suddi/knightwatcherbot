'use strict';

/* eslint camelcase: off */

const expect = require('chai').expect;
const sinon = require('sinon');

const Config = require('../../lib/config');
const DB = require('../../lib/db');
const Status = require('../../lib/enum/status');
const Telegram = require('../../lib/telegram');

function getBotName() {
    return 'testbot';
}

function getApiKey() {
    return '123';
}

function setEnv() {
    const botName = getBotName().toUpperCase();
    process.env[`${botName}_TELEGRAM_API_KEY`] = getApiKey();
    process.env.WEBHOOK_API_KEY = getApiKey();
}

function deleteEnv() {
    const botName = getBotName().toUpperCase();
    delete process.env[`${botName}_TELEGRAM_API_KEY`];
    delete process.env.WEBHOOK_API_KEY;
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
            resourcePath: '/v1/{botName}/hooks/{hookType}',
            httpMethod: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        pathParameters: {
            botName: getBotName(),
            hookType: 'telegram'
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
    const config = Config.get();

    const getValues = function (key) {
        const value = {
            chatId: { N: 1 },
            active: { N: 1 }
        };
        return key ? value[key] : value;
    };

    sinon.stub(DB, 'getItem').callsFake(function (params) {
        const body = getBody().message.chat;
        expect(params).to.deep.eql({
            Key: {
                chatId: { N: body.id.toString() },
                active: { N: '1' }
            }
        });
        return Promise.resolve({
            Item: getValues()
        });
    });

    sinon.stub(DB, 'query').callsFake(function (params) {
        const recipient = (getBody().message.text.split(' ')[1] || '').split(/\n/)[0] || '';
        expect(params).to.deep.eql({
            IndexName: config.USERNAME_INDEX,
            ExpressionAttributeValues: {
                ':username': {
                    S: recipient
                },
                ':active': {
                    N: '1'
                }
            },
            ProjectionExpression: 'chatId',
            KeyConditionExpression: 'username = :username AND active = :active'
        });
        return Promise.resolve({
            Items: [getValues()]
        });
    });

    sinon.stub(Telegram, 'sendMessage').callsFake(function (botName, chatId, text) {
        expect(botName).to.be.eql(getBotName());
        expect(chatId).to.be.eql(getBody().message.chat.id);
        return Promise.resolve({});
    });

    return [deleteEnv, DB.getItem.restore, DB.query.restore, Telegram.sendMessage.restore];
};
