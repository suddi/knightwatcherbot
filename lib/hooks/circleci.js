'use strict';

const Config = require('../config');
const Telegram = require('../telegram');

function processHook(botName, body) {
    const config = Config.get(botName);
    const payload = body.payload || {};
    const timestamp = (payload.stop_time || '').replace(/\..+$/, 'Z');
    const shouldSendMessage = [
        'infrastructure_fail',
        'timedout',
        'failed'
    ].indexOf(payload.outcome) !== -1;

    if (!shouldSendMessage) {
        return Promise.resolve();
    }

    const message = `Failed build on CircleCI\n
        username: \`${payload.username}\`
        repository: \`${payload.reponame}\`
        link: ${payload.build_url}
        outcome: \`${payload.outcome}\`
        timestamp: \`${timestamp}\``.replace(/ +/g, ' ');

    return Telegram.sendMessage(botName, config.DEFAULT_NOTIFIER, message);
}

module.exports = {
    processHook
};
