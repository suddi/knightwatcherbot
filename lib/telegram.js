'use strict';

/* eslint camelcase: off */

const axios = require('axios');

const Config = require('./config');

function formUrl(botName, method) {
    const config = Config.get();
    const apiKey = config[`${botName.toUpperCase()}_TELEGRAM_API_KEY`];

    return `https://api.telegram.org/bot${apiKey}/${method}`;
}

function sendMessage(botName, chatId, text) {
    const url = formUrl(botName, 'sendMessage');
    return axios
        .post(url, {
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown'
        });
}

module.exports = {
    sendMessage
};
