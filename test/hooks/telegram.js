'use strict';

const _ = require('lodash');
const chai = require('chai');

const Telegram = require('../../lib/hooks/telegram');

const expect = chai.expect;

function applyAssertion({fn, help, enabled}, command) {
    expect(fn).is.a('function');
    expect(help).is.a('string');
    expect(enabled).is.a('boolean');
}

describe('Unit tests for lib/hooks/telegram.js', function () {
    context('Testing getCommand', function () {
        const botNames = [
            'knightwatcherbot',
            'memoriesbot'
        ];

        _.map(botNames, function (botName, index) {
            it(`CASE ${index + 1}: Should return commands for ${botName}`, function () {
                const commands = Telegram.getCommand(botName);

                _.map(commands, applyAssertion);
            });

            return botName;
        });
    });
});
