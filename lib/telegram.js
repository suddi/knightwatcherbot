'use strict';

/* eslint camelcase: off */

const axios = require('axios');

const Config = require('./config');

function formUrl(method) {
    const env = Config.getEnv();
    return `https://api.telegram.org/bot${env.TELEGRAM_API_KEY}/${method}`;
}

function sendMessage(chatId, text) {
    return axios
        .post(formUrl('sendMessage'), {
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown'
        });
}

module.exports = {
    sendMessage: sendMessage
};
