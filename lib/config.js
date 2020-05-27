'use strict';

function get() {
    return {
        REGION: process.env.AWS_REGION || '',
        TABLENAME: process.env.TABLENAME || '',
        USERNAME_INDEX: process.env.USERNAME_INDEX || '',

        TELEGRAM_API_KEY: process.env.TELEGRAM_API_KEY || '',
        DEFAULT_NOTIFIER: parseInt(process.env.DEFAULT_NOTIFIER, 10) || 0
    };
}

module.exports = {
    get: get
};
