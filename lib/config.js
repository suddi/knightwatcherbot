'use strict';

function get() {
    return {
        REGION: process.env.AWS_REGION || '',
        TABLENAME: process.env.TABLENAME || '',
        USERNAME_INDEX: process.env.USERNAME_INDEX || '',

        KNIGHTWATCHERBOT_TELEGRAM_API_KEY: process.env.KNIGHTWATCHERBOT_TELEGRAM_API_KEY || '',
        MEMORIESBOT_TELEGRAM_API_KEY: process.env.MEMORIESBOT_TELEGRAM_API_KEY || '',
        WEBHOOK_API_KEY: process.env.WEBHOOK_API_KEY || '',
        DEFAULT_NOTIFIER: parseInt(process.env.DEFAULT_NOTIFIER, 10) || 0
    };
}

module.exports = {
    get
};
