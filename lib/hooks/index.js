'use strict';

const CircleCI = require('./circleci');
const Telegram = require('./telegram');

module.exports = {
    circleci: CircleCI,
    telegram: Telegram
};
