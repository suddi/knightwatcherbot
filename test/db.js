'use strict';

require('co-mocha');
const rewire = require('rewire');
const expect = require('chai').expect;

const DB = rewire('../lib/db');

function getTableName() {
    return '123';
}

describe('Unit tests for lib/db', function () {
    before(function () {
        process.env.TABLENAME = getTableName();
    });

    after(function () {
        delete process.env.TABLENAME;
    });

    context('Testing addTableName', function () {
        it('CASE 1: Works with correct input', function () {
            const params = {answer: 42};
            const addTableName = DB.__get__('extendParams');
            const expectedResult = {
                TableName: getTableName(),
                answer: params.answer
            };

            const output = addTableName(params);

            expect(output).to.deep.eql(expectedResult);
        });

        it('CASE 1: Able to override TableName', function () {
            const params = {TableName: '456'};
            const addTableName = DB.__get__('extendParams');
            const expectedResult = {
                TableName: params.TableName
            };

            const output = addTableName(params);

            expect(output).to.deep.eql(expectedResult);
        });
    });

    context('Testing putItem', function () {
        it('CASE 1: putItem adds item successfully', function* () {
            const getParams = function () {
                return {
                    answer: 42
                };
            };
            const getExpectedResult = function () {
                return {
                    answer: 41
                };
            };

            const runTest = function* () {
                const revert = DB
                    .__set__('client.putItem', function (p, callback) {
                        expect(p).to.deep.eql({
                            TableName: getTableName(),
                            answer: getParams().answer
                        });
                        return callback(null, getExpectedResult());
                    });
                try {
                    const output = yield DB.putItem(getParams());
                    revert();
                    return output;
                } catch (error) {
                    revert();
                    return error;
                }
            };
            const output = yield runTest();

            expect(output).to.deep.eql(getExpectedResult());
        });

        it('CASE 2: putItem fails', function* () {
            const getParams = function () {
                return {
                    answer: 42
                };
            };
            const getExpectedResult = function () {
                return new Error('Fail!');
            };

            const runTest = function* () {
                const revert = DB
                    .__set__('client.putItem', function (p, callback) {
                        expect(p).to.deep.eql({
                            TableName: getTableName(),
                            answer: getParams().answer
                        });
                        return callback(getExpectedResult());
                    });
                try {
                    const output = yield DB.putItem(getParams());
                    revert();
                    return output;
                } catch (error) {
                    revert();
                    return error;
                }
            };
            const output = yield runTest();

            expect(JSON.stringify(output)).to.be.eql(JSON.stringify(getExpectedResult()));
        });
    });

    context('Testing getItem', function () {
        it('CASE 1: getItem gets item successfully', function* () {
            const getParams = function () {
                return {
                    answer: 42
                };
            };
            const getExpectedResult = function () {
                return {
                    answer: 41
                };
            };

            const runTest = function* () {
                const revert = DB
                    .__set__('client.getItem', function (p, callback) {
                        expect(p).to.deep.eql({
                            TableName: getTableName(),
                            answer: getParams().answer
                        });
                        return callback(null, getExpectedResult());
                    });
                try {
                    const output = yield DB.getItem(getParams());
                    revert();
                    return output;
                } catch (error) {
                    revert();
                    return error;
                }
            };
            const output = yield runTest();

            expect(output).to.deep.eql(getExpectedResult());
        });

        it('CASE 2: getItem fails', function* () {
            const getParams = function () {
                return {
                    answer: 42
                };
            };
            const getExpectedResult = function () {
                return new Error('Fail!');
            };

            const runTest = function* () {
                const revert = DB
                    .__set__('client.getItem', function (p, callback) {
                        expect(p).to.deep.eql({
                            TableName: getTableName(),
                            answer: getParams().answer
                        });
                        return callback(getExpectedResult());
                    });
                try {
                    const output = yield DB.getItem(getParams());
                    revert();
                    return output;
                } catch (error) {
                    revert();
                    return error;
                }
            };
            const output = yield runTest();

            expect(JSON.stringify(output)).to.deep.eql(JSON.stringify(getExpectedResult()));
        });
    });

    context('Testing updateItem', function () {
        it('CASE 1: updateItem updates item successfully', function* () {
            const getParams = function () {
                return {
                    answer: 42
                };
            };
            const getExpectedResult = function () {
                return {
                    answer: 41
                };
            };

            const runTest = function* () {
                const revert = DB
                    .__set__('client.updateItem', function (p, callback) {
                        expect(p).to.deep.eql({
                            TableName: getTableName(),
                            answer: getParams().answer
                        });
                        return callback(null, getExpectedResult());
                    });
                try {
                    const output = yield DB.updateItem(getParams());
                    revert();
                    return output;
                } catch (error) {
                    revert();
                    return error;
                }
            };
            const output = yield runTest();

            expect(output).to.deep.eql(getExpectedResult());
        });

        it('CASE 2: updateItem fails', function* () {
            const getParams = function () {
                return {
                    answer: 42
                };
            };
            const getExpectedResult = function () {
                return new Error('Fail!');
            };

            const runTest = function* () {
                const revert = DB
                    .__set__('client.updateItem', function (p, callback) {
                        expect(p).to.deep.eql({
                            TableName: getTableName(),
                            answer: getParams().answer
                        });
                        return callback(getExpectedResult());
                    });
                try {
                    const output = yield DB.updateItem(getParams());
                    revert();
                    return output;
                } catch (error) {
                    revert();
                    return error;
                }
            };
            const output = yield runTest();

            expect(JSON.stringify(output)).to.deep.eql(JSON.stringify(getExpectedResult()));
        });
    });

    context('Testing query', function () {
        it('CASE 1: query gets item successfully', function* () {
            const getParams = function () {
                return {
                    answer: 42
                };
            };
            const getExpectedResult = function () {
                return {
                    answer: 41
                };
            };

            const runTest = function* () {
                const revert = DB
                    .__set__('client.query', function (p, callback) {
                        expect(p).to.deep.eql({
                            TableName: getTableName(),
                            answer: getParams().answer
                        });
                        return callback(null, getExpectedResult());
                    });
                try {
                    const output = yield DB.query(getParams());
                    revert();
                    return output;
                } catch (error) {
                    revert();
                    return error;
                }
            };
            const output = yield runTest();

            expect(output).to.deep.eql(getExpectedResult());
        });

        it('CASE 2: query fails', function* () {
            const getParams = function () {
                return {
                    answer: 42
                };
            };
            const getExpectedResult = function () {
                return new Error('Fail!');
            };

            const runTest = function* () {
                const revert = DB
                    .__set__('client.query', function (p, callback) {
                        expect(p).to.deep.eql({
                            TableName: getTableName(),
                            answer: getParams().answer
                        });
                        return callback(getExpectedResult());
                    });
                try {
                    const output = yield DB.query(getParams());
                    revert();
                    return output;
                } catch (error) {
                    revert();
                    return error;
                }
            };
            const output = yield runTest();

            expect(JSON.stringify(output)).to.deep.eql(JSON.stringify(getExpectedResult()));
        });
    });
});
