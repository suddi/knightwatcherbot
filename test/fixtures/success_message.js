'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const Status = require('../../lib/enum/status');
const DB = require('../../lib/db');
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
            resourcePath: '/v1/message',
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
            chatId: 1,
            active: true
        };
        return key ? value[key] : value;
    };

    sinon.stub(DB, 'getItem').callsFake(function (params) {
        expect(params).to.deep.eql({
            Key: {
                username: getBody().username,
                active: true
            }
        });
        return Promise.resolve({
            Item: getValues()
        });
    });

    sinon.stub(Telegram, 'sendMessage').callsFake(function (chatId, text) {
        expect(chatId).to.be.eql(getValues('chatId'));
        expect(text).to.be.eql(getBody().text);
        return Promise.resolve({});
    });

    return [DB.getItem.restore, Telegram.sendMessage.restore];
};
