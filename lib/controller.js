'use strict';

const _ = require('lodash');

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
        Item: _.omitBy({
            username: _.get(req.body, 'message.chat.username'),
            firstname: _.get(req.body, 'message.chat.first_name'),
            lastname: _.get(req.body, 'message.chat.last_name'),
            chatId: chatId,
            active: true
        }, _.isNil)
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
    const params = {
        Item: {
            username: _.get(req.body, 'message.chat.username'),
            active: false
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
            username: _.get(req.body, 'message.chat.username')
        }
    };
    const handleItem = function (response) {
        const item = response.Item || {};
        return item.active ? Promise.resolve() : Promise.reject(new Error('Failed to send message'));
    };
    const text = _.get(req.body, 'message.text', '');
    const recipient = (text.split(' ')[1] || '').split(/\n/)[0] || '';
    const message = text.split(/\n/)[1] || '';
    const params2 = {
        Key: {
            username: recipient
        }
    };
    const getItem = DB.getItem.bind(null, params2);
    const sendTelegramMessage = function (response) {
        const item = response.Item || {};
        return item.active ? Telegram.sendMessage(item.chatId, message) : Promise.reject(new Error('Cannot messsage user'));
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
            .then(handleItem)
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

function processCircle(req, res) {
    const env = Config.getEnv();
    const payload = req.body.payload || {};
    const timestamp = (payload.stop_time || '').replace(/\..+$/, '+00:00');
    const shouldSendMessage = ['infrastructure_fail', 'timedout', 'failed'].indexOf(payload.outcome) !== -1;

    if (shouldSendMessage) {
        const message = `Failed build on CircleCI\n
            username: ${payload.username}
            repository: ${payload.reponame}
            build: ${payload.build_url}
            outcome: ${payload.outcome}
            timestamp: ${timestamp}`.replace(/ +/g, ' ');
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
            username: req.body.username
        }
    };
    const handleItem = function (response) {
        const item = response.Item || {};
        if (item.active) {
            return Telegram
                .sendMessage(item.chatId, req.body.text);
        }
        return Promise.resolve();
    };
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return DB
        .getItem(params)
        .then(handleItem)
        .then(successResponse)
        .catch(failResponse);
}

module.exports = {
    whoami: whoami,
    processTelegram: processTelegram,
    processCircle: processCircle,
    sendMessage: sendMessage
};
