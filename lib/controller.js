'use strict';

/* eslint complexity: off */

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const DB = require('./db');
const Config = require('./config');
const Hook = require('./hooks');
const Interface = require('./interface');
const Telegram = require('./telegram');

const packageJson = require('../package.json');

// GET /
function whoami(req) {
    const config = Config.get();

    return Interface.respond(this, 200, {
        name: packageJson.name,
        version: config.VERSION
    });
}

// GET /favicon.ico
function getFavicon(req) {
    return fs.readFileSync(path.join(__dirname, 'logo.png'));
}

// POST /hooks/circle
function processCircleCIHook(req) {
    const body = req.body;

    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return Hook.circleci
        .processHook('knightwatcher', body)
        .then(successResponse)
        .catch(failResponse);
}

// POST /v1/{botName}/hooks/{hookType}
function processHook(req) {
    const botName = req.pathParams.botName;
    const hookType = req.pathParams.hookType;
    const body = req.body;
    const queryString = req.queryString;

    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);

    return Hook[hookType]
        .processHook(botName, body, queryString)
        .then(successResponse)
        .catch(failResponse);
}

// POST /v1/{botName}/messages
function sendMessage(req) {
    const botName = req.pathParams.botName;
    const config = Config.get(botName);
    const body = req.body;

    const params = {
        IndexName: config.USERNAME_INDEX,
        ExpressionAttributeValues: {
            ':username': {
                S: req.body.username
            },
            ':active': {
                N: '1'
            }
        },
        ProjectionExpression: 'chatId',
        KeyConditionExpression: 'username = :username AND active = :active'
    };
    const handleItem = function (response) {
        const chatId = _.get(response, 'Items.0.chatId.N');
        return Telegram.sendMessage(botName, chatId, body.text);
    };

    const successResponse = Interface.respond.bind(null, this, 200, {});
    const failResponse = Interface.respond.bind(null, this, 500);
    return DB
        .query(params)
        .then(handleItem)
        .then(successResponse)
        .catch(failResponse);
}

module.exports = {
    whoami,
    getFavicon,
    processCircleCIHook,
    processHook,
    sendMessage
};
