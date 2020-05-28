'use strict';

const _ = require('lodash');
const chai = require('chai');
const rewire = require('rewire');

const Telegram = rewire('../../lib/hooks/telegram');

const expect = chai.expect;

function applyAssertion({fn, help}, command) {
    expect(fn).is.a('function');
    expect(help).is.a('string');
}

describe('Unit tests for lib/hooks/telegram.js', function () {
    context('Testing getCommand', function () {
        const botNames = [
            'knightwatcherbot',
            'memoriesbot'
        ];

        _.map(botNames, function (botName, index) {
            it(`CASE ${index + 1}: Should return commands for ${botName}`, function () {
                const getCommandFn = Telegram.__get__('getCommand');

                const commands = getCommandFn(botName);

                _.map(commands, applyAssertion);
            });

            return botName;
        });
    });
});
