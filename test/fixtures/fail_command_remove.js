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
            text: '/remove',
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
        meta: Status.get()['500'],
        data: {}
    };
};

module.exports.mock = function () {
    sinon.stub(DB, 'updateItem', function (params) {
        const body = getBody().message.chat;
        expect(params).to.deep.eql({
            Item: {
                username: body.username,
                active: false
            }
        });
        return Promise.resolve();
    });

    sinon.stub(Telegram, 'sendMessage', function (chatid, text) {
        expect(chatid).to.be.eql(getBody().message.chat.id);
        expect(text.startsWith('Removed user')).to.be.eql(true);
        return Promise.reject(new Error('Fail!'));
    });

    return [DB.updateItem.restore, Telegram.sendMessage.restore];
};
