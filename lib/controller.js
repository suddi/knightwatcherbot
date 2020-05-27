'use strict';

/* eslint complexity: off */

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const DB = require('./db');
const Config = require('./config');
const Interface = require('./interface');
const Telegram = require('./telegram');

function getCommand(command) {
    const commands = {
        '/add': {
            fn: addUser,
            help: 'add yourself as a user of knightwatcher'
        },

        '/remove': {
            fn: removeUser,
            help: 'remove yourself as a user of knightwatcher'
        },

        '/message': {
            fn: messageUser
        },

        '/start': {
            fn: displayInfo
        },

        '/help': {
            fn: displayInfo,
            help: 'display help information'
        }
    };
    if (command) {
        return commands[command] ? commands[command] : {
            fn: handleUnknownCommand,
            help: 'N/A'
        };
    }
    return commands;
}

function getDisplayMessage() {
    const message = 'Welcome to KnightWatcher! A bot for all your alert needs.\n';
    return _.reduce(getCommand(), function (prev, value, key) {
        if (value.help) {
            return `${prev}\n${key} - ${value.help}`;
        }
        return prev;
    }, message);
}

function whoami(req, res) {
    return Interface.respond(this, 200);
}

function authorize(req, res) {
    const env = Config.getEnv();
    return req.queryString.apiKey === env.TELEGRAM_API_KEY;
}

function sendUnauthorized(req, res) {
    const chatId = _.get(req.body, 'message.chat.id');
    const message = 'You do not have access to this resource.';
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return Telegram
        .sendMessage(chatId, message)
        .then(successResponse)
        .catch(failResponse);
}

function handleUnknownCommand(req, res) {
    const chatId = _.get(req.body, 'message.chat.id');
    const message = 'I don\'t know what to do with that. Please see /help for a full list of commands.';
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return Telegram
        .sendMessage(chatId, message)
        .then(successResponse)
        .catch(failResponse);
}

function displayInfo(req, res) {
    const chatId = _.get(req.body, 'message.chat.id');
    const message = getDisplayMessage();
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return Telegram
        .sendMessage(chatId, message)
        .then(successResponse)
        .catch(failResponse);
}

function addUser(req, res) {
    const chatId = _.get(req.body, 'message.chat.id');
    const params = {
        Item: {
            chatId: { N: chatId },
            username: { S: _.get(req.body, 'message.chat.username', '') },
            firstName: { S: _.get(req.body, 'message.chat.first_name', '') },
            lastName: { S: _.get(req.body, 'message.chat.last_name', '') },
            active: { N: 1 }
        }
    };
    const sendTelegramMessage = Telegram.sendMessage.bind(
        null, chatId, 'Added user'
    );
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return DB
        .putItem(params)
        .then(sendTelegramMessage)
        .then(successResponse)
        .catch(failResponse);
}

function removeUser(req, res) {
    const chatId = _.get(req.body, 'message.chat.id');
    const params = {
        Item: {
            chatId: { N: chatId },
            active: { N: 0 }
        }
    };
    const sendTelegramMessage = Telegram.sendMessage.bind(
        null, _.get(req.body, 'message.chat.id'), 'Removed user'
    );
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return DB
        .updateItem(params)
        .then(sendTelegramMessage)
        .then(successResponse)
        .catch(failResponse);
}

function messageUser(req, res) {
    const chatId = _.get(req.body, 'message.chat.id');
    const params1 = {
        Key: {
            chatId: { N: chatId },
            active: { N: 1 }
        }
    };
    const text = _.get(req.body, 'message.text', '');
    const recipient = (text.split(' ')[1] || '').split(/\n/)[0] || '';
    const message = text.split(/\n/)[1] || '';
    const params2 = {
        Key: {
            username: { S: recipient },
            active: { N: 1 }
        }
    };
    const getItem = DB.getItem.bind(null, params2);
    const sendTelegramMessage = function (response) {
        const recipientChatId = _.get(response, 'Item.chatId.N');
        return Telegram.sendMessage(recipientChatId, message);
    };
    const sendSuccessMessage = Telegram.sendMessage.bind(
        null, chatId, 'Message sent.'
    );
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);
    const messageAndFailResponse = function () {
        return Telegram
            .sendMessage(chatId, 'Failed to send message.')
            .then(successResponse)
            .catch(failResponse);
    };

    if (recipient && message) {
        return DB
            .getItem(params1)
            .then(getItem)
            .then(sendTelegramMessage)
            .then(sendSuccessMessage)
            .then(successResponse)
            .catch(messageAndFailResponse);
    }
    return Telegram
        .sendMessage(chatId, '/message must be in the form\n\n/message <recipient>\n<message>')
        .then(successResponse)
        .catch(failResponse);
}

function processTelegram(req, res) {
    if (authorize(req, res)) {
        const command = _.get(req.body, 'message.text', '').split(' ')[0];
        return getCommand(command).fn.call(this, req, res);
    }
    return sendUnauthorized.call(this, req, res);
}

function processCircleCI(req, res) {
    const env = Config.getEnv();
    const payload = req.body.payload || {};
    const timestamp = (payload.stop_time || '').replace(/\..+$/, 'Z');
    const shouldSendMessage = ['infrastructure_fail', 'timedout', 'failed'].indexOf(payload.outcome) !== -1;

    if (shouldSendMessage) {
        const message = `Failed build on CircleCI\n
            username: \`${payload.username}\`
            repository: \`${payload.reponame}\`
            link: ${payload.build_url}
            outcome: \`${payload.outcome}\`
            timestamp: \`${timestamp}\``
            .replace(/ +/g, ' ');
        const successResponse = Interface.respond.bind(null, this, 200, {});
        const failResponse = Interface.respond.bind(null, this, 500);

        return Telegram
            .sendMessage(env.DEFAULT_NOTIFIER, message)
            .then(successResponse)
            .catch(failResponse);
    }

    return Interface.respond(this, 200);
}

function sendMessage(req, res) {
    const params = {
        Key: {
            username: { S: req.body.username },
            active: { N: 1 }
        }
    };
    const handleItem = function (response) {
        const chatId = _.get(response, 'Item.chatId.N');
        return Telegram.sendMessage(chatId, req.body.text);
    };
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return DB
        .getItem(params)
        .then(handleItem)
        .then(successResponse)
        .catch(failResponse);
}

function getFavicon(req) {
    return fs.readFileSync(path.join(__dirname, 'logo.png'));
}

module.exports = {
    whoami: whoami,
    processTelegram: processTelegram,
    processCircleCI: processCircleCI,
    sendMessage: sendMessage,
    getFavicon: getFavicon
};
