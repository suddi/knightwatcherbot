'use strict';

const AWS = require('aws-sdk');

const Config = require('./config');

AWS.config.update({
    region: Config.getEnv().AWS_REGION
});
const client = new AWS.DynamoDB();

function extendParams(params) {
    return Object.assign(
        {
            TableName: Config.getEnv().TABLENAME
        },
        params
    );
}

function execute(functionName, params) {
    return new Promise(function (resolve, reject) {
        return client[functionName](extendParams(params), function (error, result) {
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
