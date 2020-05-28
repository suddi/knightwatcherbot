'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const Logger = require('../lib/logger');
const Telegram = require('../lib/hooks/telegram');

function execute() {
    const botName = process.argv[2];
    if (!botName) {
        return Logger.fatal('Please provide a botName to generate a commands JSON file');
    }
    const commands = Telegram.getCommand(botName);
    const commandsArray = _.reduce(commands, function (obj, {help, enabled}, command) {
        if (enabled) {
            return obj.concat([{
                command: command.replace('/', ''),
                description: help
            }]);
        }
        return obj;
    }, []);
    const obj = JSON.stringify({ commands: commandsArray });
    const filePath = path.join(__dirname, `${botName}.json`);
    fs.writeFileSync(filePath, obj);
    return Logger.info(`Commands JSON file generated at ${filePath}`);
}

if (!module.parent) {
    execute();
}
