'use strict';

const _ = require('lodash');
const expect = require('chai').expect;

function iterateAndAssert(body, assertions, keys, index) {
    if (index === keys.length) {
        return true;
    }

    const key = keys[index];
    const value = _.get(body, key);
    const expectedValue = assertions[key];
    if (typeof value === 'object') {
        expect(value).to.deep.eql(expectedValue);
    } else {
        expect(value).to.eql(expectedValue);
    }
    return iterateAndAssert(body)
}

function onResponse(assertions, error, result) {
    expect(error).to.eql(null);
    const responseBody = result.body ? JSON.parse(result.body) : {};
    const keys = Object.keys(responseBody);

    return iterateAndAssert(responseBody, assertions, keys.reverse(), 0);
}

module.exports = {
    onResponse: onResponse
};
