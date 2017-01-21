'use strict';

module.exports.getInput = function () {
    return {
        requestContext: {
            resourcePath: '/message',
            httpMethod: 'POST'
        }
    };
};

module.exports.getAssertions = function () {
    return {
        'meta.code': 200,
        data: {}
    };
};
