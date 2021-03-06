'use strict';

/* eslint camelcase: off */

const expect = require('chai').expect;
const sinon = require('sinon');

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
    process.env[`${botName}_WEBHOOK_API_KEY`] = getApiKey();
}

function deleteEnv() {
    const botName = getBotName().toUpperCase();
    delete process.env[`${botName}_TELEGRAM_API_KEY`];
    delete process.env[`${botName}_WEBHOOK_API_KEY`];
}

function getBody() {
    return {
        message: {
            text: '/add',
            chat: {
                id: 1,
                username: 'user',
                first_name: 'John'
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

    sinon.stub(DB, 'putItem').callsFake(function (params) {
        const body = getBody().message.chat;
        expect(params).to.deep.eql({
            Item: {
                chatId: { N: body.id.toString() },
                username: { S: body.username },
                firstName: { S: body.first_name },
                lastName: { S: '' },
                active: { N: '1' }
            },
            ReturnConsumedCapacity: 'NONE',
            ReturnItemCollectionMetrics: 'NONE',
            ReturnValues: 'NONE'
        });
        return Promise.resolve();
    });

    sinon.stub(Telegram, 'sendMessage').callsFake(function (botName, chatId, text) {
        expect(botName).to.be.eql(getBotName());
        expect(chatId).to.be.eql(getBody().message.chat.id);
        expect(text.startsWith('Added user')).to.be.eql(true);
        return Promise.resolve({});
    });

    return [deleteEnv, DB.putItem.restore, Telegram.sendMessage.restore];
};
