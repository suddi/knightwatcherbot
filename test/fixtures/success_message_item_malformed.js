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
            resourcePath: '/message',
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

module.exports.mock = function (obj) {
    const getValues = function (key) {
        const value = {
            active: true,
            chatid: 1
        };
        return key ? value[key] : value;
    };

    sinon.stub(DB, 'getItem', function (params) {
        expect(params).to.deep.eql({
            Key: {
                username: getBody().username
            }
        });
        return Promise.resolve({});
    });

    sinon.stub(Telegram, 'sendMessage', function (chatid, text) {
        expect(chatid).to.be.eql(getValues('chatid'));
        expect(text).to.be.eql(getBody().text);
        return Promise.resolve({});
    });

    return [DB.getItem.restore, Telegram.sendMessage.restore];
};
