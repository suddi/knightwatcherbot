'use strict';

require('co-mocha');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const sinon = require('sinon');

const KnightWatcherBot = require('../lib');

function getFixturesPath(filename) {
    const dir = 'fixtures';
    if (filename) {
        return path.join(__dirname, dir, filename);
    }
    return path.join(__dirname, dir);
}

function mock(mockFunction) {
    return mockFunction ? mockFunction() || [] : [];
}

function revert(revertFunctions) {
    return revertFunctions.map(function (revertFunction) {
        return revertFunction();
    });
}

function safeJsonParse(body) {
    try {
        return JSON.parse(body);
    } catch (error) {
        return body;
    }
}

function assert(assertions, result) {
    const responseBody = safeJsonParse(result.body);
    if (_.isString(responseBody)) {
        return expect(responseBody).to.be.eql(assertions);
    }

    _.map(assertions, function (body, expectedValue, bodyPath) {
        const value = _.get(body, bodyPath);
        if (typeof value === 'object') {
            expect(value).to.deep.eql(expectedValue);
        } else {
            expect(value).to.be.eql(expectedValue);
        }
        return true;
    }.bind(null, responseBody));
}

function* runTest(testParams) {
    const spy = sinon.spy();
    const reverts = mock(testParams.mock);
    try {
        yield KnightWatcherBot.proxyRouter(testParams.getInput(), {
            done: spy
        });
        revert(reverts);
        return spy;
    } catch (error) {
        revert(reverts);
        throw error;
    }
}

describe('Integration tests for knightwatcherbot lambda function', function () {
    const filenames = fs.readdirSync(getFixturesPath()).filter(function (filename) {
        return filename.endsWith('.js');
    });

    filenames.map(function (filename, index) {
        it(`CASE ${index + 1}: Testing ${filename}`, function* () {
            const T = require(getFixturesPath(filename));
            const spy = yield runTest(T);

            expect(spy.calledOnce).to.be.eql(true);
            const output = spy.args[0];
            expect(output[0]).to.be.eql(null);
            return assert(T.getAssertions(), output[1] || {});
        });
        return filename;
    });
});
