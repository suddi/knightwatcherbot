'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const Status = require('../../lib/enum/status');
const DB = require('../../lib/db');

function getBody() {
    return {
        username: 'user',
        text: 'Hello World!'
    };
}

module.exports.getInput = function () {
    return {
        requestContext: {
            resourcePath: '/v1/messages',
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

module.exports.mock = function (obj) {
    sinon.stub(DB, 'getItem').callsFake(function (params) {
        expect(params).to.deep.eql({
            Key: {
                username: { S: getBody().username },
                active: { N: '1' }
            }
        });
        return Promise.resolve({});
    });

    return [DB.getItem.restore];
};
