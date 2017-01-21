'use strict';

const _ = require('lodash');

const DB = require('./db');
const Interface = require('./interface');
const Telegram = require('./telegram');

function whoami(req, res) {
    return Interface.respond(this, 200);
}

function handleUnknownCommand(req, res) {
    const chatId = _.get(req.body, 'message.chat.id');
    const command = _.get(req.body, 'message.text', '').split(' ')[0];
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return Telegram
        .sendMessage(chatId, `Unknown command: ${command}`)
        .then(successResponse)
        .catch(failResponse);
}

function displayInfo(req, res) {
    const chatid = _.get(req.body, 'message.chat.id');
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return Telegram
        .sendMessage(chatid, 'Welcome to KnightWatcher! A bot for all you alert needs')
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
    switch (command) {
        case '/start':
            return displayInfo.call(this, req, res);
        case '/add':
            return addUser.call(this, req, res);
        case '/delete':
            return deleteUser.call(this, req, res);
        default:
            return handleUnknownCommand.call(this, req, res);
    }
}

function sendMessage(req, res) {
    const params = {
        username: req.body.username
    };
    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return DB
        .getItem(params)
        .then(function (response) {
            return Telegram.sendMessage(response.chatid, req.body.text);
        })
        .then(successResponse)
        .catch(failResponse);
}

module.exports = {
    whoami: whoami,
    processCommand: processCommand,
    sendMessage: sendMessage
};
