'use strict';

const DOC = require('dynamodb-doc');

const Config = require('./config');

const client = new DOC.DynamoDB();

function addTableName(params) {
    return Object.assign(
        {
            TableName: Config.getEnv().TABLENAME
        },
        params
    );
}

function execute(functionName, params) {
    return new Promise(function (resolve, reject) {
        return client[functionName](addTableName(params), function (error, result) {
            return error ? reject(error) : resolve(result);
        });
    });
}

module.exports.putItem = function (params) {
    return execute('putItem', params);
};

module.exports.getItem = function (params) {
    return execute('getItem', params);
};

module.exports.updateItem = function (params) {
    return execute('updateItem', params);
};
