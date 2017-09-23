'use strict';

require('co-mocha');
const axios = require('axios');
const expect = require('chai').expect;
const sinon = require('sinon');
const rewire = require('rewire');

const Telegram = rewire('../lib/telegram');

describe('Unit tests for lib/telegram', function () {
    context('Testing formUrl', function () {
        it('CASE 1: TELEGRAM_API_KEY set', function () {
            const method = 'example';
            const expectedResult = `https://api.telegram.org/bot123/${method}`;
            const formUrl = Telegram.__get__('formUrl');

            process.env.TELEGRAM_API_KEY = '123';
            const output = formUrl(method);
            delete process.env.TELEGRAM_API_KEY;

            expect(output).to.be.eql(expectedResult);
        });

        it('CASE 2: TELEGRAM_API_KEY not set', function () {
            const method = 'example';
            const expectedResult = `https://api.telegram.org/bot/${method}`;
            const formUrl = Telegram.__get__('formUrl');

            const output = formUrl(method);

            expect(output).to.be.eql(expectedResult);
        });
    });

    context('Testing sendMessage', function () {
        it('CASE 1: Request works as expected', function* () {
            const getExpectedResult = function () {
                return {
                    answer: 42
                };
            };
            sinon.stub(axios, 'post').callsFake(function () {
                return getExpectedResult();
            });

            const output = yield Telegram.sendMessage(1, 'Hello World!');

            expect(output).to.deep.eql(getExpectedResult());
        });
    });
});
