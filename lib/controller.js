'use strict';

const _ = require('lodash');

const DB = require('./db');
const Interface = require('./interface');
const Telegram = require('./telegram');

function getCommand(command) {
    const commands = {
        '/add': {
            fn: addUser,
            help: 'add yourself as a user of knightwatcher'
        },

        '/remove': {
            fn: deleteUser,
            help: 'remove yourself as a user of knightwatcher'
        },

        '/start': {
            fn: displayInfo,
            help: 'get started with knightwatcher'
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
        if (key === '/start') {
            return prev;
        }
        return `${prev}\n${key} - ${value.help}`;
    }, message);
}

function whoami(req, res) {
    return Interface.respond(this, 200);
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
    const chatid = _.get(req.body, 'message.chat.id');
    const message = getDisplayMessage();
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return Telegram
        .sendMessage(chatid, message)
        .then(successResponse)
        .catch(failResponse);
}

function addUser(req, res) {
    const item = {
        username: _.get(req.body, 'message.chat.username'),
        firstname: _.get(req.body, 'message.chat.first_name'),
        lastname: _.get(req.body, 'message.chat.last_name'),
        chatid: _.get(req.body, 'message.chat.id'),
        active: true
    };
    const params = {
        TableName: req.env.tableName,
        Item: item
    };
    const sendTelegramMessage = Telegram.sendMessage.bind(
        null, item.chatid, 'Added user'
    );
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return DB
        .putItem(params)
        .then(sendTelegramMessage)
        .then(successResponse)
        .catch(failResponse);
}

function deleteUser(req, res) {
    const item = {
        username: _.get(req.body, 'message.chat.username'),
        active: false
    };
    const params = {
        TableName: req.env.tableName,
        Item: item
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

function processCommand(req, res) {
    const command = _.get(req.body, 'message.text', '').split(' ')[0];
    return getCommand(command).fn.call(this, req, res);
}

function sendMessage(req, res) {
    const key = {
        username: req.body.username
    };
    const params = {
        TableName: req.env.tableName,
        Key: key
    };
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);
    const handleItem = function (response) {
        const item = response.Item || {};
        if (item.active) {
            return Telegram
                .sendMessage(response.Item.chatid, req.body.text);
        }
        return Promise.resolve();
    };

    return DB
        .getItem(params)
        .then(handleItem)
        .then(successResponse)
        .catch(failResponse);
}

module.exports = {
    whoami: whoami,
    processCommand: processCommand,
    sendMessage: sendMessage
};
