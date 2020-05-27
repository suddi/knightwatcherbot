'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const Config = require('../../lib/config');
const DB = require('../../lib/db');
const Status = require('../../lib/enum/status');
const Telegram = require('../../lib/telegram');

function getBody() {
    return {
        username: 'user',
        text: 'Hello World!'
    };
}

module.exports.getInput = function () {
    return {
        requestContext: {
            resourcePath: '/v1/messages',
            httpMethod: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
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
    const getValues = function (key) {
        const value = {
            chatId: { N: '1' },
            active: { N: '1' }
        };
        return key ? value[key] : value;
    };

    sinon.stub(DB, 'query').callsFake(function (params) {
        expect(params).to.deep.eql({
            IndexName: Config.USERNAME_INDEX,
            ExpressionAttributeValues: {
                ':username': {
                    S: getBody().username
                },
                ':active': {
                    N: '1'
                }
            },
            ProjectionExpression: 'chatId',
            KeyConditionExpression: 'username = :username AND active = :active'
        });
        return Promise.resolve({
            Item: getValues()
        });
    });

    sinon.stub(Telegram, 'sendMessage').callsFake(function (chatId, text) {
        expect(chatId).to.be.eql(getValues('chatId').N);
        expect(text).to.be.eql(getBody().text);
        return Promise.resolve({});
    });

    return [DB.query.restore, Telegram.sendMessage.restore];
};
