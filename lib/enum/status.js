'use strict';

module.exports.get = function () {
    return {
        200: {
            code: 200,
            message: 'OK',
            details: [],
            retryable: true
        },

        500: {
            code: 500,
            message: 'Internal Error',
            details: [],
            retryable: false
        }
    };
};
