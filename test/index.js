'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;

const KnightWatcherBot = require('../lib');

function getFixturesPath(filename) {
    const dir = 'fixtures';
    if (filename) {
        return path.join(__dirname, dir, filename);
    }
    return path.join(__dirname, dir);
}

function assert(assertions, error, result) {
    expect(error).to.eql(null);
    const responseBody = result.body ? JSON.parse(result.body) : {};
    _.map(assertions, function (body, expectedValue, bodyPath) {
        const value = _.get(body, bodyPath);
        if (typeof value === 'object') {
            expect(value).to.deep.eql(expectedValue);
        } else {
            expect(value).to.eql(expectedValue);
        }
        return true;
    }.bind(null, responseBody));
}

function wrap(assertions) {
    const done = assert.bind(null, assertions);
    return {
        done: done
    };
}

describe('Integration test for knightwatcherbot lambda function', function () {
    const filenames = fs.readdirSync(getFixturesPath()).filter(function (filename) {
        return filename.endsWith('.js');
    });

    filenames.map(function (filename, index) {
        it(`CASE ${index + 1}: Testing ${filename}`, function () {
            const T = require(getFixturesPath(filename));
            KnightWatcherBot.proxyRouter(
                T.getInput(),
                wrap(T.getAssertions())
            );
        });
        return filename;
    });
});
