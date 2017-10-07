'use strict';

const fs = require('fs');
const path = require('path');

module.exports.getInput = function () {
    return {
        requestContext: {
            resourcePath: '/favicon.ico',
            httpMethod: 'GET'
        }
    };
};

module.exports.getAssertions = function () {
    return fs.readFileSync(path.join(__dirname, '..', '..', 'lib', 'logo.png'))
        .toString('base64');
};
