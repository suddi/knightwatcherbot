'use strict';

/* eslint camelcase: off */

const expect = require('chai').expect;
const sinon = require('sinon');

const Status = require('../../lib/enum/status');
const Telegram = require('../../lib/telegram');

function getBody() {
    return {
        message: {
            text: '/unknown',
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
    sinon.stub(Telegram, 'sendMessage', function (chatid, text) {
        expect(chatid).to.be.eql(getBody().message.chat.id);
        expect(text.startsWith('I don\'t know what to do with that.')).to.be.eql(true);
        return Promise.reject(new Error('Fail!'));
    });

    return [Telegram.sendMessage.restore];
};
