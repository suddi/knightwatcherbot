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

function execute(func, params) {
    return new Promise(function (resolve, reject) {
        return func(addTableName(params), function (error, result) {
            return error ? reject(error) : resolve(result);
        });
    });
}

module.exports.putItem = function (params) {
    return execute(client.putItem, params);
};

module.exports.getItem = function (params) {
    return execute(client.getItem, params);
};

module.exports.updateItem = function (params) {
    return execute(client.updateItem, params);
};
