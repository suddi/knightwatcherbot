'use strict';

const _ = require('lodash');

const Config = require('../config');
const DB = require('../db');
const Logger = require('../logger');
const Telegram = require('../telegram');

// /add
function addUser(botName, body) {
    const chatId = _.get(body, 'message.chat.id');
    const messageType = _.get(body, 'message.chat.type');
    const params = {
        Item: {
            chatId: { N: chatId.toString() },
            username: { S: _.get(body, 'message.chat.username', `${messageType}-${chatId}`) },
            firstName: { S: _.get(body, 'message.chat.first_name', '') },
            lastName: { S: _.get(body, 'message.chat.last_name', '') },
            active: { N: '1' }
        },
        ReturnConsumedCapacity: 'NONE',
        ReturnItemCollectionMetrics: 'NONE',
        ReturnValues: 'NONE'
    };
    const sendTelegramMessage = Telegram.sendMessage.bind(
        null, botName, chatId, 'Added user'
    );
    return DB
        .putItem(params)
        .then(sendTelegramMessage);
}

// /remove
function removeUser(botName, body) {
    const chatId = _.get(body, 'message.chat.id');
    const params = {
        Key: {
            chatId: { N: chatId.toString() },
            active: { N: '1' }
        },
        ExpressionAttributeNames: {
            '#active': 'active'
        },
        ExpressionAttributeValues: {
            ':active': { N: '0' }
        },
        ReturnValues: 'NONE',
        UpdateExpression: 'SET #active = :active'
    };
    const sendTelegramMessage = Telegram.sendMessage.bind(
        null, botName, chatId, 'Removed user'
    );

    return DB
        .updateItem(params)
        .then(sendTelegramMessage);
}

// /message
function messageUser(botName, body) {
    const config = Config.get();
    const chatId = _.get(body, 'message.chat.id');

    const params1 = {
        Key: {
            chatId: { N: chatId.toString() },
            active: { N: '1' }
        }
    };
    const text = _.get(body, 'message.text', '');
    const recipient = (text.split(' ')[1] || '').split(/\n/)[0] || '';
    const message = text.split(/\n/)[1] || '';
    const params2 = {
        IndexName: config.USERNAME_INDEX,
        ExpressionAttributeValues: {
            ':username': {
                S: recipient
            },
            ':active': {
                N: '1'
            }
        },
        ProjectionExpression: 'chatId',
        KeyConditionExpression: 'username = :username AND active = :active'
    };
    const query = DB.query.bind(null, params2);
    const sendTelegramMessage = function (response) {
        const recipientChatId = _.get(response, 'Items.0.chatId.N');
        return Telegram.sendMessage(botName, recipientChatId, message);
    };
    const sendSuccessMessage = Telegram.sendMessage.bind(
        null, botName, chatId, 'Message sent'
    );
    const messageAndFailResponse = function (e) {
        return Telegram.sendMessage(botName, chatId, 'Failed to send message');
    };

    if (recipient && message) {
        return DB
            .getItem(params1)
            .then(query)
            .then(sendTelegramMessage)
            .then(sendSuccessMessage)
            .catch(messageAndFailResponse);
    }

    const errorMessage = '/message must be in the form\n\n/message <recipient>\n<message>';
    return Telegram.sendMessage(botName, chatId, errorMessage);
}

// /start
// /help
function displayInfo(botName, body) {
    const getDisplayMessage = function () {
        const message = {
            knightwatcher: 'Welcome to Knightwatcher! A bot for all your alert needs\n',
            memoriesbot: 'Welcome to MemoriesBot! Revisit memories and get reminded everyday via Telegram.\n'
        };
        return _.reduce(getCommand(), function (prev, value, key) {
            return `${prev}\n${key} - ${value.help}`;
        }, message[botName] || message.knightwatcher);
    };

    const chatId = _.get(body, 'message.chat.id');
    const message = getDisplayMessage();

    return Telegram.sendMessage(botName, chatId, message);
}

// /unknown
function handleUnknownCommand(botName, body) {
    const chatId = _.get(body, 'message.chat.id');
    const message = 'I don\'t know what to do with that. Please see /help for a full list of commands';

    return Telegram.sendMessage(botName, chatId, message);
}

function getCommand(botName, command) {
    const commands = {
        '/add': {
            fn: addUser,
            help: `Add yourself as a user`,
            enabled: true
        },

        '/remove': {
            fn: removeUser,
            help: `Remove yourself as a user`,
            enabled: true
        },

        '/message': {
            fn: messageUser,
            help: `Message another user`,
            enabled: false
        },

        '/start': {
            fn: displayInfo,
            help: `Get started`,
            enabled: true
        },

        '/help': {
            fn: displayInfo,
            help: 'Display help information',
            enabled: true
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

function processHook(botName, body, queryString) {
    const config = Config.get(botName);
    const authorize = function () {
        return queryString.apiKey === config[`${botName.toUpperCase()}_WEBHOOK_API_KEY`];
    };

    if (authorize()) {
        const command = _.get(body, 'message.text', '').split(' ')[0];
        const commandHandler = getCommand(botName, command);

        Logger.info({
            command,
            chatId: _.get(body, 'message.chat.id'),
            messageType: _.get(body, 'message.chat.type')
        });
        return commandHandler.fn(botName, body);
    }

    const chatId = _.get(body, 'message.chat.id');
    const message = 'You do not have access to this resource';
    return Telegram.sendMessage(botName, chatId, message);
}

module.exports = {
    processHook,
    getCommand
};
