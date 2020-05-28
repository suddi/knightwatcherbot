'use strict';

function get(botName) {
    const botNameVar = (botName || '').toUpperCase();
    return {
        ENV: process.env.NODE_ENV,

        REGION: process.env.AWS_REGION,
        TABLENAME: process.env.TABLENAME,
        USERNAME_INDEX: process.env.USERNAME_INDEX,

        [`${botNameVar}_TELEGRAM_API_KEY`]: process.env[`${botNameVar}_TELEGRAM_API_KEY`] || '',
        [`${botNameVar}_WEBHOOK_API_KEY`]: process.env[`${botNameVar}_WEBHOOK_API_KEY`] || '',
        DEFAULT_NOTIFIER: parseInt(process.env.DEFAULT_NOTIFIER, 10)
    };
}

module.exports = {
    get
};
