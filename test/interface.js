'use strict';

const expect = require('chai').expect;
const rewire = require('rewire');

const Interface = rewire('../lib/interface');
const Status = require('../lib/enum/status');

describe('Unit tests for lib/interface', function () {
    context('Testing generateResponse', function () {
        it('CASE 1: When statusCode does not exist', function () {
            const statusCode = -1;
            const responseBody = {answer: 42};
            const generateResponse = Interface.__get__('generateResponse');
            const expectedResult = {
                statusCode: 500,
                body: {
                    meta: Status.get()[500],
                    data: {}
                }
            };

            const output = generateResponse(statusCode, responseBody);

            expect(output).to.deep.eql(expectedResult);
        });
    });
});
