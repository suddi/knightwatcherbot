'use strict';

/* eslint camelcase: off */

const expect = require('chai').expect;
const sinon = require('sinon');

const Status = require('../../lib/enum/status');
const DB = require('../../lib/db');
const Telegram = require('../../lib/telegram');

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
            resourcePath: '/command',
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
    sinon.stub(DB, 'putItem', function (params) {
        const body = getBody().message.chat;
        expect(params).to.deep.eql({
            Item: {
                username: body.username,
                firstname: body.first_name,
                chatid: body.id,
                active: true
            }
        });
        return Promise.resolve();
    });

    sinon.stub(Telegram, 'sendMessage', function (chatid, text) {
        expect(chatid).to.be.eql(getBody().message.chat.id);
        expect(text.startsWith('Added user')).to.be.eql(true);
        return Promise.resolve({});
    });

    return [DB.putItem.restore, Telegram.sendMessage.restore];
};
