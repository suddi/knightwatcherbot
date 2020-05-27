'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const Config = require('../../lib/config');
const DB = require('../../lib/db');
const Status = require('../../lib/enum/status');

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

module.exports.mock = function () {
    const config = Config.get();
    sinon.stub(DB, 'query').callsFake(function (params) {
        expect(params).to.deep.eql({
            IndexName: config.USERNAME_INDEX,
            ExpressionAttributeValues: {
                ':username': {
                    S: getBody().username
                },
                ':active': {
                    N: '1'
                }
            },
            ProjectionExpression: 'chatId',
            KeyConditionExpression: 'username = :username AND active = :active'
        });
        return Promise.reject(new Error('Fail!'));
    });

    return [DB.query.restore];
};
