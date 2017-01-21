'use strict';

const DOC = require('dynamodb-doc');

const client = new DOC.DynamoDB();

function execute(functionName, params) {
    return new Promise(function (resolve, reject) {
        client[functionName](params, function (error, result) {
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
