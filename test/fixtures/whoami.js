'use strict';

module.exports.getInput = function () {
    return {
        requestContext: {
            resourcePath: '/',
            httpMethod: 'GET'
        }
    };
};

module.exports.getAssertions = function () {
    return {
        'meta.code': 200,
        data: {}
    };
};
